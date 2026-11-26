// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false }, // la toolbar dei devtools comparirebbe anche sul monitor del Pi
  css: ['~/assets/css/main.css'],

  // Dove le API salvano i dati (note, ecc.): file JSON in .data/db, escluso da git.
  nitro: {
    storage: { db: { driver: 'fs', base: './.data/db' } },
    devStorage: { db: { driver: 'fs', base: './.data/db' } },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'it' },
      title: 'DeskPi',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
})
