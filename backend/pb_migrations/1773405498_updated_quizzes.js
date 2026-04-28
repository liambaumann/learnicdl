/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_93315167")

  // update collection data
  unmarshal({
    "name": "modules"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_93315167")

  // update collection data
  unmarshal({
    "name": "quizzes"
  }, collection)

  return app.save(collection)
})
