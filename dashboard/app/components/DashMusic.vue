<script setup lang="ts">
import type { MusicDoc } from '#shared/types/models'

// "Sta suonando" in piccolo. Legge il documento della collezione "music".
// In futuro un piccolo connettore Spotify aggiornerà quel documento:
// così il kiosk non deve fare login a Spotify.
const { items } = useCollection<MusicDoc>('music')
const track = computed(() => items.value[0])
</script>

<template>
  <div v-if="track" class="music" :class="{ paused: !track.playing }">
    <span class="cover" aria-hidden="true">
      <DashIcon name="music" :size="18" />
    </span>
    <span class="info">
      <span class="title">{{ track.title }}</span>
      <span class="artist">{{ track.artist }}</span>
    </span>
    <span v-if="track.playing" class="eq" aria-label="In riproduzione"><i /><i /><i /></span>
  </div>
</template>

<style scoped>
.music {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 340px;
  padding: 6px 14px 6px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.music.paused { opacity: 0.6; }

.cover {
  flex: none;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: var(--brand-primary);
  background: #fff;
}

.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.15;
}
.title, .artist {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title { font-size: 1rem; font-weight: 900; }
.artist { font-size: 0.85rem; font-weight: 700; opacity: 0.85; }

/* Barrette dell'equalizzatore: statiche (niente animazioni continue sul Pi 3) */
.eq {
  flex: none;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.eq i {
  width: 3px;
  border-radius: 2px;
  background: #fff;
}
.eq i:nth-child(1) { height: 8px; }
.eq i:nth-child(2) { height: 14px; }
.eq i:nth-child(3) { height: 10px; }
</style>
