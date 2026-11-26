<script setup lang="ts">
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { NOTE_ACCENTS, NOTE_MAX_LENGTH, type FocusDoc, type NoteAccent, type NoteDoc, type WithId } from '#shared/types/models'

// Pannello per gestire i contenuti della dashboard. Pensato anche per il telefono.
// Le scritture richiedono il login (regole Firestore). In locale l'emulatore Auth
// mostra un account di prova: nessun account Google reale.
useHead({ title: 'DeskPi · Admin' })

const { $db, $auth } = useNuxtApp()

const user = ref<User | null>(null)
const authReady = ref(false)
onAuthStateChanged($auth, (u) => { user.value = u; authReady.value = true })

const error = ref('')
const busy = ref(false)

async function run(fn: () => Promise<unknown>) {
  busy.value = true
  error.value = ''
  try { await fn() }
  catch (e: any) { error.value = e?.message || 'Errore' }
  finally { busy.value = false }
}

const login = () => run(() => signInWithPopup($auth, new GoogleAuthProvider()))
const logout = () => run(() => signOut($auth))

// --- Note ---
const { items: notesRaw } = useCollection<NoteDoc>('notes')
const notes = computed(() =>
  [...notesRaw.value].sort((a, b) => (b.updatedAt?.toMillis() ?? Date.now()) - (a.updatedAt?.toMillis() ?? Date.now())),
)

const accentLabel: Record<NoteAccent, string> = { primary: 'Viola', secondary: 'Magenta', tertiary: 'Giallo' }
const draft = reactive<{ text: string, accent: NoteAccent }>({ text: '', accent: 'tertiary' })
const editing = ref<string | null>(null)
const editDraft = reactive<{ text: string, accent: NoteAccent }>({ text: '', accent: 'tertiary' })

function addNote() {
  const text = draft.text.trim()
  if (!text) return
  return run(async () => {
    await addDoc(collection($db, 'notes'), { text, accent: draft.accent, updatedAt: serverTimestamp() })
    draft.text = ''
  })
}

function startEdit(note: WithId<NoteDoc>) {
  editing.value = note.id
  editDraft.text = note.text
  editDraft.accent = note.accent
}

function saveEdit(id: string) {
  const text = editDraft.text.trim()
  if (!text) return
  return run(async () => {
    await updateDoc(doc($db, 'notes', id), { text, accent: editDraft.accent, updatedAt: serverTimestamp() })
    editing.value = null
  })
}

function removeNote(note: WithId<NoteDoc>) {
  if (!confirm(`Eliminare la nota?\n\n"${note.text.slice(0, 80)}"`)) return
  return run(() => deleteDoc(doc($db, 'notes', note.id)))
}

// --- Focus di oggi ---
const { items: focus } = useCollection<FocusDoc>('focus', 'order')
const toggleFocus = (f: WithId<FocusDoc>) => run(() => updateDoc(doc($db, 'focus', f.id), { done: !f.done }))
</script>

<template>
  <div class="admin">
    <div class="brand-bar" aria-hidden="true" />

    <header>
      <img src="/webison-logo-dark.svg" alt="Webison" width="161" height="33" class="logo">
      <span class="title">DeskPi · Admin</span>
      <button v-if="user" class="link" @click="logout">Esci</button>
    </header>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <section v-if="authReady && !user" class="panel login">
      <h2>Accesso</h2>
      <p class="muted">Accedi per modificare i contenuti della dashboard.</p>
      <button class="btn" :disabled="busy" @click="login">Accedi con Google</button>
    </section>

    <template v-else-if="user">
      <p class="muted small">Connesso come {{ user.email || user.displayName }}</p>

      <section class="panel">
        <h2>Focus di oggi</h2>
        <ul class="focus">
          <li v-for="f in focus" :key="f.id">
            <label>
              <input type="checkbox" :checked="f.done" :disabled="busy" @change="toggleFocus(f)">
              <span :class="{ done: f.done }">{{ f.text }}</span>
            </label>
          </li>
        </ul>
      </section>

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
                <button class="link danger" @click="removeNote(note)">Elimina</button>
              </div>
            </template>
          </li>
        </ul>
      </section>
    </template>
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
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.login { align-items: flex-start; }

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
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  resize: vertical;
}
input:focus-visible,
textarea:focus-visible,
button:focus-visible {
  outline: 2px solid var(--brand-primary);
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

.focus {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.focus label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
}
.focus input { width: 20px; height: 20px; accent-color: var(--brand-secondary); }
.focus .done { color: var(--faint); text-decoration: line-through; }

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
.accent:has(input:checked) { outline-color: var(--text); }
.accent:has(input:focus-visible) { outline-color: var(--brand-primary); }
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
  background: var(--surface-2);
  border-left: 4px solid var(--accent);
}
.list li.primary { --accent: var(--brand-primary); }
.list li.secondary { --accent: var(--brand-secondary); }
.list li.tertiary { --accent: var(--brand-tertiary); }

.text { font-size: 1.1rem; font-weight: 700; white-space: pre-line; overflow-wrap: anywhere; }
.actions { display: flex; gap: 8px; justify-content: flex-end; }

.muted { color: var(--muted); }
.small { font-size: 0.9rem; }
.error {
  color: var(--text);
  background: var(--brand-secondary-soft);
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
