<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  /** colore del pallino accanto al titolo */
  accent?: 'primary' | 'secondary' | 'tertiary' | 'teal'
  /** testo piccolo a destra del titolo (es. "3 di 6") */
  meta?: string
}>(), { accent: 'primary' })
</script>

<template>
  <article class="card">
    <header>
      <h2><span class="dot" :class="accent" />{{ title }}</h2>
      <span v-if="meta" class="meta">{{ meta }}</span>
    </header>
    <div class="body"><slot /></div>
  </article>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 26px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
  overflow: hidden;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.primary { background: var(--brand-primary); }
.dot.secondary { background: var(--brand-secondary); }
.dot.tertiary { background: #e8c900; }
.dot.teal { background: var(--brand-teal); }

.meta {
  font-size: 1rem;
  font-weight: 700;
  color: var(--muted);
}

.body {
  flex: 1;
  min-height: 0;
}
</style>
