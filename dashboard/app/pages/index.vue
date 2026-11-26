<script setup lang="ts">
// Pagina mostrata sul monitor del Pi.
// ?kiosk nell'URL → nasconde il cursore.
const route = useRoute()
useHead({
  bodyAttrs: { class: computed(() => ['screen', 'kiosk' in route.query ? 'kiosk' : ''].join(' ')) },
})
</script>

<template>
  <main class="dashboard">
    <div class="brand-bar" aria-hidden="true" />

    <header class="top">
      <DashClock />
      <img class="logo" src="/webison-logo.svg" alt="Webison" width="161" height="33">
    </header>

    <section class="grid">
      <DashCard title="Calendario" accent="primary">
        <p class="placeholder">Qui andranno gli eventi di oggi.</p>
      </DashCard>
      <DashCard title="To-do" accent="secondary">
        <p class="placeholder">Qui andrà la lista delle cose da fare.</p>
      </DashCard>
      <DashCard title="Note" accent="tertiary">
        <DashNotes />
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

.logo {
  height: 40px;
  width: auto;
  margin-bottom: 12px;
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
