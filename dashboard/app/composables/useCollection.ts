import { collection, onSnapshot, orderBy, query, type DocumentData } from 'firebase/firestore'
import type { WithId } from '#shared/types/models'

/**
 * Collezione Firestore in tempo reale: si aggiorna da sola a ogni modifica (onSnapshot).
 * Si scollega automaticamente quando il componente viene smontato.
 */
export function useCollection<T extends DocumentData>(name: string, order?: string) {
  const { $db } = useNuxtApp()
  const items = ref<WithId<T>[]>([]) as Ref<WithId<T>[]>
  const ready = ref(false)
  const error = ref<string | null>(null)

  const ref_ = collection($db, name)
  const q = order ? query(ref_, orderBy(order)) : ref_

  const stop = onSnapshot(
    q,
    (snap) => {
      items.value = snap.docs.map(d => ({ id: d.id, ...(d.data() as T) }))
      ready.value = true
      error.value = null
    },
    (e) => { error.value = e.message },
  )
  onScopeDispose(stop)

  return { items, ready, error }
}
