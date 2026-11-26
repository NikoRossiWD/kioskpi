<script setup lang="ts">
// Piccolo set di icone a tratto (SVG inline: niente librerie, niente richieste extra).
defineProps<{
  name: 'sun' | 'moon' | 'cloud' | 'fog' | 'rain' | 'snow' | 'storm' | 'partly' | 'video' | 'check' | 'arrow-up' | 'drop'
  size?: number
}>()
</script>

<template>
  <svg
    :width="size ?? 24" :height="size ?? 24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <template v-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </template>
    <path v-else-if="name === 'moon'" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    <path v-else-if="name === 'cloud'" d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z" />
    <path v-else-if="name === 'fog'" d="M4 9h16M3 13h18M5 17h14" />
    <template v-else-if="name === 'snow'">
      <path d="M7 14h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 14z" />
      <path d="M8 18h.01M12 20h.01M16 18h.01M10 22h.01M14 22h.01" />
    </template>
    <template v-else-if="name === 'storm'">
      <path d="M7 14h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 14z" />
      <path d="M13 14l-3 4h4l-3 4" />
    </template>
    <template v-else-if="name === 'rain'">
      <path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 15z" />
      <path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" />
    </template>
    <template v-else-if="name === 'partly'">
      <path d="M8 3v1.5M3.5 8H2M4.8 4.8l1 1M11.2 4.8l-1 1" />
      <path d="M5.3 10.6A3.5 3.5 0 0 1 11 6.5" />
      <path d="M9 20h8a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.2A3 3 0 0 0 9 20z" />
    </template>
    <template v-else-if="name === 'video'">
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="M15 10l6-3v10l-6-3" />
    </template>
    <path v-else-if="name === 'check'" d="M5 12.5l4.5 4.5L19 7.5" />
    <path v-else-if="name === 'arrow-up'" d="M12 19V5M6 11l6-6 6 6" />
    <path v-else-if="name === 'drop'" d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
  </svg>
</template>
