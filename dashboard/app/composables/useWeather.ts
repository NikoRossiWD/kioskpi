/**
 * Meteo reale da Open-Meteo (https://open-meteo.com): gratuito, senza chiave, chiamabile dal browser.
 * Città configurabile in nuxt.config → runtimeConfig.public.weather.
 * Aggiornato ogni 15 minuti (i dati di Open-Meteo cambiano ogni 15 min).
 */

export type WeatherIcon = 'sun' | 'moon' | 'partly' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm'

export interface HourForecast {
  time: string // "HH:00"
  temp: number
  rainChance: number
  icon: WeatherIcon
}

export interface Weather {
  hours: HourForecast[] // prossime 6 ore
  city: string
  temp: number
  min: number
  max: number
  rainChance: number
  condition: string
  icon: WeatherIcon
}

// Codici meteo WMO → descrizione italiana + icona
function describe(code: number, isDay: boolean): { condition: string, icon: WeatherIcon } {
  if (code === 0) return { condition: isDay ? 'Sereno' : 'Sereno', icon: isDay ? 'sun' : 'moon' }
  if (code === 1) return { condition: 'Prevalentemente sereno', icon: isDay ? 'partly' : 'moon' }
  if (code === 2) return { condition: 'Parzialmente nuvoloso', icon: 'partly' }
  if (code === 3) return { condition: 'Coperto', icon: 'cloud' }
  if (code === 45 || code === 48) return { condition: 'Nebbia', icon: 'fog' }
  if (code >= 51 && code <= 57) return { condition: 'Pioviggine', icon: 'rain' }
  if (code >= 61 && code <= 67) return { condition: code >= 65 ? 'Pioggia forte' : 'Pioggia', icon: 'rain' }
  if (code >= 71 && code <= 77) return { condition: 'Neve', icon: 'snow' }
  if (code >= 80 && code <= 82) return { condition: 'Rovesci', icon: 'rain' }
  if (code === 85 || code === 86) return { condition: 'Rovesci di neve', icon: 'snow' }
  if (code >= 95) return { condition: 'Temporale', icon: 'storm' }
  return { condition: '—', icon: 'cloud' }
}

interface OpenMeteoResponse {
  current: { temperature_2m: number, weather_code: number, is_day: number }
  hourly: { time: string[], temperature_2m: number[], precipitation_probability: number[], weather_code: number[], is_day: number[] }
  daily: { temperature_2m_max: number[], temperature_2m_min: number[], precipitation_probability_max: number[] }
}

export function useWeather() {
  const { city, latitude, longitude } = useRuntimeConfig().public.weather
  const weather = useState<Weather | null>('weather', () => null)
  const error = useState<string | null>('weather-error', () => null)

  async function load() {
    try {
      const r = await $fetch<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
        query: {
          latitude,
          longitude,
          current: 'temperature_2m,weather_code,is_day',
          // forecast_hours parte dall'ora corrente: 7 = ora attuale + le 6 successive
          hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
          forecast_hours: 7,
          daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          timezone: 'Europe/Rome',
          forecast_days: 1,
        },
      })
      const h = r.hourly
      const hours = h.time.slice(1).map((t, i) => ({
        time: t.slice(11, 16),
        temp: Math.round(h.temperature_2m[i + 1]!),
        rainChance: h.precipitation_probability[i + 1] ?? 0,
        icon: describe(h.weather_code[i + 1]!, h.is_day[i + 1] === 1).icon,
      }))
      weather.value = {
        hours,
        city,
        temp: Math.round(r.current.temperature_2m),
        min: Math.round(r.daily.temperature_2m_min[0]!),
        max: Math.round(r.daily.temperature_2m_max[0]!),
        rainChance: r.daily.precipitation_probability_max[0] ?? 0,
        ...describe(r.current.weather_code, r.current.is_day === 1),
      }
      error.value = null
    }
    catch (e: any) {
      // Teniamo l'ultimo dato valido: lo schermo non si svuota per un errore di rete
      error.value = e?.message ?? 'Meteo non disponibile'
    }
  }

  const nuxtApp = useNuxtApp()
  if (import.meta.client && !nuxtApp._weatherTimer) {
    nuxtApp._weatherTimer = true
    load()
    setInterval(load, 15 * 60_000)
  }

  return { weather, error }
}

declare module '#app' {
  interface NuxtApp { _weatherTimer?: boolean }
}
