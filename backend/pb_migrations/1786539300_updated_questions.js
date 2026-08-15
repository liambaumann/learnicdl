/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4009210445")

  // formalize the "hint" / "hint_image" fields: they were added directly against
  // this environment's live DB (via the admin UI) without ever going through a
  // committed migration, so a fresh clone was missing them. Guarded with
  // getByName so this is a no-op on environments (like this one) where the
  // fields already exist.
  if (!collection.fields.getByName("hint")) {
    collection.fields.addAt(5, new Field({
      "autogeneratePattern": "",
      "help": "",
      "hidden": false,
      "id": "text885392211",
      "max": 0,
      "min": 0,
      "name": "hint",
      "pattern": "",
      "presentable": false,
      "primaryKey": false,
      "required": false,
      "system": false,
      "type": "text"
    }))
  }

  if (!collection.fields.getByName("hint_image")) {
    collection.fields.addAt(6, new Field({
      "help": "",
      "hidden": false,
      "id": "file4076541148",
      "maxSelect": 1,
      "maxSize": 3145728,
      "mimeTypes": ["image/jpeg", "image/png", "image/webp"],
      "name": "hint_image",
      "presentable": false,
      "protected": false,
      "required": false,
      "system": false,
      "thumbs": [],
      "type": "file"
    }))
  }

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4009210445")

  const hint = collection.fields.getByName("hint")
  if (hint) {
    collection.fields.removeById(hint.id)
  }

  const hintImage = collection.fields.getByName("hint_image")
  if (hintImage) {
    collection.fields.removeById(hintImage.id)
  }

  return app.save(collection)
})
