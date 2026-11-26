import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectAuthEmulator, getAuth } from 'firebase/auth'

/**
 * Firebase lato client. In locale si collega agli emulatori (npm run emulators):
 * l'host è quello da cui arriva la pagina, così funziona sia sul PC (localhost)
 * sia dal Pi o dal telefono (IP del PC).
 * Per la produzione basterà impostare NUXT_PUBLIC_USE_EMULATORS=false e la config vera.
 */
export default defineNuxtPlugin(() => {
  const { firebase, useEmulators } = useRuntimeConfig().public

  const app = initializeApp(firebase)
  const db = getFirestore(app)
  const auth = getAuth(app)

  if (useEmulators) {
    const host = window.location.hostname
    connectFirestoreEmulator(db, host, 8080)
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true })
  }

  return { provide: { db, auth } }
})
