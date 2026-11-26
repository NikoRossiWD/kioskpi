import type { H3Event } from 'h3'
import { NOTE_ACCENTS, NOTE_MAX_LENGTH, type Note, type NoteAccent } from '#shared/types/note'

// Le note sono salvate in un unico file JSON: .data/db/notes.json
// (storage "db" configurato in nuxt.config.ts). Semplice e sufficiente per poche note.
const KEY = 'notes.json'

export async function readNotes(): Promise<Note[]> {
  return (await useStorage('db').getItem<Note[]>(KEY)) ?? []
}

export async function writeNotes(notes: Note[]): Promise<void> {
  await useStorage('db').setItem(KEY, notes)
}

/** Valida e normalizza il corpo di una richiesta di creazione/modifica nota. */
export async function readNoteInput(event: H3Event) {
  const body = await readBody<{ text?: unknown, accent?: unknown }>(event)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!text) throw createError({ statusCode: 400, statusMessage: 'Il testo della nota è vuoto' })
  if (text.length > NOTE_MAX_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: `Massimo ${NOTE_MAX_LENGTH} caratteri` })
  }
  const accent = NOTE_ACCENTS.includes(body?.accent as NoteAccent) ? (body!.accent as NoteAccent) : 'tertiary'
  return { text, accent }
}
