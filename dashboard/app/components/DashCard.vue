<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <article class="card">
    <h2>{{ title }}</h2>
    <div class="body"><slot /></div>
  </article>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow: hidden;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.body {
  flex: 1;
  min-height: 0;
}
</style>
