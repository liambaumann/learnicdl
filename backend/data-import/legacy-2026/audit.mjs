#!/usr/bin/env node
// Read-only dry run: reports on the legacy data in legacy.sqlite without
// touching PocketBase at all. Run this first, review the output, and only
// move on to `npm run import -- --commit` once the numbers make sense.
// See README.md for the full pipeline and current status of this script.

import { writeFileSync } from "node:fs";
import { openLegacyDb, listTables, requireTable } from "./lib/db.mjs";
import { decodeGraphicContent, sniffImageMime, ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./lib/images.mjs";
import { IMAGE_SLOTS } from "./lib/transform.mjs";

const db = openLegacyDb();
const tables = listTables(db);
console.log("Tables found in legacy.sqlite:", tables.join(", "));

const report = { tables, generatedAt: new Date().toISOString() };

for (const expected of ["QUESTION", "GRAPHIC"]) {
  requireTable(db, expected);
}
for (const maybeMissing of ["QUESTION_POOL", "LESSON", "ANSWER"]) {
  if (!tables.includes(maybeMissing)) {
    console.warn(
      `WARNING: table "${maybeMissing}" not found - module/submodule mapping (Stage 2) can't run without it.`
    );
  }
}

// --- QUESTION / GRAPHIC audit (columns known from the sample data) ---

const questions = db.prepare("SELECT * FROM QUESTION").all();
const graphics = db.prepare("SELECT * FROM GRAPHIC").all();
console.log(`\nQUESTION rows: ${questions.length}`);
console.log(`GRAPHIC rows: ${graphics.length}`);

report.questionCount = questions.length;
report.graphicCount = graphics.length;

// TYPE / STATUS histograms
const typeHistogram = histogram(questions, "TYPE");
const statusHistogram = histogram(questions, "STATUS");
console.log("\nTYPE code histogram (map these in lib/transform.mjs QUESTION_TYPE_MAP):", typeHistogram);
console.log("STATUS code histogram (confirm meaning - e.g. does a code mean draft/unpublished?):", statusHistogram);
report.typeHistogram = typeHistogram;
report.statusHistogram = statusHistogram;

// FK inconsistency + orphan + unresolved checks per image slot
const graphicById = new Map(graphics.map((g) => [g.ID, g]));
const graphicByFilename = new Map(graphics.map((g) => [g.FILENAME, g]));

const slotStats = {};
for (const slot of IMAGE_SLOTS) {
  let idNullButFilenamePresent = 0;
  let orphanedId = 0;
  let resolvedById = 0;
  let resolvedByFilenameFallback = 0;
  let unresolved = 0;

  for (const q of questions) {
    const graphicId = q[slot.graphicIdCol];
    const filename = q[slot.filenameCol];
    const hasGraphicId = graphicId !== null && graphicId !== undefined;
    const hasFilename = Boolean(filename);
    if (!hasGraphicId && !hasFilename) continue; // no image expected for this slot

    if (!hasGraphicId && hasFilename) {
      idNullButFilenamePresent++;
    }

    if (hasGraphicId) {
      if (graphicById.has(graphicId)) {
        resolvedById++;
        continue;
      }
      orphanedId++;
    }

    if (hasFilename && graphicByFilename.has(filename)) {
      resolvedByFilenameFallback++;
      continue;
    }

    unresolved++;
  }

  slotStats[slot.pbField] = {
    idNullButFilenamePresent,
    orphanedId,
    resolvedById,
    resolvedByFilenameFallback,
    unresolved
  };
}
console.log("\nImage resolution per slot:", JSON.stringify(slotStats, null, 2));
report.slotStats = slotStats;

// Decode + sniff every GRAPHIC row up front, so corrupt/oversized/unsupported
// images are known before any PocketBase writes happen.
let decodeFailures = 0;
let unsupportedFormat = 0;
let oversizeAfterDecode = 0;
const mimeHistogram = {};

for (const g of graphics) {
  let buffer;
  try {
    buffer = decodeGraphicContent(g.CONTENT);
  } catch (err) {
    decodeFailures++;
    console.warn(`GRAPHIC.ID=${g.ID} (${g.FILENAME}): ${err.message}`);
    continue;
  }
  if (!buffer) continue;

  const mime = sniffImageMime(buffer) ?? "unknown";
  mimeHistogram[mime] = (mimeHistogram[mime] ?? 0) + 1;
  if (!ACCEPTED_MIME_TYPES.includes(mime)) unsupportedFormat++;
  if (buffer.length > MAX_FILE_SIZE_BYTES) oversizeAfterDecode++;
}

console.log("\nGRAPHIC.CONTENT decode results:");
console.log("  base64 decode failures:", decodeFailures);
console.log("  sniffed mime histogram:", mimeHistogram);
console.log("  unsupported format (needs sharp conversion):", unsupportedFormat);
console.log("  over the 3MB PocketBase field limit (needs conversion/resize):", oversizeAfterDecode);

report.graphicDecode = { decodeFailures, mimeHistogram, unsupportedFormat, oversizeAfterDecode };

// --- ANSWER / question_options audit ---
const answers = db.prepare("SELECT * FROM ANSWER").all();
const questionIds = new Set(questions.map((q) => q.ID));
const answersByQuestion = new Map();
let orphanedAnswers = 0;
for (const a of answers) {
  if (!questionIds.has(a.QUESTIONID)) {
    orphanedAnswers++;
    continue;
  }
  const list = answersByQuestion.get(a.QUESTIONID) ?? [];
  list.push(a);
  answersByQuestion.set(a.QUESTIONID, list);
}

let questionsWithZeroOptions = 0;
let questionsWithZeroCorrect = 0;
let typeCorrectCountMismatch = 0;
for (const q of questions) {
  const opts = answersByQuestion.get(q.ID) ?? [];
  const correctCount = opts.filter((o) => o.IS_CORRECT === "TRUE").length;
  if (opts.length === 0) questionsWithZeroOptions++;
  if (opts.length > 0 && correctCount === 0) questionsWithZeroCorrect++;
  if (q.TYPE === 1 && correctCount > 1) typeCorrectCountMismatch++;
}

console.log("\nANSWER audit:");
console.log("  total ANSWER rows:", answers.length);
console.log("  orphaned (QUESTIONID not in QUESTION):", orphanedAnswers);
console.log("  questions with zero options:", questionsWithZeroOptions);
console.log("  questions with options but zero marked correct:", questionsWithZeroCorrect);
console.log("  TYPE=1 (single_choice) questions with >1 correct answer:", typeCorrectCountMismatch);

report.answerAudit = {
  totalAnswers: answers.length,
  orphanedAnswers,
  questionsWithZeroOptions,
  questionsWithZeroCorrect,
  typeCorrectCountMismatch
};

writeFileSync(new URL("./audit-report.json", import.meta.url), JSON.stringify(report, null, 2));
console.log("\nFull report written to audit-report.json");

function histogram(rows, column) {
  const counts = {};
  for (const row of rows) {
    const key = String(row[column]);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
