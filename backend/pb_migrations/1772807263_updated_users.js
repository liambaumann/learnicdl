/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "date3359898891",
    "max": "",
    "min": "",
    "name": "last_login",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "date1373660747",
    "max": "",
    "min": "",
    "name": "privacy_policy_accepted",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3591849023",
    "hidden": false,
    "id": "relation3274328046",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "school_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("date3359898891")

  // remove field
  collection.fields.removeById("date1373660747")

  // remove field
  collection.fields.removeById("relation3274328046")

  return app.save(collection)
})
