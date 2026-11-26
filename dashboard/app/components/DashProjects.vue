<script setup lang="ts">
import { projects } from '~/data/demo'

function due(days: number) {
  if (days <= 0) return 'Scade oggi'
  if (days === 1) return 'Domani'
  return `${days} giorni`
}
</script>

<template>
  <DashCard title="Progetti attivi" accent="teal" :meta="`${projects.length} in corso`">
    <ul class="projects">
      <li v-for="p in projects" :key="p.name + p.client" :class="p.color">
        <div class="head">
          <p class="name">{{ p.name }} <span class="client">· {{ p.client }}</span></p>
          <p class="due tabular" :class="{ soon: p.dueInDays <= 5 }">{{ due(p.dueInDays) }}</p>
        </div>
        <div class="bar"><span :style="{ width: `${p.progress}%` }" /></div>
        <div class="foot">
          <span class="phase">{{ p.phase }}</span>
          <span class="pct tabular">{{ p.progress }}%</span>
        </div>
      </li>
    </ul>
  </DashCard>
</template>

<style scoped>
.projects {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

li.primary { --c: var(--brand-primary); }
li.secondary { --c: var(--brand-secondary); }
li.teal { --c: var(--brand-teal); }
li.tertiary { --c: #f2c200; }

.head, .foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.name { font-size: 1.25rem; font-weight: 900; }
.client { font-weight: 700; color: var(--muted); }
.due { font-size: 1.05rem; font-weight: 700; color: var(--muted); white-space: nowrap; }
.due.soon { color: var(--brand-secondary); }

.bar {
  height: 10px;
  margin: 8px 0 6px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--c);
}

.phase, .pct { font-size: 1rem; font-weight: 700; color: var(--muted); }
</style>
