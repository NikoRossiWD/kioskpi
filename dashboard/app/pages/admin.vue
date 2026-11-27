<script setup lang="ts">
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { FOCUS_MAX_LENGTH, NOTE_ACCENTS, NOTE_MAX_LENGTH, type FocusDoc, type NoteAccent, type NoteDoc, type WithId } from '#shared/types/models'

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
const focusDone = computed(() => focus.value.filter(f => f.done).length)

const focusDraft = ref('')
function addFocus() {
  const text = focusDraft.value.trim()
  if (!text) return
  const order = Math.max(0, ...focus.value.map(f => f.order)) + 1
  return run(async () => {
    await addDoc(collection($db, 'focus'), { text, done: false, order })
    focusDraft.value = ''
  })
}

const focusEditing = ref<string | null>(null)
const focusEditText = ref('')
function startFocusEdit(f: WithId<FocusDoc>) {
  focusEditing.value = f.id
  focusEditText.value = f.text
}
function saveFocusEdit(id: string) {
  const text = focusEditText.value.trim()
  if (!text) return
  return run(async () => {
    await updateDoc(doc($db, 'focus', id), { text })
    focusEditing.value = null
  })
}

function removeFocus(f: WithId<FocusDoc>) {
  if (!confirm(`Eliminare il to-do?\n\n"${f.text.slice(0, 80)}"`)) return
  return run(() => deleteDoc(doc($db, 'focus', f.id)))
}

// Sposta su/giù: riscrive l'ordine 1..n di tutta la lista (sistema anche eventuali buchi o doppioni)
function moveFocus(index: number, delta: -1 | 1) {
  const list = [...focus.value]
  const target = index + delta
  if (target < 0 || target >= list.length) return
  ;[list[index], list[target]] = [list[target]!, list[index]!]
  return run(async () => {
    const batch = writeBatch($db)
    list.forEach((f, i) => { if (f.order !== i + 1) batch.update(doc($db, 'focus', f.id), { order: i + 1 }) })
    await batch.commit()
  })
}

function clearDone() {
  const done = focus.value.filter(f => f.done)
  if (!done.length || !confirm(`Togliere ${done.length} to-do fatti dalla lista?`)) return
  return run(async () => {
    const batch = writeBatch($db)
    done.forEach(f => batch.delete(doc($db, 'focus', f.id)))
    await batch.commit()
  })
}

const userLabel = computed(() => user.value?.displayName || user.value?.email || '')
const initials = computed(() => userLabel.value.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(s => s[0]!.toUpperCase()).join(''))
</script>

<template>
  <div class="page">
    <header class="masthead">
      <div class="masthead-inner">
        <img src="/webison-logo.svg" alt="Webison" width="161" height="33" class="logo">
        <div class="heading">
          <span class="eyebrow">DeskPi</span>
          <h1>Pannello di controllo</h1>
        </div>
        <div v-if="user" class="account">
          <span class="avatar" aria-hidden="true">{{ initials }}</span>
          <span class="who" :title="userLabel">{{ userLabel }}</span>
          <button class="ghost" @click="logout">Esci</button>
        </div>
      </div>
    </header>

    <main class="admin">
    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <section v-if="authReady && !user" class="panel login">
      <h2>Accesso</h2>
      <p class="lead">Accedi per modificare to-do e note che compaiono sullo schermo dell'ufficio.</p>
      <button class="btn" :disabled="busy" @click="login">Accedi con Google</button>
    </section>

    <div v-else-if="user" class="grid">
      <section class="panel todo">
        <div class="panel-head">
          <h2>To-do di oggi</h2>
          <span class="count tabular">{{ focusDone }}/{{ focus.length }} fatti</span>
        </div>
        <div class="progress" aria-hidden="true">
          <span :style="{ width: focus.length ? `${(focusDone / focus.length) * 100}%` : '0%' }" />
        </div>

        <form class="add-row" @submit.prevent="addFocus">
          <input
            v-model="focusDraft"
            type="text"
            class="field"
            :maxlength="FOCUS_MAX_LENGTH"
            placeholder="Aggiungi un to-do…"
            aria-label="Nuovo to-do"
          >
          <button class="btn" :disabled="busy || !focusDraft.trim()">Aggiungi</button>
        </form>

        <p v-if="!focus.length" class="muted">Nessun to-do: aggiungine uno qui sopra.</p>

        <ul class="focus">
          <li v-for="(f, i) in focus" :key="f.id" :class="{ editing: focusEditing === f.id }">
            <template v-if="focusEditing === f.id">
              <form class="edit-row" @submit.prevent="saveFocusEdit(f.id)">
                <input
                  v-model="focusEditText"
                  type="text"
                  class="field"
                  :maxlength="FOCUS_MAX_LENGTH"
                  aria-label="Testo del to-do"
                  @keydown.esc="focusEditing = null"
                >
                <button type="button" class="link" @click="focusEditing = null">Annulla</button>
                <button class="btn small" :disabled="busy || !focusEditText.trim()">Salva</button>
              </form>
            </template>
            <template v-else>
              <label class="check">
                <input type="checkbox" :checked="f.done" :disabled="busy" @change="toggleFocus(f)">
                <span :class="{ done: f.done }">{{ f.text }}</span>
              </label>
              <div class="tools">
                <button class="icon" :disabled="busy || i === 0" title="Sposta su" aria-label="Sposta su" @click="moveFocus(i, -1)">↑</button>
                <button class="icon" :disabled="busy || i === focus.length - 1" title="Sposta giù" aria-label="Sposta giù" @click="moveFocus(i, 1)">↓</button>
                <button class="link" @click="startFocusEdit(f)">Modifica</button>
                <button class="link danger" @click="removeFocus(f)">Elimina</button>
              </div>
            </template>
          </li>
        </ul>

        <div v-if="focusDone" class="panel-foot">
          <button class="link" :disabled="busy" @click="clearDone">Togli i fatti ({{ focusDone }})</button>
        </div>
      </section>

      <div class="side">
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
      </div>
    </div>

    <footer v-if="authReady" class="foot">
      <a href="/">Apri la dashboard</a>
    </footer>
    </main>
  </div>
