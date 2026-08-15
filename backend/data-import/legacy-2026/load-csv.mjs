#!/usr/bin/env node
// Force-rebuilds legacy.sqlite from the source CSVs. You don't need to run
// this manually before audit.mjs/import.mjs - they rebuild it automatically
// when it's missing or stale. Use this only if you want to force a rebuild
// right now (e.g. to see the per-table load log without also running an
// audit/import).

import { buildLegacyDb } from "./lib/build-legacy-db.mjs";

buildLegacyDb();
console.log("\nlegacy.sqlite ready.");
