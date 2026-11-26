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

/** sites — siti dei clienti da monitorare (semaforo) */
export interface SiteDoc {
  order: number
  name: string
  url: string
}

/** commute — destinazioni per "Ritorno a casa" (partenza: ufficio, in nuxt.config) */
export interface CommuteDoc {
  order: number
  label: string // es. "Lesmo" (o "Nome · Lesmo")
  lat: number
  lon: number
}

/** music — un solo documento: cosa sta suonando (aggiornato in futuro da Spotify) */
export interface MusicDoc {
  title: string
  artist: string
  playing: boolean
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
