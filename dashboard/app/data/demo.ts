/**
 * DATI DIMOSTRATIVI, inseriti a mano.
 * Servono a costruire la dashboard prima di collegare i servizi veri
 * (Google Calendar, to-do, gestionale, meteo…). Ogni blocco indica cosa lo sostituirà.
 *
 * Date e orari sono relativi a "oggi" (offset in giorni, orari HH:MM),
 * così la demo resta sempre credibile qualunque giorno la apri.
 */

export type EventKind = 'cliente' | 'interno' | 'personale'

export interface AgendaEvent {
  start: string // HH:MM di oggi
  minutes: number
  title: string
  detail?: string
  kind: EventKind
  online?: boolean
}

export interface FocusItem { text: string, done: boolean }

export interface Project {
  name: string
  client: string
  phase: string
  progress: number // 0-100
  dueInDays: number
  color: 'primary' | 'secondary' | 'teal' | 'tertiary'
}

export interface Stat { label: string, value: string, hint?: string, trend?: 'up' | 'down' }

export interface Deadline { text: string, inDays: number, kind: 'fattura' | 'fisco' | 'tecnico' | 'cliente' }

export interface Weather {
  city: string
  temp: number
  min: number
  max: number
  condition: string
  icon: 'sun' | 'cloud' | 'rain' | 'partly'
  rainChance: number
}

// → Google Calendar (iCal)
export const agenda: AgendaEvent[] = [
  { start: '09:00', minutes: 30, title: 'Stand-up team', detail: 'Priorità della settimana', kind: 'interno', online: true },
  { start: '10:30', minutes: 60, title: 'Kickoff e-commerce', detail: 'Rossi Arredamenti', kind: 'cliente', online: true },
  { start: '13:00', minutes: 60, title: 'Pausa pranzo', kind: 'personale' },
  { start: '14:30', minutes: 45, title: 'Review design homepage', detail: 'Officine Verdi', kind: 'interno' },
  { start: '16:00', minutes: 60, title: 'Demo chatbot AI', detail: 'Studio Bianchi', kind: 'cliente', online: true },
  { start: '18:30', minutes: 60, title: 'Palestra', kind: 'personale' },
]

// → to-do (Firestore / Google Tasks)
export const focus: FocusItem[] = [
  { text: 'Consegnare mockup homepage a Rossi Arredamenti', done: true },
  { text: 'Preventivo web app gestionale per Officine Verdi', done: false },
  { text: 'Sistemare risposte del chatbot su orari e prezzi', done: false },
]

// → gestionale progetti
export const projects: Project[] = [
  { name: 'E-commerce', client: 'Rossi Arredamenti', phase: 'Sviluppo', progress: 72, dueInDays: 12, color: 'primary' },
  { name: 'Chatbot AI', client: 'Studio Bianchi', phase: 'Training', progress: 45, dueInDays: 20, color: 'secondary' },
  { name: 'Restyling sito', client: 'Officine Verdi', phase: 'Design', progress: 20, dueInDays: 34, color: 'teal' },
  { name: 'Landing lead gen', client: 'FitZone', phase: 'Test finali', progress: 90, dueInDays: 3, color: 'tertiary' },
]

// → CRM / fatturazione
export const stats: Stat[] = [
  { label: 'Lead del mese', value: '18', hint: '+4 vs ottobre', trend: 'up' },
  { label: 'Preventivi aperti', value: '6', hint: '€ 24.500' },
  { label: 'Ore fatturabili', value: '96', hint: 'su 140 obiettivo' },
]

// → calendario scadenze
export const deadlines: Deadline[] = [
  { text: 'Fattura acconto Studio Bianchi', inDays: 1, kind: 'fattura' },
  { text: 'Rinnovo dominio fitzone.it', inDays: 4, kind: 'tecnico' },
  { text: 'Feedback wireframe Officine Verdi', inDays: 6, kind: 'cliente' },
  { text: 'Versamento F24', inDays: 9, kind: 'fisco' },
]

// → API meteo (es. Open-Meteo, gratuita e senza chiave)
export const weather: Weather = {
  city: 'Milano',
  temp: 9,
  min: 5,
  max: 12,
  condition: 'Parzialmente nuvoloso',
  icon: 'partly',
  rainChance: 20,
}
