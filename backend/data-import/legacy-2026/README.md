# Legacy H2 -> PocketBase question bank import

Imports the old question bank (H2 database, tables `QUESTION`, `GRAPHIC`,
`QUESTION_POOL`, `LESSON`, `ANSWER`) into this repo's PocketBase backend.

**Ownership split**: `modules` (PocketBase) are managed entirely by hand in
the admin UI. This tool never creates, edits, or deletes a module. Each run
imports exactly **one legacy LESSON as one submodule**, attached to a module
you specify by its existing PocketBase record id. This is deliberate, not a
missing feature - an earlier version created all modules/submodules in bulk
and produced a pile of duplicates alongside hand-curated ones, which had to
be fully rolled back. Don't reintroduce bulk module/submodule creation.

**Only the project owner runs `--commit`.** Dry runs (the default, no
`--commit` flag) make zero PocketBase writes and are safe for anyone to run
to inspect output.

Submodules/questions/question_options all upsert by a `legacy_id` field
(added by `backend/pb_migrations/1786539400_added_legacy_id_fields.js`), so
re-running a commit after fixing something is safe - it won't create
duplicates.

## How the source data was actually obtained

The original plan was DBeaver against the live H2 file directly - that
turned into a multi-hour dead end (JVM OOM on a 2GB embedded file, H2
format-version mismatches between old data and DBeaver's bundled driver, and
finally discovering the specific local `.mv.db` file/backup we had access to
was itself an empty/inconsistent copy - real data was only in the live
server). What actually worked, run against the **live server** via SSH:

```sql
-- in the H2 web console / a SQL client against the LIVE server (read-only, safe on a live db)
SCRIPT TO '/tmp/question_bank_export.sql';
```

Then, locally, replay that script into a fresh H2 database and export just
the 5 tables we need to CSV (see `load-csv.mjs` for exactly which tables/
files):

```sh
java -cp h2-1.4.199.jar org.h2.tools.RunScript -url "jdbc:h2:./legacy_full" -user sa -password "" -script question_bank_export.sql
java -cp h2-1.4.199.jar org.h2.tools.Shell -url "jdbc:h2:./legacy_full" -user sa -password "" -sql "CALL CSVWRITE('question.csv', 'SELECT * FROM QUESTION')"
java -cp h2-1.4.199.jar org.h2.tools.Shell -url "jdbc:h2:./legacy_full" -user sa -password "" -sql "CALL CSVWRITE('graphic.csv', 'SELECT * FROM GRAPHIC')"
java -cp h2-1.4.199.jar org.h2.tools.Shell -url "jdbc:h2:./legacy_full" -user sa -password "" -sql "CALL CSVWRITE('question_pool.csv', 'SELECT * FROM QUESTION_POOL')"
java -cp h2-1.4.199.jar org.h2.tools.Shell -url "jdbc:h2:./legacy_full" -user sa -password "" -sql "CALL CSVWRITE('lesson.csv', 'SELECT * FROM LESSON')"
java -cp h2-1.4.199.jar org.h2.tools.Shell -url "jdbc:h2:./legacy_full" -user sa -password "" -sql "CALL CSVWRITE('answer.csv', 'SELECT * FROM ANSWER')"
```

(`h2-1.4.199.jar` matters specifically - it matches the old MVStore format
the source database was written in; the newer driver DBeaver bundles by
default can't open it.)

Copy the 5 resulting CSVs (`question.csv`, `graphic.csv`, `question_pool.csv`,
`lesson.csv`, `answer.csv`) into this directory.

## Real legacy schema (confirmed from the actual data, not guessed)

- `QUESTION_POOL`: `ID`, `DESCRIPTION`, `GRAPHIC`, `NAME`, `COLOR`, `STATUS`,
  `STUDENT_SPECIFIC` - this is the legacy "pool"/module table. Title = `NAME`.
- `LESSON`: `ID`, `DESCRIPTION`, `NAME`, `QUESTION_POOL_ID`, `POSITION`,
  `STATUS` - the legacy "lesson"/submodule table. Title = `NAME`, parent =
  `QUESTION_POOL_ID`.
- `QUESTION`: `ID`, `EXPLANATION`, `POOLID`, `QUESTION`, `EXPLANATION_GRAPHIC`,
  `HINT`, `HINT_GRAPHIC`, `QUESTION_GRAPHIC`, `STATUS`, `TYPE`, `TITLE`,
  `GRAPHIC`, `NEXT_QUESTION`, `LESSONID`, `IS_ENGLISH`, `QUESTION_GRAPHICID`,
  `HINT_GRAPHICID`, `EXPLANATION_GRAPHICID`.
  - `TYPE`: confirmed against real data (not guessed) - `0` = multiple_choice
    (313/321 have 2+ correct answers), `1` = single_choice (all 565 have
    exactly 1 correct answer). See `lib/transform.mjs` `QUESTION_TYPE_MAP`.
- `GRAPHIC`: `ID`, `CONTENT` (base64 text), `FILENAME`, `POOLID`.
- `ANSWER`: `ID`, `ANSWER` (text), `IS_CORRECT`, `ID_OF_PARENT_ANSWER`,
  `QUESTIONID`, `POSITION`, `GRAPHIC` - the answer-options table, linked via
  `QUESTIONID`. `ID_OF_PARENT_ANSWER` and per-answer `GRAPHIC` have no
  PocketBase equivalent and are dropped (not silently - flagged in the audit
  if you go looking).

## Running it

```sh
cd backend/data-import/legacy-2026
npm install

# 1. Dry run the audit - no PocketBase writes, just a report. Builds
#    legacy.sqlite from the 5 CSVs automatically the first time (and rebuilds
#    it automatically later if the CSVs change) - no separate step needed.
npm run audit
# review the printed summary + audit-report.json

# 2. Dry run the import for one specific lesson (no writes) - find the
#    LESSON.ID and the PocketBase module id you want it under first:
grep -a '"<lesson name>"' lesson.csv    # find its LESSON.ID
# look up the target module's PocketBase record id in the admin UI

node import.mjs --lesson=<LEGACY LESSON.ID> --module=<PocketBase module id>

# 3. Real run - only the project owner does this:
PB_EMAIL=<your-superuser-email> PB_PASSWORD=<your-superuser-password> \
  node import.mjs --lesson=<LEGACY LESSON.ID> --module=<PocketBase module id> --commit
```

(`node load-csv.mjs` still exists if you want to force a rebuild of
`legacy.sqlite` on demand - e.g. right after replacing the CSVs with a fresh
export - but you don't need to run it manually as part of the normal flow.)

To import a different lesson, just change `--lesson=`/`--module=` - nothing
in the script itself needs editing. `PB_URL` defaults to
`http://127.0.0.1:8090`.

If you add new `pb_migrations` while a local `pnpm dev` PocketBase instance
is already running, that instance won't see the change until it's restarted
- migrations only get picked up at process startup.

## Verification

- Row-count parity: legacy `QUESTION` count for the lesson vs. imported
  `questions` count (minus anything skipped, with a reason logged).
- Image integrity: for a sample of imported questions, download the uploaded
  file back from PocketBase and compare its hash against the original decoded
  `GRAPHIC.CONTENT` bytes.
- Manual pass: `pnpm dev`, open the migrated lesson in the real quiz UI,
  confirm the rich HTML in `question`/`hint`/`explanation` renders correctly
  and images load.
