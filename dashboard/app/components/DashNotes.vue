<script setup lang="ts">
import type { Note } from '#shared/types/note'

// Note mostrate sulla dashboard. Ricarica ogni 15 secondi:
// una modifica fatta da /admin compare sullo schermo entro pochi secondi.
const { data: notes, refresh } = await useFetch<Note[]>('/api/notes', { default: () => [] })

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => refresh(), 15_000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <ul v-if="notes.length" class="notes">
    <li v-for="note in notes" :key="note.id" :class="note.accent">
      {{ note.text }}
    </li>
  </ul>
  <p v-else class="empty">Nessuna nota. Aggiungile da /admin</p>
</template>

<style scoped>
.notes {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

li {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.35;
  padding-left: 18px;
  border-left: 4px solid var(--accent);
  white-space: pre-line; /* rispetta gli a capo scritti nell'admin */
}
li.primary { --accent: var(--brand-primary); }
li.secondary { --accent: var(--brand-secondary); }
li.tertiary { --accent: var(--brand-tertiary); }

.empty {
  color: var(--muted);
  font-size: 1.25rem;
}
</style>
