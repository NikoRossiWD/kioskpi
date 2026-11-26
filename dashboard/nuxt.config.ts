// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false }, // la toolbar dei devtools comparirebbe anche sul monitor del Pi
  css: ['~/assets/css/main.css'],

  // Dove le API salvano i dati: vedi server/plugins/storage.ts (DESKPI_DATA_DIR).

  app: {
    head: {
      // translate="no" + meta google notranslate: Chromium non propone il traduttore
      htmlAttrs: { lang: 'it', translate: 'no' },
      title: 'DeskPi',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'google', content: 'notranslate' },
      ],
    },
  },
})
