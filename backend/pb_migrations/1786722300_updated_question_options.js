/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Formalizes cascadeDelete=true on questions.submodule and
  // question_options.question, which were already toggled on directly
  // against this environment's live DB via the admin UI (not through a
  // committed migration, so a fresh clone was missing them). Guarded so this
  // is a no-op on environments (like this one) where it's already set.
  //
  // This backs "delete a question -> its answer options are deleted too" and
  // will back the same for "delete a submodule -> its questions (and their
  // options) are deleted too" once that admin feature exists. The actual
  // admin delete flow still queries counts explicitly first to show the
  // admin what's about to be destroyed - cascade is the correctness
  // guarantee underneath that, not a replacement for the confirmation step.
  const questions = app.findCollectionByNameOrId("pbc_4009210445")
  const submoduleField = questions.fields.getByName("submodule")
  if (submoduleField && !submoduleField.cascadeDelete) {
    submoduleField.cascadeDelete = true
  }
  app.save(questions)

  const questionOptions = app.findCollectionByNameOrId("pbc_3230044447")
  const questionField = questionOptions.fields.getByName("question")
  if (questionField && !questionField.cascadeDelete) {
    questionField.cascadeDelete = true
  }
  app.save(questionOptions)
}, (app) => {
  const questions = app.findCollectionByNameOrId("pbc_4009210445")
  const submoduleField = questions.fields.getByName("submodule")
  if (submoduleField) submoduleField.cascadeDelete = false
  app.save(questions)

  const questionOptions = app.findCollectionByNameOrId("pbc_3230044447")
  const questionField = questionOptions.fields.getByName("question")
  if (questionField) questionField.cascadeDelete = false
  app.save(questionOptions)
})
