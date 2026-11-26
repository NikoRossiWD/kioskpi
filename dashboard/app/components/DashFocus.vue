<script setup lang="ts">
import type { FocusDoc } from '#shared/types/models'

// To-do di oggi (collezione "focus"): prima le cose da fare, poi quelle fatte.
const { items } = useCollection<FocusDoc>('focus', 'order')
const todo = computed(() => items.value.filter(f => !f.done))
const done = computed(() => items.value.filter(f => f.done))
</script>

<template>
  <DashCard title="To-do di oggi" accent="secondary" :meta="`${done.length} di ${items.length} fatte`">
    <div class="progress" aria-hidden="true">
      <span :style="{ width: items.length ? `${(done.length / items.length) * 100}%` : '0%' }" />
    </div>

    <ol class="todo">
      <li v-for="(f, i) in todo" :key="f.id">
        <span class="check">{{ i + 1 }}</span>
        <span class="text">{{ f.text }}</span>
      </li>
    </ol>

    <p v-if="items.length && !todo.length" class="all-done">Tutto fatto, ottimo lavoro! 🎉</p>

    <ul v-if="done.length" class="todo done">
      <li v-for="f in done" :key="f.id">
        <span class="check"><DashIcon name="check" :size="18" /></span>
        <span class="text">{{ f.text }}</span>
      </li>
    </ul>
  </DashCard>
</template>

<style scoped>
.progress {
  height: 8px;
  margin-bottom: 20px;
  border-radius: 999px;
  background: var(--brand-secondary-soft);
  overflow: hidden;
}
.progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--brand-secondary);
}

.todo {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.todo.done {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  gap: 12px;
}

li {
  display: flex;
  align-items: center;
  gap: 16px;
}

.check {
  flex: none;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-weight: 900;
  font-size: 1.05rem;
  color: var(--brand-secondary);
  background: var(--brand-secondary-soft);
}
.done .check {
  width: 30px;
  height: 30px;
  color: #fff;
  background: var(--brand-secondary);
}

.text {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.25;
}
.done .text {
  font-size: 1.1rem;
  color: var(--faint);
  text-decoration: line-through;
}

.all-done {
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--brand-secondary);
}
</style>
