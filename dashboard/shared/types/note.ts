// Tipi condivisi tra client (pagine Vue) e server (API Nitro).

export type NoteAccent = 'primary' | 'secondary' | 'tertiary'

export interface Note {
  id: string
  text: string
  accent: NoteAccent
  /** timestamp ms dell'ultima modifica */
  updatedAt: number
}

export const NOTE_ACCENTS: NoteAccent[] = ['primary', 'secondary', 'tertiary']
export const NOTE_MAX_LENGTH = 500
