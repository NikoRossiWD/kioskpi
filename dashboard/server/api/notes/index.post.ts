import { randomUUID } from 'node:crypto'
import type { Note } from '#shared/types/note'

// POST /api/notes — crea una nota.
// TODO: proteggere con Firebase Auth (per ora aperto a chi è sulla rete locale).
export default defineEventHandler(async (event) => {
  const input = await readNoteInput(event)
  const note: Note = { id: randomUUID(), ...input, updatedAt: Date.now() }
  const notes = await readNotes()
  notes.push(note)
  await writeNotes(notes)
  setResponseStatus(event, 201)
  return note
})
