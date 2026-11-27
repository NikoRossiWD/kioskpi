// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  // App solo client (SPA): i dati arrivano da Firestore nel browser.
  // È anche il formato giusto per Firebase Hosting (file statici, gratuito).
  ssr: false,
  devtools: { enabled: false }, // la toolbar dei devtools comparirebbe anche sul monitor del Pi
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Valori per gli emulatori (progetto "demo-*": esiste solo in locale, nessun account reale).
      // Produzione: NUXT_PUBLIC_FIREBASE_API_KEY, NUXT_PUBLIC_FIREBASE_PROJECT_ID, ... nel file .env
      firebase: {
        apiKey: 'demo-key',
        authDomain: 'demo-deskpi.firebaseapp.com',
        projectId: 'demo-deskpi',
        appId: 'demo-app',
      },
      useEmulators: true,
      // Città del meteo (Open-Meteo). Coordinate: https://open-meteo.com/en/docs/geocoding-api
      weather: { city: 'Monza', latitude: 45.5845, longitude: 9.2744 },
      // Punto di partenza per "Ritorno a casa": ufficio (Via Schiaffino, Monza)
      office: { latitude: 45.58767, longitude: 9.26162 },
      // Chiave TomTom (gratis, 2.500 richieste/giorno) per i tempi CON traffico: NUXT_PUBLIC_TOMTOM_KEY nel .env.
      // Vuota = OSRM (gratis, senza chiave, ma senza traffico).
      tomtomKey: '',
    },
  },

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
