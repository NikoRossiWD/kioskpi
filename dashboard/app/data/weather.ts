// Meteo DEMO statico. Da sostituire con un'API (es. Open-Meteo: gratuita, senza chiave, chiamabile dal browser).
export const weather = {
  city: 'Milano',
  temp: 9,
  min: 5,
  max: 12,
  condition: 'Parzialmente nuvoloso',
  icon: 'partly' as const,
  rainChance: 20,
}
