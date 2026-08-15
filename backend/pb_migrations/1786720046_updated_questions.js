/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4009210445")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_2607143816",
    "help": "",
    "hidden": false,
    "id": "relation1784196621",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "submodule",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4009210445")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2607143816",
    "help": "",
    "hidden": false,
    "id": "relation1784196621",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "submodule",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
