/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3230044447")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_4009210445",
    "help": "",
    "hidden": false,
    "id": "relation3069659470",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "question",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3230044447")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4009210445",
    "help": "",
    "hidden": false,
    "id": "relation3069659470",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "question",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
