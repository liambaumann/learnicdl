#!/usr/bin/env node
// Single-submodule import driver. Run by the project owner only - this script
// never creates or touches `modules`; module management is entirely manual.
//
// Each run imports exactly ONE legacy LESSON as ONE PocketBase submodule,
// attached to an EXISTING module you specify explicitly. It fills that one
// submodule with its questions (text, images, answer options). Nothing else
// is touched - no other submodules, no modules, no bulk/full-database mode.
//
// Required:
//   --lesson=<LEGACY LESSON.ID>   which legacy lesson to import
//   --module=<PocketBase module record id>   which existing module to attach it to
//
// Defaults to a dry run (prints what it *would* do, no PocketBase writes);
// pass --commit to actually write. Safe to re-run in commit mode - the
// submodule/questions/options all upsert by legacy_id, so re-running after
// fixing something won't create duplicates.
//
// To import a different lesson, just change --lesson= (and --module= if it
// belongs under a different module) on the command line - nothing else in
// this script needs editing.
//
// Not implemented: NEXT_QUESTION (no PocketBase equivalent field exists yet -
// undecided whether it's needed).

import { openLegacyDb, listTables } from "./lib/db.mjs";
import { PocketBaseAdminClient } from "./lib/pocketbase.mjs";
import { decodeGraphicContent, normalizeForPocketBase } from "./lib/images.mjs";
import {
  IMAGE_SLOTS,
  mapLesson,
  mapQuestionText,
  mapQuestionType,
  loadAnswerOptions,
  resolveGraphic
} from "./lib/transform.mjs";

const commit = process.argv.includes("--commit");
const lessonArg = process.argv.find((a) => a.startsWith("--lesson="));
const moduleArg = process.argv.find((a) => a.startsWith("--module="));

if (!lessonArg || !moduleArg) {
  throw new Error(
    "Usage: node import.mjs --lesson=<LEGACY LESSON.ID> --module=<PocketBase module id> [--commit]\n" +
      "Both --lesson and --module are required. This script only ever imports one submodule per run, " +
      "attached to a module you already created - it never creates or modifies modules itself."
  );
}
const lessonId = Number(lessonArg.split("=")[1]);
const moduleId = moduleArg.split("=")[1];

const PB_URL = process.env.PB_URL ?? "http://127.0.0.1:8090";
const PB_EMAIL = process.env.PB_EMAIL;
const PB_PASSWORD = process.env.PB_PASSWORD;

if (commit && (!PB_EMAIL || !PB_PASSWORD)) {
  throw new Error("Set PB_EMAIL and PB_PASSWORD env vars (a superuser account) before running with --commit.");
}

console.log(
  commit
    ? "Running in COMMIT mode - this WILL write to PocketBase."
    : "Running in DRY-RUN mode - no writes will be made (pass --commit to actually import)."
);
console.log(`Importing legacy LESSON.ID=${lessonId} as a submodule under existing module ${moduleId}.`);

const db = openLegacyDb();
const tables = listTables(db);
for (const required of ["QUESTION", "GRAPHIC", "LESSON", "ANSWER"]) {
  if (!tables.includes(required)) throw new Error(`legacy.sqlite is missing table "${required}"`);
}

const lesson = db.prepare("SELECT * FROM LESSON WHERE ID = ?").get(lessonId);
if (!lesson) throw new Error(`No LESSON row with ID=${lessonId} in legacy.sqlite`);

let client = null;
if (commit) {
  client = new PocketBaseAdminClient({ baseUrl: PB_URL, email: PB_EMAIL, password: PB_PASSWORD });
  await client.authenticate();

  try {
    await client.getRecord("modules", moduleId);
  } catch {
    throw new Error(
      `--module=${moduleId} does not exist in PocketBase. This script never creates modules - create it yourself first.`
    );
  }
}

// --- Stage: the one submodule ------------------------------------------------
const submoduleFields = { ...mapLesson(lesson), module: moduleId };
console.log(commit ? "upserting submodule" : "[dry-run] would upsert submodule", submoduleFields);

let submoduleId;
if (commit) {
  const rec = await client.upsert("submodules", String(lesson.ID), submoduleFields);
  submoduleId = rec.id;
}

// --- Stage: its questions + their images + their options --------------------
const questions = db.prepare("SELECT * FROM QUESTION WHERE LESSONID = ?").all(lessonId);
console.log(`\n${questions.length} legacy questions found for this lesson.`);

let imported = 0;
let skipped = 0;

for (const q of questions) {
  let type;
  try {
    type = mapQuestionType(q.TYPE);
  } catch (err) {
    console.warn(`QUESTION.ID=${q.ID}: ${err.message} - skipping`);
    skipped++;
    continue;
  }

  const options = loadAnswerOptions(db, q.ID);
  if (options.length === 0) {
    console.warn(`QUESTION.ID=${q.ID}: no ANSWER rows found - skipping (question would have no options)`);
    skipped++;
    continue;
  }

  const { fields: textFields, warnings: colorWarnings } = mapQuestionText(q);
  for (const w of colorWarnings) {
    console.warn(
      `WARNING QUESTION.ID=${q.ID} ${w.field}: near-white color ${w.originalColor} found and stripped - ` +
        `this text may have been intentionally hidden (white-on-white), check it wasn't meant to stay invisible.`
    );
  }

  const fields = {
    ...textFields,
    type: type ?? undefined,
    submodule: commit ? submoduleId : undefined,
    legacy_id: String(q.ID)
  };

  const files = {};
  for (const slot of IMAGE_SLOTS) {
    const resolved = resolveGraphic(db, { graphicId: q[slot.graphicIdCol], filename: q[slot.filenameCol] });
    if (!resolved) continue;

    const buffer = decodeGraphicContent(resolved.row.CONTENT);
    if (!buffer) continue;

    try {
      const normalized = await normalizeForPocketBase(buffer, { filenameHint: resolved.row.FILENAME });
      files[slot.pbField] = {
        buffer: normalized.buffer,
        mime: normalized.mime,
        filename: `${resolved.row.ID}.${normalized.ext}`
      };
    } catch (err) {
      console.warn(`QUESTION.ID=${q.ID} ${slot.pbField} (GRAPHIC.ID=${resolved.row.ID}): ${err.message} - skipping image`);
    }
  }

  console.log(commit ? `upserting question legacy_id=${q.ID}` : `[dry-run] would upsert question legacy_id=${q.ID}`, {
    ...fields,
    images: Object.keys(files),
    options: options.length
  });

  if (commit) {
    const questionRec = await client.upsert("questions", String(q.ID), fields, files);
    for (const option of options) {
      // ANSWER.ID is already globally unique on its own (checked: it's the
      // ANSWER table's primary key) - the lookup key passed to upsert() MUST
      // match what actually gets stored in the legacy_id field below, or
      // findByLegacyId can never find the existing record and every re-run
      // creates a fresh duplicate instead of updating in place.
      await client.upsert("question_options", String(option.legacy_id), {
        question: questionRec.id,
        text: option.text,
        is_correct: option.is_correct,
        legacy_id: String(option.legacy_id)
      });
    }
  }
  imported++;
}

console.log(`\n${commit ? "Imported" : "Would import"} ${imported} questions, skipped ${skipped}.`);

// --- Stage: NEXT_QUESTION ----------------------------------------------------
// TODO: decide whether this needs a PocketBase field at all before implementing
// the second pass that resolves legacy NEXT_QUESTION ids to PB record ids.