</template>

<style scoped>
.page { --wrap: 1200px; }

/* Fascia in testa col gradiente del brand (come l'hero della dashboard), logo bianco */
.masthead {
  background: var(--brand-gradient);
  color: #fff;
  padding: 28px 16px 92px;
}
.masthead-inner {
  max-width: var(--wrap);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px 28px;
  flex-wrap: wrap;
}
.logo { height: 30px; width: auto; display: block; }
.heading { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 2px; }
.eyebrow {
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.85;
}
h1 { font-size: 1.6rem; font-weight: 900; line-height: 1.1; letter-spacing: -0.01em; white-space: nowrap; }

.account { display: flex; align-items: center; gap: 10px; min-width: 0; }
.avatar {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.85rem;
  font-weight: 900;
  color: var(--brand-primary);
  background: #fff;
}
.who {
  font-weight: 700;
  font-size: 0.95rem;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ghost {
  font: inherit;
  font-weight: 900;
  font-size: 0.9rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  padding: 7px 16px;
  cursor: pointer;
}
.ghost:hover { background: rgba(255, 255, 255, 0.28); }
.ghost:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

/* I pannelli salgono sopra la fascia */
.admin {
  max-width: var(--wrap);
  margin: -64px auto 0;
  padding: 0 24px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Desktop: to-do a sinistra (più largo), note a destra */
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}
.side { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
@media (min-width: 960px) {
  .grid { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 24px; }
}
.login { max-width: 640px; }

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
.login { align-items: flex-start; padding: 32px; }
.lead { font-size: 1.1rem; color: var(--muted); max-width: 46ch; }

.panel-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.count { font-weight: 900; color: var(--brand-primary); }
.progress {
  height: 6px;
  border-radius: 999px;
  background: var(--brand-primary-soft);
  overflow: hidden;
  margin-top: -6px;
}
.progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--brand-gradient-violet);
  transition: width 0.3s ease;
}

h2 {
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
h2 small { font-weight: 700; letter-spacing: 0; }

textarea,
.field {
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
.field { padding: 10px 14px; }
.field:focus { background: var(--surface); }
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
.btn.small { padding: 8px 18px; }

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
.link:disabled { opacity: 0.45; cursor: default; }

.add-row,
.edit-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.add-row .btn { flex: none; }

/* To-do: ogni riga ha la spunta a sinistra e gli strumenti a destra (visibili al passaggio su desktop) */
.focus {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.focus li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  margin: 0 -10px;
  border-radius: 12px;
}
.focus li:hover,
.focus li:focus-within { background: var(--surface-2); }
.focus li.editing { background: var(--brand-primary-soft); }
.edit-row { flex: 1; }
.check {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
}
.check span { overflow-wrap: anywhere; }
.check input { flex: none; width: 20px; height: 20px; accent-color: var(--brand-secondary); }
.focus .done { color: var(--faint); text-decoration: line-through; }

.tools { flex: none; display: flex; align-items: center; gap: 2px; }
.icon {
  font: inherit;
  font-weight: 900;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 0;
  background: none;
  color: var(--muted);
  cursor: pointer;
}
.icon:hover:not(:disabled) { background: var(--brand-primary-soft); color: var(--brand-primary); }
.icon:disabled { opacity: 0.3; cursor: default; }
/* Con il mouse gli strumenti compaiono sopra la riga al passaggio, così il testo usa tutta la larghezza */
@media (hover: hover) {
  .focus li { position: relative; }
  .focus li .tools {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    padding: 2px 4px 2px 12px;
    border-radius: 10px;
    background: var(--surface-2);
    box-shadow: -12px 0 12px -4px var(--surface-2);
    opacity: 0;
    pointer-events: none;
  }
  .focus li:hover .tools,
  .focus li:focus-within .tools { opacity: 1; pointer-events: auto; }
}

.panel-foot { display: flex; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 12px; }

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

.foot { display: flex; justify-content: center; padding-top: 4px; }
.foot a { color: var(--muted); font-weight: 700; text-decoration: none; }
.foot a:hover { color: var(--brand-primary); text-decoration: underline; }

@media (max-width: 560px) {
  .masthead { padding: 20px 16px 84px; }
  .logo { height: 24px; }
  .heading { order: 3; flex-basis: 100%; }
  .account { margin-left: auto; }
  .who { display: none; }
  .panel { padding: 20px; }
}
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
