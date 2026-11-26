// GET /api/notes — pubblico: lo legge la dashboard sul monitor.
export default defineEventHandler(async () => {
  const notes = await readNotes()
  return notes.sort((a, b) => b.updatedAt - a.updatedAt)
})
