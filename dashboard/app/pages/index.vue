<script setup lang="ts">
// Pagina mostrata sul monitor del Pi (progettata per 1920×1080, niente scroll).
// ?kiosk nell'URL → nasconde il cursore.
const route = useRoute()
useHead({
  bodyAttrs: { class: computed(() => ['screen', 'kiosk' in route.query ? 'kiosk' : ''].join(' ')) },
})
</script>

<template>
  <main class="dashboard">
    <DashHero />

    <div class="grid">
      <DashAgenda class="agenda" />
      <div class="col">
        <DashFocus />
        <DashProjects class="grow" />
      </div>
      <div class="col">
        <DashDeadlines />
        <DashNotes class="grow" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.dashboard {
  height: 100%;
  padding: 32px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: var(--gap);
}

.grid {
  display: grid;
  grid-template-columns: 1.1fr 1.25fr 1fr;
  gap: var(--gap);
  min-height: 0;
}

.col {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  min-height: 0;
}
.grow { flex: 1; }
</style>
