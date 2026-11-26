<script setup lang="ts">
import type { StatDoc } from '#shared/types/models'

const { weather } = useWeather()

const now = useNow()
const { items: stats } = useCollection<StatDoc>('stats', 'order')

const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' })
const dateFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

const greeting = computed(() => {
  const h = now.value.getHours()
  if (h < 5) return 'Buonanotte'
  if (h < 13) return 'Buongiorno'
  if (h < 18) return 'Buon pomeriggio'
  return 'Buonasera'
})
</script>

<template>
  <section class="hero">
    <div class="time-block">
      <p class="greeting">{{ greeting }}</p>
      <p class="time tabular">{{ timeFmt.format(now) }}</p>
      <p class="date">{{ dateFmt.format(now) }}</p>
    </div>

    <div class="weather">
      <div v-if="!weather" class="now">
        <DashIcon name="cloud" :size="56" />
        <div>
          <p class="temp">--°</p>
          <p class="cond">Meteo in caricamento…</p>
        </div>
      </div>
      <template v-else>
        <div class="now">
          <DashIcon :name="weather.icon" :size="56" />
          <div>
            <p class="temp tabular">{{ weather.temp }}°</p>
            <p class="cond">{{ weather.condition }}</p>
            <p class="sub tabular">
              {{ weather.city }} · {{ weather.min }}° / {{ weather.max }}° ·
              <DashIcon name="drop" :size="16" /> {{ weather.rainChance }}%
            </p>
          </div>
        </div>
        <!-- Prossime 6 ore -->
        <ol class="hours">
          <li v-for="h in weather.hours" :key="h.time" :class="{ wet: h.rainChance >= 50 }">
            <span class="h-time tabular">{{ h.time }}</span>
            <DashIcon :name="h.icon" :size="26" />
            <span class="h-temp tabular">{{ h.temp }}°</span>
            <span class="h-rain tabular">{{ h.rainChance }}%</span>
          </li>
        </ol>
      </template>
    </div>

    <ul class="stats">
      <li v-for="s in stats" :key="s.id">
        <span class="label">{{ s.label }}</span>
        <span class="value tabular">{{ s.value }}</span>
        <span v-if="s.hint" class="hint">
          <DashIcon v-if="s.trend === 'up'" name="arrow-up" :size="14" />
          {{ s.hint }}
        </span>
      </li>
    </ul>

    <img class="logo" src="/webison-logo.svg" alt="Webison" width="161" height="33">
  </section>
</template>

<style scoped>
/* Fascia in testa col gradiente dell'hero di webison.it (statico) */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 56px;
  padding: 32px 44px;
  border-radius: var(--radius);
  background: var(--brand-gradient);
  color: #fff;
  overflow: hidden;
}

.greeting {
  font-size: 1.5rem;
  font-weight: 700;
  opacity: 0.9;
}

.time {
  font-size: 7rem;
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.date {
  font-size: 1.6rem;
  font-weight: 700;
  opacity: 0.9;
}
.date::first-letter { text-transform: uppercase; }

/* Meteo tutto su una riga: attuale + prossime ore */
.weather {
  display: flex;
  align-items: center;
  gap: 28px;
  padding-left: 48px;
  border-left: 2px solid rgba(255, 255, 255, 0.3);
}
.now {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hours {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 6px;
}
.hours li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 58px;
  padding: 8px 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
}
.hours li.wet { background: rgba(255, 255, 255, 0.24); }
.h-time { font-size: 0.9rem; font-weight: 700; opacity: 0.85; }
.h-temp { font-size: 1.15rem; font-weight: 900; }
.h-rain { font-size: 0.8rem; font-weight: 700; opacity: 0.85; }
.temp { font-size: 3.4rem; font-weight: 900; line-height: 1; }
.cond { font-size: 1.25rem; font-weight: 700; }
.sub {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.05rem;
  opacity: 0.85;
}

/* Numeri secondari: piccoli, in colonna sotto il logo */
.stats {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  justify-self: end;
  margin-top: 44px; /* spazio per il logo sopra */
}
.stats li {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 10px;
}
.label { font-size: 1rem; font-weight: 700; opacity: 0.85; }
.value { font-size: 1.35rem; font-weight: 900; line-height: 1.1; min-width: 2ch; text-align: right; }
.hint { display: none; }

/* Logo originale (scritta e toggle bianchi, pallino viola) sulla fascia colorata */
.logo {
  position: absolute;
  top: 28px;
  right: 44px;
  height: 30px;
  width: auto;
}
</style>
