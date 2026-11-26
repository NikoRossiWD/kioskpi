<script setup lang="ts">
import { NOTE_ACCENTS, NOTE_MAX_LENGTH, type Note, type NoteAccent } from '#shared/types/note'

// Pannello per gestire i contenuti della dashboard. Pensato anche per il telefono.
// Nessuna protezione per ora: accessibile da chi è sulla stessa rete. Login con Firebase in seguito.
useHead({ title: 'DeskPi · Admin' })

const error = ref('')
const busy = ref(false)

const notes = ref<Note[]>([])
const draft = reactive<{ text: string, accent: NoteAccent }>({ text: '', accent: 'tertiary' })
const editing = ref<string | null>(null)
const editDraft = reactive<{ text: string, accent: NoteAccent }>({ text: '', accent: 'tertiary' })

const accentLabel: Record<NoteAccent, string> = { primary: 'Viola', secondary: 'Magenta', tertiary: 'Giallo' }

// Unico punto da cui passano le chiamate di scrittura: qui si aggiungerà il token Firebase.
function api<T>(url: string, opts: Parameters<typeof $fetch>[1] = {}) {
  return $fetch<T>(url, opts)
}

async function run(fn: () => Promise<unknown>) {
  busy.value = true
  error.value = ''
  try {
    await fn()
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || 'Errore di rete'
  }
  finally {
    busy.value = false
  }
}

async function load() {
  notes.value = await $fetch<Note[]>('/api/notes')
}

async function addNote() {
  if (!draft.text.trim()) return
  await run(async () => {
    await api('/api/notes', { method: 'POST', body: { ...draft } })
    draft.text = ''
    await load()
  })
}

function startEdit(note: Note) {
  editing.value = note.id
  editDraft.text = note.text
  editDraft.accent = note.accent
}

async function saveEdit(id: string) {
  await run(async () => {
    await api(`/api/notes/${id}`, { method: 'PUT', body: { ...editDraft } })
    editing.value = null
    await load()
  })
}

async function remove(note: Note) {
  if (!confirm(`Eliminare la nota?\n\n"${note.text.slice(0, 80)}"`)) return
  await run(async () => {
    await api(`/api/notes/${note.id}`, { method: 'DELETE' })
    await load()
  })
}

onMounted(() => run(load))
</script>

<template>
  <div class="admin">
    <div class="brand-bar" aria-hidden="true" />

    <header>
      <img src="/webison-logo.svg" alt="Webison" width="161" height="33" class="logo">
      <span class="title">DeskPi · Admin</span>
    </header>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <!-- Note -->
      <section class="panel">
        <h2>Nuova nota</h2>
        <form class="note-form" @submit.prevent="addNote">
          <textarea v-model="draft.text" rows="3" :maxlength="NOTE_MAX_LENGTH" placeholder="Scrivi una nota…" />
          <div class="row">
            <div class="accents" role="radiogroup" aria-label="Colore">
              <label v-for="a in NOTE_ACCENTS" :key="a" class="accent" :class="a" :title="accentLabel[a]">
                <input v-model="draft.accent" type="radio" name="accent" :value="a">
                <span class="sr">{{ accentLabel[a] }}</span>
              </label>
            </div>
            <button class="btn" :disabled="busy || !draft.text.trim()">Aggiungi</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <h2>Note sullo schermo <small>({{ notes.length }})</small></h2>
        <p v-if="!notes.length" class="muted">Ancora nessuna nota.</p>

        <ul class="list">
          <li v-for="note in notes" :key="note.id" :class="note.accent">
            <template v-if="editing === note.id">
              <textarea v-model="editDraft.text" rows="3" :maxlength="NOTE_MAX_LENGTH" />
              <div class="row">
                <div class="accents" role="radiogroup" aria-label="Colore">
                  <label v-for="a in NOTE_ACCENTS" :key="a" class="accent" :class="a" :title="accentLabel[a]">
                    <input v-model="editDraft.accent" type="radio" :name="`accent-${note.id}`" :value="a">
                    <span class="sr">{{ accentLabel[a] }}</span>
                  </label>
                </div>
                <div class="actions">
                  <button class="link" @click="editing = null">Annulla</button>
                  <button class="btn" :disabled="busy || !editDraft.text.trim()" @click="saveEdit(note.id)">Salva</button>
                </div>
              </div>
            </template>
            <template v-else>
              <p class="text">{{ note.text }}</p>
              <div class="actions">
                <button class="link" @click="startEdit(note)">Modifica</button>
                <button class="link danger" @click="remove(note)">Elimina</button>
              </div>
            </template>
          </li>
        </ul>
      </section>
  </div>
</template>

<style scoped>
.admin {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.brand-bar {
  position: fixed;
  inset: 0 0 auto 0;
  height: 5px;
  background: var(--brand-gradient);
}

header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.logo { height: 28px; width: auto; }
.title { font-weight: 700; color: var(--muted); flex: 1; }

.panel {
  background: linear-gradient(180deg, var(--surface-2), var(--surface));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h2 {
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
h2 small { font-weight: 700; letter-spacing: 0; }

textarea {
  width: 100%;
  font: inherit;
  font-size: 1.05rem;
  color: var(--text);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  resize: vertical;
}
input:focus-visible,
textarea:focus-visible,
button:focus-visible {
  outline: 2px solid var(--brand-tertiary);
  outline-offset: 2px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  font: inherit;
  font-weight: 900;
  color: #fff;
  background: var(--brand-gradient-violet);
  border: 0;
  border-radius: 999px;
  padding: 10px 22px;
  cursor: pointer;
}
.btn:disabled { opacity: 0.45; cursor: default; }

.link {
  font: inherit;
  font-weight: 700;
  color: var(--muted);
  background: none;
  border: 0;
  padding: 6px 4px;
  cursor: pointer;
}
.link:hover { color: var(--text); }
.link.danger:hover { color: var(--brand-secondary); }

.accents { display: flex; gap: 10px; }
.accent {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  outline: 2px solid transparent;
  outline-offset: 3px;
}
.accent input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
.accent:has(input:checked) { outline-color: #fff; }
.accent:has(input:focus-visible) { outline-color: var(--brand-tertiary); }
.accent.primary { background: var(--brand-primary); }
.accent.secondary { background: var(--brand-secondary); }
.accent.tertiary { background: var(--brand-tertiary); }

.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.list li {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 4px solid var(--accent);
}
.list li.primary { --accent: var(--brand-primary); }
.list li.secondary { --accent: var(--brand-secondary); }
.list li.tertiary { --accent: var(--brand-tertiary); }

.text { font-size: 1.1rem; font-weight: 700; white-space: pre-line; overflow-wrap: anywhere; }
.actions { display: flex; gap: 8px; justify-content: flex-end; }

.muted { color: var(--muted); }
.error {
  color: #fff;
  background: rgba(238, 37, 142, 0.18);
  border: 1px solid rgba(238, 37, 142, 0.5);
  border-radius: 12px;
  padding: 10px 14px;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
