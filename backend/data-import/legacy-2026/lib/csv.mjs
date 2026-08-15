import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

/** Parses a CSV produced by H2's CSVWRITE (header row + quoted fields). */
export function loadCsv(path) {
  return parse(readFileSync(path), { columns: true });
}
