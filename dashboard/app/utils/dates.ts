import type { Timestamp } from 'firebase/firestore'

/** Giorni di calendario tra oggi e la data (0 = oggi, 1 = domani, negativo = passata). */
export function daysUntil(ts: Timestamp, now: Date) {
  const a = new Date(now); a.setHours(0, 0, 0, 0)
  const b = ts.toDate(); b.setHours(0, 0, 0, 0)
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' })
