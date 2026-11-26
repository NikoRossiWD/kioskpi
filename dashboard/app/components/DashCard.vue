<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  /** colore del pallino accanto al titolo */
  accent?: 'primary' | 'secondary' | 'tertiary'
}>(), { accent: 'primary' })
</script>

<template>
  <article class="card">
    <h2><span class="dot" :class="accent" />{{ title }}</h2>
    <div class="body"><slot /></div>
  </article>
</template>

<style scoped>
.card {
  background: linear-gradient(180deg, var(--surface-2), var(--surface));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  overflow: hidden;
}

h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot.primary { background: var(--brand-primary); box-shadow: 0 0 12px var(--brand-primary); }
.dot.secondary { background: var(--brand-secondary); box-shadow: 0 0 12px var(--brand-secondary); }
.dot.tertiary { background: var(--brand-tertiary); box-shadow: 0 0 12px var(--brand-tertiary); }

.body {
  flex: 1;
  min-height: 0;
}
</style>
