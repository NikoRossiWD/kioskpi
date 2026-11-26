<script setup lang="ts">
import type { CommuteDoc } from '#shared/types/models'

/**
 * Ritorno a casa: tempo in auto dall'ufficio a ogni destinazione (collezione "commute").
 * Percorsi da OSRM (router.project-osrm.org): gratuito, senza chiave, ma SENZA traffico.
 * In più guarda il meteo delle prossime ore per avvisare se sta per piovere.
 */
const { office } = useRuntimeConfig().public
const { items: places } = useCollection<CommuteDoc>('commute', 'order')
const { weather } = useWeather()

const minutes = reactive<Record<string, number | null>>({})

async function route(p: CommuteDoc & { id: string }) {
  try {
    const r = await $fetch<{ routes: { duration: number }[] }>(
      `https://router.project-osrm.org/route/v1/driving/${office.longitude},${office.latitude};${p.lon},${p.lat}`,
      { query: { overview: 'false' } },
    )
    minutes[p.id] = Math.round(r.routes[0]!.duration / 60)
  }
  catch {
    // teniamo l'ultimo valore
  }
}
const loadAll = () => places.value.forEach(route)

watch(() => places.value.map(p => `${p.id}${p.lat}${p.lon}`).join(), loadAll)
let interval: ReturnType<typeof setInterval> | undefined
onMounted(() => { interval = setInterval(loadAll, 30 * 60_000) })
onBeforeUnmount(() => clearInterval(interval))

// Prima ora con pioggia probabile (≥ 50%) nelle prossime 6
const rain = computed(() => weather.value?.hours.find(h => h.rainChance >= 50) ?? null)
const raining = computed(() => (weather.value?.icon === 'rain' || weather.value?.icon === 'storm'))
</script>

<template>
  <DashCard title="Ritorno a casa" accent="primary" meta="senza traffico">
    <ul class="places">
      <li v-for="p in places" :key="p.id">
        <DashIcon name="car" :size="22" class="car" />
        <span class="label">{{ p.label }}</span>
        <span class="min tabular">{{ minutes[p.id] ?? '–' }} <small>min</small></span>
      </li>
    </ul>
    <p class="tip" :class="{ wet: raining || rain }">
      <DashIcon name="drop" :size="16" />
      <template v-if="raining">Sta piovendo: guida con calma</template>
      <template v-else-if="rain">Pioggia dalle {{ rain.time }}: esci prima</template>
      <template v-else>Niente pioggia in arrivo</template>
    </p>
  </DashCard>
</template>

<style scoped>
.places {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

li {
  display: flex;
  align-items: center;
  gap: 12px;
}
.car { color: var(--brand-primary); flex: none; }
.label { flex: 1; font-size: 1.15rem; font-weight: 700; }
.min { font-size: 1.4rem; font-weight: 900; }
.min small { font-size: 0.9rem; font-weight: 700; color: var(--muted); }

.tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--muted);
}
.tip.wet { color: var(--brand-primary); }
</style>
