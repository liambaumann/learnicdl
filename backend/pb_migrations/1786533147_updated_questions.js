/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4009210445")

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"]
  const maxSize = 3145728 // 3MB

  const questionImage = collection.fields.getByName("question_image")
  questionImage.mimeTypes = allowedMimeTypes
  questionImage.maxSize = maxSize

  const hintImage = collection.fields.getByName("hint_image")
  hintImage.mimeTypes = allowedMimeTypes
  hintImage.maxSize = maxSize

  const explanationImage = collection.fields.getByName("explanation_image")
  explanationImage.mimeTypes = allowedMimeTypes
  explanationImage.maxSize = maxSize
  explanationImage.maxSelect = 1

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4009210445")

  const questionImage = collection.fields.getByName("question_image")
  questionImage.mimeTypes = []
  questionImage.maxSize = 500000

  const hintImage = collection.fields.getByName("hint_image")
  hintImage.mimeTypes = []
  hintImage.maxSize = 0

  const explanationImage = collection.fields.getByName("explanation_image")
  explanationImage.mimeTypes = null
  explanationImage.maxSize = 0
  explanationImage.maxSelect = 0

  return app.save(collection)
})
