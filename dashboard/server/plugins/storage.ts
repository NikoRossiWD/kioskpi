import fsDriver from 'unstorage/drivers/fs'

/**
 * Storage "db" (note e futuri contenuti) montato all'avvio del server.
 * La cartella si sceglie con la variabile d'ambiente DESKPI_DATA_DIR:
 *   - sul Pi: /var/lib/deskpi (impostata dal servizio systemd)
 *   - sul PC: ./.data/db (default)
 * Fatto a runtime (non in nuxt.config) perché lì il percorso verrebbe fissato al momento della build.
 */
export default defineNitroPlugin(() => {
  const base = process.env.DESKPI_DATA_DIR || './.data/db'
  useStorage().mount('db', fsDriver({ base }))
})
