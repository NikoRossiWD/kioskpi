<script setup lang="ts">
import type { Note } from '#shared/types/note'

// Note vere (dall'admin). Ricarica ogni 15 secondi:
// una modifica fatta da /admin compare sullo schermo entro pochi secondi.
const { data: notes, refresh } = await useFetch<Note[]>('/api/notes', { default: () => [] })

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => refresh(), 15_000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <DashCard title="Note" accent="primary">
    <ul v-if="notes.length" class="notes">
      <li v-for="note in notes.slice(0, 4)" :key="note.id" :class="note.accent">
        {{ note.text }}
      </li>
    </ul>
    <p v-else class="empty">Nessuna nota. Aggiungile da /admin</p>
  </DashCard>
</template>

<style scoped>
.notes {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

li {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--soft);
  white-space: pre-line; /* rispetta gli a capo scritti nell'admin */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
li.primary { --soft: var(--brand-primary-soft); }
li.secondary { --soft: var(--brand-secondary-soft); }
li.tertiary { --soft: var(--brand-tertiary-soft); }

.empty {
  color: var(--muted);
  font-size: 1.15rem;
}
</style>
