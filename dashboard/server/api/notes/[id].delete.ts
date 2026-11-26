// DELETE /api/notes/:id — elimina una nota.
// TODO: proteggere con Firebase Auth (per ora aperto a chi è sulla rete locale).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const notes = await readNotes()
  const remaining = notes.filter(n => n.id !== id)
  if (remaining.length === notes.length) throw createError({ statusCode: 404, statusMessage: 'Nota non trovata' })
  await writeNotes(remaining)
  setResponseStatus(event, 204)
  return null
})
