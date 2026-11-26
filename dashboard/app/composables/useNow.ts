/**
 * Ora corrente condivisa da tutta la dashboard, aggiornata **una volta al minuto**
 * (allineata all'inizio del minuto). Non mostriamo i secondi: un solo ridisegno al minuto
 * invece di 60 è molto più leggero per il Raspberry Pi.
 */
export function useNow() {
  const now = useState<number>('now', () => Date.now())

  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    // Un solo timer per tutta l'app, anche se useNow() è chiamato da più componenti
    if (!nuxtApp._nowTimer) {
      nuxtApp._nowTimer = true
      const tick = () => {
        now.value = Date.now()
        setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
      }
      tick()
    }
  }

  return computed(() => new Date(now.value))
}

declare module '#app' {
  interface NuxtApp { _nowTimer?: boolean }
}
