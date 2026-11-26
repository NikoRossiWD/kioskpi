<script setup lang="ts">
import type { FocusDoc } from '#shared/types/models'

const { items: focus } = useCollection<FocusDoc>('focus', 'order')
const done = computed(() => focus.value.filter(f => f.done).length)
</script>

<template>
  <DashCard title="Focus di oggi" accent="secondary" :meta="`${done} di ${focus.length}`">
    <ol class="focus">
      <li v-for="(f, i) in focus" :key="f.id" :class="{ done: f.done }">
        <span class="check">
          <DashIcon v-if="f.done" name="check" :size="18" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="text">{{ f.text }}</span>
      </li>
    </ol>
  </DashCard>
</template>

<style scoped>
.focus {
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

.check {
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-weight: 900;
  font-size: 1.05rem;
  color: var(--brand-secondary);
  background: var(--brand-secondary-soft);
}
li.done .check { color: #fff; background: var(--brand-secondary); }

.text {
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.25;
}
li.done .text {
  color: var(--faint);
  text-decoration: line-through;
}
</style>
