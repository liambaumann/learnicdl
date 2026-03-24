/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4009210445")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json3493198471",
    "maxSize": 0,
    "name": "options",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "json"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json1355859462",
    "maxSize": 0,
    "name": "answers",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4009210445")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json3493198471",
    "maxSize": 0,
    "name": "options",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json1355859462",
    "maxSize": 0,
    "name": "answers",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
