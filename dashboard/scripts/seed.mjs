// Carica i dati demo (seed/demo.json) nell'emulatore Firestore.
// ATTENZIONE: cancella prima TUTTI i dati dell'emulatore (solo emulatore, mai produzione).
//
// Uso: npm run seed   (con gli emulatori accesi: npm run emulators)
import { readFile } from 'node:fs/promises'

const PROJECT = 'demo-deskpi'
const HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080'
const BASE = `http://${HOST}/v1/projects/${PROJECT}/databases/(default)/documents`
// "Bearer owner" = accesso amministratore, accettato solo dall'emulatore (ignora le regole)
const HEADERS = { 'Content-Type': 'application/json', Authorization: 'Bearer owner' }

const today = new Date()
const atTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(today)
  d.setHours(h, m, 0, 0)
  return d
}
const inDays = (n) => {
  const d = new Date(today)
  d.setHours(18, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d
}

// Converte un valore JS nel formato del REST di Firestore
function toValue(v) {
  if (v instanceof Date) return { timestampValue: v.toISOString() }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  if (typeof v === 'string') return { stringValue: v }
  if (v == null) return { nullValue: null }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } }
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toValue(x)])) } }
}

async function add(collection, data) {
  const res = await fetch(`${BASE}/${collection}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ fields: toValue(data).mapValue.fields }),
  })
  if (!res.ok) throw new Error(`${collection}: ${res.status} ${await res.text()}`)
}

const demo = JSON.parse(await readFile(new URL('../seed/demo.json', import.meta.url), 'utf8'))

// Svuota l'emulatore
const wipe = await fetch(`http://${HOST}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' })
if (!wipe.ok) throw new Error(`Emulatore non raggiungibile su ${HOST}: è acceso? (npm run emulators)`)

for (const e of demo.events) {
  const start = atTime(e.start)
  const { start: _s, minutes, ...rest } = e
  await add('events', { ...rest, start, end: new Date(start.getTime() + minutes * 60_000) })
}
for (const f of demo.focus) await add('focus', f)
for (const p of demo.projects) {
  const { dueInDays, ...rest } = p
  await add('projects', { ...rest, due: inDays(dueInDays) })
}
for (const c of demo.commute) await add('commute', c)
for (const m of demo.music) await add('music', m)
for (const d of demo.deadlines) {
  const { dueInDays, ...rest } = d
  await add('deadlines', { ...rest, due: inDays(dueInDays) })
}
for (const n of demo.notes) await add('notes', { ...n, updatedAt: new Date() })

console.log('Seed completato: events, focus, projects, deadlines, notes, commute, music')
