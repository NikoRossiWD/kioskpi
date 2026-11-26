<script setup lang="ts">
// Pagina aperta dal QR della dashboard: "badge" di arrivo in ufficio.
// Per ora solo un messaggio; in futuro potrà registrare l'ingresso su Firestore.
useHead({ title: 'Check-in · DeskPi' })

const now = new Date()
const time = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(now)
const date = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
</script>

<template>
  <main class="checkin">
    <img src="/webison-logo.svg" alt="Webison" width="161" height="33" class="logo">

    <div class="badge" aria-hidden="true">
      <DashIcon name="check" :size="56" />
    </div>

    <h1>Bentornato in ufficio,<br>buon lavoro!</h1>

    <p class="when">
      Check-in alle <strong>{{ time }}</strong><br>
      <span class="date">{{ date }}</span>
    </p>
  </main>
</template>

<style scoped>
.checkin {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 32px 16px;
  text-align: center;
  color: #fff;
  background: var(--brand-gradient);
}

.logo {
  height: 32px;
  width: auto;
}

.badge {
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  color: var(--brand-primary);
  background: #fff;
  box-shadow: 0 10px 30px rgba(36, 28, 53, 0.25);
}

h1 {
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.when {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.5;
}
.date::first-letter { text-transform: uppercase; }
.date { display: inline-block; opacity: 0.85; }
</style>
