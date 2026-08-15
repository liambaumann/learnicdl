// Column names below come from the real legacy schema (recovered via H2's
// own SCRIPT/RunScript/CSVWRITE tooling - see README.md). The real table
// names differ from the original naming used during planning: the legacy
// "pool" table is QUESTION_POOL (not POOL), and the answer-options table is
// ANSWER (linked to QUESTION via ANSWER.QUESTIONID).

import { normalizeInlineColors } from "./html.mjs";

export class UnmappedTypeCodeError extends Error {
  constructor(code) {
    super(
      `Legacy QUESTION.TYPE code ${JSON.stringify(code)} has no PocketBase mapping yet. ` +
        `Run the TYPE/ANSWER correct-count cross-check from the migration notes and add it to ` +
        `QUESTION_TYPE_MAP in lib/transform.mjs.`
    );
  }
}

// Confirmed against real data: TYPE=0 questions have 2+ correct ANSWER rows
// in 313/321 cases (multiple_choice); TYPE=1 questions have exactly 1
// correct ANSWER row in all 565 cases (single_choice).
export const QUESTION_TYPE_MAP = {
  0: "multiple_choice",
  1: "single_choice"
};

export function mapQuestionType(legacyType) {
  if (legacyType === null || legacyType === undefined) return null;
  const mapped = QUESTION_TYPE_MAP[legacyType];
  if (mapped === undefined) {
    throw new UnmappedTypeCodeError(legacyType);
  }
  return mapped;
}

/**
 * Resolves a GRAPHIC row for one of a QUESTION's three image slots.
 * Prefers the *_GRAPHICID foreign key; falls back to a filename match against
 * GRAPHIC.FILENAME when the ID is null, since the sample data showed rows
 * where the ID FK was null but the filename column was still populated.
 */
export function resolveGraphic(db, { graphicId, filename }) {
  if (graphicId !== null && graphicId !== undefined) {
    const row = db.prepare("SELECT * FROM GRAPHIC WHERE ID = ?").get(graphicId);
    if (row) return { row, resolvedBy: "id" };
  }
  if (filename) {
    const row = db.prepare("SELECT * FROM GRAPHIC WHERE FILENAME = ?").get(filename);
    if (row) return { row, resolvedBy: "filename" };
  }
  return null;
}

/**
 * The three image slots on a legacy QUESTION row, and the PocketBase file
 * field + text field each one maps to.
 */
export const IMAGE_SLOTS = [
  { pbField: "question_image", graphicIdCol: "QUESTION_GRAPHICID", filenameCol: "QUESTION_GRAPHIC" },
  { pbField: "hint_image", graphicIdCol: "HINT_GRAPHICID", filenameCol: "HINT_GRAPHIC" },
  { pbField: "explanation_image", graphicIdCol: "EXPLANATION_GRAPHICID", filenameCol: "EXPLANATION_GRAPHIC" }
];

/**
 * Maps a raw QUESTION row's text fields to the PocketBase `questions` field
 * names, replacing hardcoded inline text colors with theme-aware hue classes
 * along the way (see lib/html.mjs). Returns { fields, warnings } rather than
 * a flat object - `warnings` isn't a PocketBase field, so callers should
 * spread `fields`, not the whole return value, into an upsert payload.
 */
export function mapQuestionText(row) {
  const fieldNames = ["QUESTION", "HINT", "EXPLANATION"];
  const warnings = [];
  const normalized = {};
  for (const name of fieldNames) {
    if (!row[name]) continue;
    const { html, warnings: fieldWarnings } = normalizeInlineColors(row[name]);
    normalized[name] = html;
    for (const w of fieldWarnings) warnings.push({ field: name.toLowerCase(), ...w });
  }

  return {
    fields: {
      question: normalized.QUESTION ?? row.QUESTION,
      hint: normalized.HINT || undefined,
      explanation: normalized.EXPLANATION || undefined
    },
    warnings
  };
}

/**
 * Legacy ANSWER rows for one QUESTION, ordered the way they appeared in the
 * quiz (POSITION). ANSWER.GRAPHIC (per-option images) and
 * ANSWER.ID_OF_PARENT_ANSWER (used by a small number of hierarchical/matching
 * questions) have no equivalent in the current question_options schema and
 * are intentionally dropped - flagged by the audit report, not silently lost
 * without a trace.
 */
export function loadAnswerOptions(db, questionLegacyId) {
  return db
    .prepare('SELECT * FROM ANSWER WHERE QUESTIONID = ? ORDER BY POSITION')
    .all(questionLegacyId)
    .map((row) => ({
      text: row.ANSWER,
      is_correct: row.IS_CORRECT === "TRUE",
      legacy_id: row.ID
    }));
}

/**
 * LESSON -> PocketBase `submodules`. Deliberately has no equivalent for
 * QUESTION_POOL -> `modules` - modules are managed entirely by hand, never by
 * this script (see import.mjs header).
 */
export function mapLesson(row) {
  return { title: row.NAME, legacy_id: String(row.ID) };
}
