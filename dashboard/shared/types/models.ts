import type { Timestamp } from 'firebase/firestore'

// Modello dati Firestore: una collezione per sezione della dashboard.
// Ogni documento letto ha anche il suo `id`.

export type WithId<T> = T & { id: string }

export type Accent = 'primary' | 'secondary' | 'tertiary' | 'teal'

/** events — sostituita in futuro da Google Calendar */
export interface EventDoc {
  title: string
  detail?: string
  kind: 'cliente' | 'interno' | 'personale'
  online?: boolean
  start: Timestamp
  end: Timestamp
}

/** focus — le 3 priorità del giorno */
export interface FocusDoc {
  order: number
  text: string
  done: boolean
}

/** projects */
export interface ProjectDoc {
  order: number
  name: string
  client: string
  phase: string
  progress: number // 0-100
  due: Timestamp
  color: Accent
}

/** stats — numeri nella fascia in alto */
export interface StatDoc {
  order: number
  label: string
  value: string
  hint?: string
  trend?: 'up' | 'down'
}

/** deadlines */
export interface DeadlineDoc {
  text: string
  kind: 'fattura' | 'fisco' | 'tecnico' | 'cliente'
  due: Timestamp
}

/** notes — modificabili da /admin */
export type NoteAccent = 'primary' | 'secondary' | 'tertiary'
export interface NoteDoc {
  text: string
  accent: NoteAccent
  updatedAt: Timestamp
}

export const NOTE_ACCENTS: NoteAccent[] = ['primary', 'secondary', 'tertiary']
export const NOTE_MAX_LENGTH = 500
