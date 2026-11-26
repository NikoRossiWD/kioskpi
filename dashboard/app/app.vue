<script setup lang="ts">
// ?kiosk nell'URL → nasconde il cursore (lo usa Chromium sul Pi)
const route = useRoute()
useHead({ bodyAttrs: { class: computed(() => ('kiosk' in route.query ? 'kiosk' : '')) } })
</script>

<template>
  <main class="dashboard">
    <div class="brand-bar" aria-hidden="true" />

    <header class="top">
      <DashClock />
      <span class="wordmark">webison</span>
    </header>

    <section class="grid">
      <DashCard title="Calendario" accent="primary">
        <p class="placeholder">Qui andranno gli eventi di oggi.</p>
      </DashCard>
      <DashCard title="To-do" accent="secondary">
        <p class="placeholder">Qui andrà la lista delle cose da fare.</p>
      </DashCard>
      <DashCard title="Note" accent="tertiary">
        <p class="placeholder">Spazio libero: note, foto, quello che vorrai.</p>
      </DashCard>
    </section>
  </main>
</template>

<style scoped>
.dashboard {
  position: relative;
  height: 100%;
  padding: 48px;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 40px;
}

/* Sottile striscia col gradiente dell'hero Webison (statica: niente animazioni pesanti sul Pi) */
.brand-bar {
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  background: var(--brand-gradient);
}

.top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.wordmark {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--muted);
  letter-spacing: -0.01em;
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
