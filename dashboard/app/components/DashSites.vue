<script setup lang="ts">
import type { SiteDoc } from '#shared/types/models'

/**
 * Semaforo dei siti dei clienti, controllato direttamente dal browser ogni 5 minuti.
 * fetch "no-cors": non legge la risposta (i siti non lo permettono), ma capisce se il sito
 * risponde o no (DNS, connessione, certificato, timeout) e in quanto tempo.
 * Limite: un sito che risponde con errore 500 risulta comunque "su".
 */
const { items: sites } = useCollection<SiteDoc>('sites', 'order')

type Status = { up: boolean | null, ms: number | null }
const status = reactive<Record<string, Status>>({})

const TIMEOUT = 8000
const SLOW = 1500

async function check(site: SiteDoc & { id: string }) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT)
  const t0 = performance.now()
  try {
    await fetch(site.url, { mode: 'no-cors', cache: 'no-store', signal: ctrl.signal })
    status[site.id] = { up: true, ms: Math.round(performance.now() - t0) }
  }
  catch {
    status[site.id] = { up: false, ms: null }
  }
  finally {
    clearTimeout(timer)
  }
}

const checkAll = () => sites.value.forEach(check)

watch(() => sites.value.map(s => s.id + s.url).join(), checkAll)
let interval: ReturnType<typeof setInterval> | undefined
onMounted(() => { interval = setInterval(checkAll, 5 * 60_000) })
onBeforeUnmount(() => clearInterval(interval))

const list = computed(() => sites.value.map((s) => {
  const st = status[s.id] ?? { up: null, ms: null }
  const level = st.up === null ? 'wait' : !st.up ? 'down' : (st.ms ?? 0) > SLOW ? 'slow' : 'up'
  return { ...s, ...st, level }
}))
const downCount = computed(() => list.value.filter(s => s.level === 'down').length)
</script>

<template>
  <DashCard title="Siti clienti" accent="teal" :meta="downCount ? `${downCount} offline` : 'Tutti online'">
    <ul class="sites">
      <li v-for="s in list" :key="s.id" :class="s.level">
        <span class="light" />
        <span class="name">{{ s.name }}</span>
        <span class="ms tabular">
          <template v-if="s.level === 'down'">offline</template>
          <template v-else-if="s.ms !== null">{{ s.ms }} ms</template>
          <template v-else>…</template>
        </span>
      </li>
    </ul>
  </DashCard>
</template>

<style scoped>
.sites {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 18px;
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.light {
  flex: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--faint);
}
li.up .light { background: var(--brand-teal); box-shadow: 0 0 0 4px rgba(35, 213, 171, 0.18); }
li.slow .light { background: #f2c200; box-shadow: 0 0 0 4px rgba(242, 194, 0, 0.2); }
li.down .light { background: var(--brand-secondary); box-shadow: 0 0 0 4px rgba(238, 37, 142, 0.22); }

.name {
  flex: 1;
  min-width: 0;
  font-size: 1.1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ms {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--muted);
}
li.down .ms { color: var(--brand-secondary); }
</style>
