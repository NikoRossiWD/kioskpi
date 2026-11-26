<script setup lang="ts">
import { stats, weather } from '~/data/demo'

const now = useNow()

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

    <ul class="stats">
      <li v-for="s in stats" :key="s.label">
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

.weather {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-left: 48px;
  border-left: 2px solid rgba(255, 255, 255, 0.3);
}
.temp { font-size: 3.4rem; font-weight: 900; line-height: 1; }
.cond { font-size: 1.25rem; font-weight: 700; }
.sub {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1.05rem;
  opacity: 0.85;
}

.stats {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  justify-self: end;
  width: min(100%, 620px);
  margin-top: 36px; /* spazio per il logo sopra */
}
.stats li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.label { font-size: 0.95rem; font-weight: 700; opacity: 0.9; }
.value { font-size: 2.5rem; font-weight: 900; line-height: 1.05; }
.hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.95rem;
  opacity: 0.85;
}

/* Logo in bianco sulla fascia colorata */
.logo {
  position: absolute;
  top: 28px;
  right: 44px;
  height: 30px;
  width: auto;
  filter: brightness(0) invert(1);
}
</style>
