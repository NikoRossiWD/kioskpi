<script setup lang="ts">
// L'orologio si aggiorna solo lato client: niente differenze tra ora del server e del browser.
const now = ref<Date | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' })
const dateFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

onMounted(() => {
  now.value = new Date()
  // Allinea il tick all'inizio del secondo successivo, poi 1 aggiornamento al secondo (leggero per il Pi)
  setTimeout(() => {
    now.value = new Date()
    timer = setInterval(() => (now.value = new Date()), 1000)
  }, 1000 - (Date.now() % 1000))
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="clock">
    <span class="time">{{ now ? timeFmt.format(now) : '--:--' }}</span>
    <span class="date">{{ now ? dateFmt.format(now) : '' }}</span>
  </div>
</template>

<style scoped>
.clock {
  display: flex;
  align-items: baseline;
  gap: 28px;
}

.time {
  font-size: 7rem;
  font-weight: 300;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.date {
  font-size: 2rem;
  color: var(--muted);
  display: inline-block;
}

/* "Giovedì 26 novembre": maiuscola solo sulla prima lettera, come si scrive in italiano */
.date::first-letter {
  text-transform: uppercase;
}
</style>
