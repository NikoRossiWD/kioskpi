<script setup lang="ts">
import type { EventDoc } from '#shared/types/models'

// Eventi da Firestore (collezione "events"); in futuro arriveranno da Google Calendar.
const now = useNow()
const { items: events } = useCollection<EventDoc>('events', 'start')

type Status = 'past' | 'now' | 'next' | 'later'

const items = computed(() => {
  const t = now.value.getTime()
  const today = now.value.toDateString()
  let nextFound = false

  return events.value
    .filter(e => e.start.toDate().toDateString() === today)
    .map((e) => {
      const start = e.start.toDate()
      const end = e.end.toDate()
      let status: Status = 'later'
      let badge = ''
      if (end.getTime() <= t) status = 'past'
      else if (start.getTime() <= t) {
        status = 'now'
        badge = `In corso · fino alle ${timeFmt.format(end)}`
      }
      else if (!nextFound) {
        status = 'next'
        nextFound = true
        const mins = Math.round((start.getTime() - t) / 60_000)
        badge = mins < 60 ? `Tra ${mins} min` : `Tra ${Math.floor(mins / 60)} h ${mins % 60 ? `${mins % 60} min` : ''}`.trim()
      }
      return { ...e, startLabel: timeFmt.format(start), endLabel: timeFmt.format(end), status, badge }
    })
})

const remaining = computed(() => items.value.filter(i => i.status !== 'past').length)
const meta = computed(() => {
  if (!items.value.length) return 'Nessun evento'
  return remaining.value ? `${remaining.value} da fare` : 'Giornata finita'
})
</script>

<template>
  <DashCard title="Agenda di oggi" accent="primary" :meta="meta">
    <ol class="events">
      <li v-for="e in items" :key="e.id" :class="[e.status, e.kind]">
        <div class="time tabular">
          <span class="start">{{ e.startLabel }}</span>
          <span class="end">{{ e.endLabel }}</span>
        </div>
        <div class="info">
          <p class="title">
            {{ e.title }}
            <DashIcon v-if="e.online" name="video" :size="18" class="online" />
          </p>
          <p v-if="e.detail" class="detail">{{ e.detail }}</p>
          <span v-if="e.badge" class="badge">{{ e.badge }}</span>
        </div>
      </li>
    </ol>
  </DashCard>
</template>

<style scoped>
/* Nota: non chiamare questa classe come la radice del componente (DashCard):
   gli stili scoped del padre si applicano anche alla radice del figlio. */
.events {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

li {
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 18px;
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  border-left: 5px solid var(--kind);
  background: var(--surface-2);
}
li.cliente { --kind: var(--brand-secondary); }
li.interno { --kind: var(--brand-primary); }
li.personale { --kind: var(--brand-teal); }

li.past { opacity: 0.42; }
li.now { background: var(--brand-primary-soft); }
li.next { background: var(--surface-2); outline: 2px solid var(--brand-primary-soft); }

.time {
  display: flex;
  flex-direction: column;
}
.start { font-size: 1.4rem; font-weight: 900; }
.end { font-size: 1rem; color: var(--faint); font-weight: 700; }

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.2;
}
.online { color: var(--muted); }
.detail { font-size: 1.05rem; color: var(--muted); }

.badge {
  display: inline-block;
  margin-top: 6px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 900;
  color: #fff;
  background: var(--brand-primary);
}
li.next .badge { background: var(--text); }
</style>
