// Avvia gli emulatori Firebase (Firestore + Auth + UI) conservando i dati tra un avvio e l'altro.
// I dati stanno in .firebase-data/ (non tracciata da git). Primo avvio: database vuoto → npm run seed
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'

const dir = './.firebase-data'
const args = ['firebase', 'emulators:start', '--export-on-exit', dir]
if (existsSync(`${dir}/firebase-export-metadata.json`)) args.push('--import', dir)

const child = spawn('npx', args, { stdio: 'inherit', shell: true })
child.on('exit', code => process.exit(code ?? 0))
