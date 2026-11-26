<script setup lang="ts">
import type { EventDoc } from '#shared/types/models'

// Agenda compatta: solo i prossimi appuntamenti di oggi (in corso + successivi, max 3).
// Eventi da Firestore (collezione "events"); in futuro da Google Calendar.
const now = useNow()
const { items: events } = useCollection<EventDoc>('events', 'start')

const MAX = 3

const upcoming = computed(() => {
  const t = now.value.getTime()
  const today = now.value.toDateString()
  return events.value
    .filter(e => e.start.toDate().toDateString() === today && e.end.toDate().getTime() > t)
    .slice(0, MAX)
    .map((e, i) => {
      const start = e.start.toDate()
      const end = e.end.toDate()
      const live = start.getTime() <= t
      let badge = ''
      if (live) badge = 'Ora'
      else if (i === 0) {
        const mins = Math.round((start.getTime() - t) / 60_000)
        badge = mins < 60 ? `Tra ${mins} min` : `Tra ${Math.floor(mins / 60)} h`
      }
      return { ...e, startLabel: timeFmt.format(start), endLabel: timeFmt.format(end), live, badge }
    })
})

const todayCount = computed(() => {
  const today = now.value.toDateString()
  return events.value.filter(e => e.start.toDate().toDateString() === today).length
})
</script>

<template>
  <DashCard title="Prossimi appuntamenti" accent="primary" :meta="todayCount ? `${todayCount} oggi` : ''">
    <ol v-if="upcoming.length" class="events">
      <li v-for="e in upcoming" :key="e.id" :class="[e.kind, { live: e.live }]">
        <span class="time tabular">{{ e.startLabel }}</span>
        <span class="title">
          {{ e.title }}
          <small v-if="e.detail">· {{ e.detail }}</small>
        </span>
        <DashIcon v-if="e.online" name="video" :size="18" class="online" />
        <span v-if="e.badge" class="badge">{{ e.badge }}</span>
      </li>
    </ol>
    <p v-else class="empty">Nessun altro appuntamento oggi.</p>
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
  gap: 8px;
}

li {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 12px;
  border-left: 4px solid var(--kind);
  background: var(--surface-2);
}
li.cliente { --kind: var(--brand-secondary); }
li.interno { --kind: var(--brand-primary); }
li.personale { --kind: var(--brand-teal); }
li.live { background: var(--brand-primary-soft); }

.time {
  flex: none;
  font-size: 1.2rem;
  font-weight: 900;
}

.title {
  flex: 1;
  min-width: 0;
  font-size: 1.15rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title small { font-size: 1rem; color: var(--muted); }

.online { flex: none; color: var(--muted); }

.badge {
  flex: none;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 900;
  color: #fff;
  background: var(--text);
}
li.live .badge { background: var(--brand-primary); }

.empty {
  font-size: 1.1rem;
  color: var(--muted);
}
</style>
