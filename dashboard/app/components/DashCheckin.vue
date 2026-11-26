<script setup lang="ts">
import { renderSVG } from 'uqr'

// QR "badge": inquadrato col telefono apre /checkin.
// Usa l'indirizzo da cui è servita la dashboard (es. http://IP-DEL-PC:3000), così funziona
// per chi è sulla stessa rete; in produzione sarà l'URL di Firebase Hosting.
const url = `${window.location.origin}/checkin`
const svg = renderSVG(url, { border: 1, blackColor: '#1e1e1e', whiteColor: '#ffffff' })
</script>

<template>
  <article class="checkin">
    <div class="qr" v-html="svg" />
    <p class="title">Check-in</p>
  </article>
</template>

<style scoped>
/* Compatto e verticale: sta accanto a "Ritorno a casa" */
.checkin {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 18px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.qr {
  flex: none;
  width: 112px;
  height: 112px;
  padding: 6px;
  border-radius: 12px;
  background: #fff;
  border: 2px solid var(--brand-primary-soft);
}
.qr :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.title {
  font-size: 1rem;
  font-weight: 900;
}
</style>
