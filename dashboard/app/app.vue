<script setup lang="ts">
// ?kiosk nell'URL → nasconde il cursore (lo userà Chromium sul Pi)
const route = useRoute()
useHead({ bodyAttrs: { class: computed(() => ('kiosk' in route.query ? 'kiosk' : '')) } })
</script>

<template>
  <main class="dashboard">
    <header class="top">
      <DashClock />
    </header>

    <section class="grid">
      <DashCard title="Calendario">
        <p class="placeholder">Qui andranno gli eventi di oggi.</p>
      </DashCard>
      <DashCard title="To-do">
        <p class="placeholder">Qui andrà la lista delle cose da fare.</p>
      </DashCard>
      <DashCard title="Note">
        <p class="placeholder">Spazio libero: note, foto, quello che vorrai.</p>
      </DashCard>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  height: 100%;
  padding: 48px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 40px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
  min-height: 0;
}

.placeholder {
  color: var(--muted);
  font-size: 1.25rem;
}
</style>
