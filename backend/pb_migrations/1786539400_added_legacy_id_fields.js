/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Adds a "legacy_id" text field to the collections that will be populated by
  // the one-time H2 -> PocketBase data import (see backend/data-import/legacy-2026/).
  // It stores the original numeric ID from the legacy SQL tables (QUESTION.ID,
  // POOL.ID, LESSON.ID, ...) so the import can upsert idempotently and imported
  // records can be traced back to their source row. PocketBase record IDs can't
  // hold the legacy numeric IDs directly (they must be 15-char strings), hence
  // the separate field instead of reusing the legacy ID as the PB id.
  const additions = [
    { collectionId: "pbc_93315167", fieldId: "text1720558843", indexName: "idx_modules_legacy_id", table: "modules" },
    { collectionId: "pbc_2607143816", fieldId: "text4462017935", indexName: "idx_submodules_legacy_id", table: "submodules" },
    { collectionId: "pbc_4009210445", fieldId: "text3891042567", indexName: "idx_questions_legacy_id", table: "questions" },
    { collectionId: "pbc_3230044447", fieldId: "text2856103479", indexName: "idx_question_options_legacy_id", table: "question_options" }
  ]

  for (const { collectionId, fieldId, indexName, table } of additions) {
    const collection = app.findCollectionByNameOrId(collectionId)

    if (!collection.fields.getByName("legacy_id")) {
      collection.fields.add(new Field({
        "autogeneratePattern": "",
        "help": "Original numeric ID from the legacy H2 SQL database, kept for traceability and idempotent re-import.",
        "hidden": false,
        "id": fieldId,
        "max": 0,
        "min": 0,
        "name": "legacy_id",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }))
    }

    if (!collection.indexes.some((idx) => idx.includes(indexName))) {
      collection.indexes.push(`CREATE INDEX ${indexName} ON ${table} (legacy_id)`)
    }

    app.save(collection)
  }
}, (app) => {
  const collectionIds = ["pbc_93315167", "pbc_2607143816", "pbc_4009210445", "pbc_3230044447"]

  for (const collectionId of collectionIds) {
    const collection = app.findCollectionByNameOrId(collectionId)

    const legacyId = collection.fields.getByName("legacy_id")
    if (legacyId) {
      collection.fields.removeById(legacyId.id)
    }

    collection.indexes = collection.indexes.filter((idx) => !idx.includes("legacy_id"))

    app.save(collection)
  }
})
