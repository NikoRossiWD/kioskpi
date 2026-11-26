<script setup lang="ts">
import type { DeadlineDoc } from '#shared/types/models'

const kindLabel = { fattura: 'Fattura', fisco: 'Fisco', tecnico: 'Tecnico', cliente: 'Cliente' } as const

const now = useNow()
const { items } = useCollection<DeadlineDoc>('deadlines', 'due')
// Solo da oggi in poi, al massimo 5
const deadlines = computed(() =>
  items.value
    .map(d => ({ ...d, inDays: daysUntil(d.due, now.value) }))
    .filter(d => d.inDays >= 0)
    .slice(0, 5),
)

function when(days: number) {
  if (days === 0) return 'Oggi'
  if (days === 1) return 'Domani'
  return `${days} gg`
}
</script>

<template>
  <DashCard title="Scadenze" accent="tertiary">
    <ul class="deadlines">
      <li v-for="d in deadlines" :key="d.id">
        <span class="when tabular" :class="{ urgent: d.inDays <= 2 }">{{ when(d.inDays) }}</span>
        <span class="text">
          {{ d.text }}
          <small>{{ kindLabel[d.kind] }}</small>
        </span>
      </li>
    </ul>
  </DashCard>
</template>

<style scoped>
.deadlines {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

li {
  display: flex;
  align-items: center;
  gap: 16px;
}

.when {
  flex: none;
  min-width: 82px;
  padding: 6px 0;
  text-align: center;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 900;
  background: var(--brand-tertiary-soft);
  color: #6b5a00;
}
.when.urgent {
  background: var(--brand-secondary);
  color: #fff;
}

.text {
  display: flex;
  flex-direction: column;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}
small {
  font-size: 0.9rem;
  color: var(--faint);
}
</style>
