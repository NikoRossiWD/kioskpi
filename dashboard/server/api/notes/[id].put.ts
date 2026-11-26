// PUT /api/notes/:id — modifica una nota.
// TODO: proteggere con Firebase Auth (per ora aperto a chi è sulla rete locale).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const input = await readNoteInput(event)
  const notes = await readNotes()
  const note = notes.find(n => n.id === id)
  if (!note) throw createError({ statusCode: 404, statusMessage: 'Nota non trovata' })
  Object.assign(note, input, { updatedAt: Date.now() })
  await writeNotes(notes)
  return note
})
