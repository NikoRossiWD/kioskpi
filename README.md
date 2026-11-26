# Desk Dashboard su Raspberry Pi 3

Diario di bordo del setup: cosa è stato fatto, con quali comandi e come ripristinare.
Serve a replicare tutto su un altro Pi.

## Checklist: ripartire in ufficio (o da un altro PC)

**1. Pi sul Wi-Fi dell'ufficio** (tastiera + monitor sul Pi, senza PC):
segui [WIFI-UFFICIO.md](WIFI-UFFICIO.md). Copia anche sul Pi: dalla console `cat ~/WIFI-UFFICIO.md`
(con la dashboard a schermo: **Ctrl+Alt+F2** per la console). Annota l'IP del Pi (`hostname -I`).

**2. PC dell'ufficio: prerequisiti** (una volta) — **Node.js 20.19 o superiore** (consigliato 22/24,
verifica con `node -v`), Git e **Java 21** per gli emulatori:

```powershell
winget install EclipseAdoptium.Temurin.21.JRE
```

(chiudi e riapri il terminale dopo l'installazione di Java)

**3. Progetto:**

```powershell
git clone https://github.com/NikoRossiWD/kioskpi.git
cd kioskpi/dashboard
npm install
```

**4. Avvio** — due terminali, nella cartella `dashboard`:

```powershell
npm run emulators     # terminale 1: Firestore + Auth (aspetta "All emulators ready")
npm run seed          # solo la prima volta, con gli emulatori accesi: dati demo
npm run dev           # terminale 2: app su http://localhost:3000
```

- **Firewall di Windows:** al primo avvio chiede di consentire **Node.js** e **Java**: consenti.
  ⚠️ Se la rete dell'ufficio è classificata come **"Pubblica"**, consentire "solo reti private"
  blocca il Pi. In quel caso consenti anche su rete pubblica, oppure imposta la rete come privata
  (Impostazioni → Rete e Internet → Wi-Fi/Ethernet → Tipo di profilo di rete).

**5. IP del PC dell'ufficio:** `ipconfig` → "Indirizzo IPv4" (es. `10.0.12.50`).

**6. Puntare il Pi al PC dell'ufficio** — dal PC (chiede la password di `raux`; usa l'IP del Pi se
`deskpi.local` non funziona), sostituendo `IP_DEL_PC`:

```powershell
ssh -t raux@deskpi.local "sudo sed -i 's|^DESKPI_URL=.*|DESKPI_URL=http://IP_DEL_PC:3000/?kiosk|' /etc/default/deskpi && sudo systemctl restart deskpi-kiosk"
```

Senza SSH (tastiera sul Pi, console con Ctrl+Alt+F2): `sudo nano /etc/default/deskpi`, cambia la riga
`DESKPI_URL=`, salva (Ctrl+O, Invio, Ctrl+X), poi `sudo systemctl restart deskpi-kiosk` e Ctrl+Alt+F1.

**7. Verifica:** sul monitor la dashboard; admin da telefono/PC su `http://IP_DEL_PC:3000/admin`.

**A fine giornata:** chiudi gli emulatori con **Ctrl+C** nel loro terminale (non chiudendo la finestra):
così salvano i dati di test in `dashboard/.firebase-data/` e al prossimo avvio li ritrovi.

**Se il Pi mostra una pagina di errore:** PC e Pi sulla stessa rete? `npm run dev` ed emulatori accesi?
Firewall (punto 4)? Dal Pi: `curl -I http://IP_DEL_PC:3000` deve rispondere `200`.
Se la rete dell'ufficio isola i dispositivi tra loro, il Pi non può raggiungere il PC: serve un'altra rete.

Altre note:
- **SSH senza password dal PC dell'ufficio:** crea una chiave nuova su quel PC (sezione 2.3).
  Non copiare la chiave privata da un PC all'altro.
- Il repo è **pubblico**: mai committare password, token, URL iCal segreti (usare `.env`, già ignorato).

## Hardware

| Componente | Dettagli |
|---|---|
| Scheda | Raspberry Pi 3 Model B (1 GB RAM, Wi-Fi solo 2,4 GHz) |
| Storage | microSD 16 GB |
| Schermo | Monitor HDMI (non touch) |
| Alimentazione | Alimentatore ufficiale Raspberry Pi micro-USB **5,1 V / 2,5 A** ✅ verificato |
| PC di gestione | Windows 11 |

## Architettura (decisa il 2026-11-26)

Niente MagicMirror²: la dashboard è una **web app Nuxt scritta da noi**.

```
┌── Raspberry Pi 3 (Lite) ──┐         ┌── Oggi: PC ─────────────────────┐   ┌── Finale: Firebase ─────┐
│ cage + Chromium kiosk ────┼─ URL ─► │ Nuxt (SPA) npm run dev/preview  │ → │ Hosting (statico)       │
│ (solo schermo)            │         │ Emulatori: Firestore + Auth     │ → │ Firestore + Auth        │
└───────────────────────────┘         └─────────────────────────────────┘   └─────────────────────────┘
```

- **Il Pi è solo uno schermo**: Chromium apre un URL. Niente server né database sul Pi.
- **Oggi tutto in locale "come se fosse Firebase"**: stesso SDK e stesso codice della produzione,
  ma contro gli **emulatori Firebase** sul PC (progetto `demo-deskpi`, esiste solo in locale, gratis).
- **Finale**: Firebase Hosting + Firestore + Auth (piano gratuito). Per passare basta la config
  vera e `NUXT_PUBLIC_USE_EMULATORS=false`; sul Pi cambia solo `DESKPI_URL`.
- Niente App Hosting / Cloud Functions per ora (a pagamento). Integrazioni come Google Calendar:
  da decidere più avanti.

### Piano fasi aggiornato

1. microSD con Raspberry Pi OS Lite 64-bit
2. Primo avvio, SSH, aggiornamenti, controlli (temperatura, undervoltage, RAM), Wi-Fi ufficio
3. ✅ Kiosk: `cage` + Chromium a schermo intero all'avvio (systemd)
4. ⏸ Ottimizzazioni (rimandate): monitor spento di notte, Wi-Fi stabile, ecc. — da fare sulla build finale
5. 🔄 App Nuxt + Firebase (emulatori in locale): UI fatta con dati demo; poi integrazioni reali

*(Pulsantiera USB / ESP32: tolta dal piano il 2026-11-26, eventualmente da riprendere in futuro.)*

## Valori scelti (da compilare)

| Voce | Valore |
|---|---|
| Nome host | `deskpi` (raggiungibile come `deskpi.local`) |
| Utente | `raux` |
| Password | *non scriverla qui: tienila nel password manager* |
| Wi-Fi casa | rete di casa (nome non pubblicato: repo pubblico), un solo nome per 2,4 GHz (canale 4) e 5 GHz; il Pi 3 usa in automatico la 2,4 GHz |
| Wi-Fi ufficio | da aggiungere sul posto con [WIFI-UFFICIO.md](WIFI-UFFICIO.md) |
| Paese Wi-Fi | `IT` |
| Fuso orario | `Europe/Rome` |
| Tastiera | `it` |
| SSH | abilitato, autenticazione con password (passeremo alle chiavi in fase 2) |
| Sistema operativo | Raspberry Pi OS **Lite** (64-bit), senza desktop |
| Versione Imager usata | `...` |
| Data flash | `...` |

---

## Fase 1 — Preparazione microSD

### Scelta del sistema operativo

**Raspberry Pi OS Lite (64-bit)**, senza desktop.

- 64 bit perché Node.js e Chromium sono supportati meglio su ARM64; il supporto a 32 bit
  si sta riducendo.
- Lite perché con 1 GB di RAM il desktop consuma memoria inutile (~250–300 MB in più a riposo).
  Tutto si gestisce via SSH dal PC.
- Schermo: un compositor minimale (`cage`) che mostra **solo Chromium a schermo intero** (kiosk)
  sull'URL della dashboard Nuxt.
- Scartate: versione con desktop (più pesante, utile solo per chi non usa SSH); 32 bit;
  DietPi (strumenti non standard).

### Cambiare Wi-Fi senza desktop

- Da SSH: `sudo nmtui` (menu testuale) oppure `nmcli` (comandi). Si possono salvare più reti:
  il Pi si collega da solo a quella disponibile.
- Se il Pi non trova nessuna rete nota (es. in ufficio prima di averla aggiunta):
  collegare una tastiera USB, fare login sul monitor e usare `sudo nmtui`;
  oppure collegare un cavo Ethernet.
- Consiglio: aggiungere la rete dell'ufficio **da casa, prima di spostarsi**.

### Passi

1. Scaricare Raspberry Pi Imager da <https://www.raspberrypi.com/software/> e installarlo.
2. Inserire la microSD nel PC.
3. In Imager:
   - **Dispositivo**: Raspberry Pi 3
   - **Sistema operativo**: Raspberry Pi OS (other) → **Raspberry Pi OS Lite (64-bit)**
   - **Storage**: la microSD (controllare la capacità: ~14,8 GB)
4. Personalizzazione (pulsante "Modifica impostazioni" / passi della procedura guidata):
   - Nome host: `deskpi`
   - Utente e password
   - Wi-Fi: SSID e password della rete **2,4 GHz** di casa, paese `IT`
   - Fuso orario `Europe/Rome`, tastiera `it`
   - SSH: abilitato, con password
   - Telemetria: a scelta
5. Scrivere la scheda (⚠️ **cancella tutto il contenuto della microSD**) e attendere la verifica.
6. Espellere la microSD, inserirla nel Pi, collegare HDMI, poi alimentazione per ultima.

### Verifica

- [x] Imager termina con "Scrittura completata" e verifica OK
- [x] Al primo avvio il monitor mostra testo che scorre e poi `deskpi login:` (il primo boot può richiedere 2–5 minuti e un riavvio automatico)
  - Nota: al primo avvio è stato necessario staccare e riattaccare l'alimentazione. Da controllare
    eventuali errori del filesystem in fase 2.
- [x] Nessun messaggio `Undervoltage detected` visto
- [x] In rete: IP `192.168.0.194` (DHCP del router), `deskpi.local` risponde al ping, porta SSH 22 aperta

**Fase 1 completata il 2026-11-26.**

### Ripristino

Se qualcosa va storto basta ripetere la fase 1: Imager riscrive la scheda da zero.

---

## Fase 2 — SSH, aggiornamenti, controlli

### 2.1 Primo accesso SSH (con password)

```powershell
ssh raux@deskpi.local
```

Alla prima connessione rispondere `yes` alla domanda sull'autenticità dell'host.

### 2.2 Controllo iniziale (solo lettura)

```bash
hostname; uname -m; cat /etc/os-release | head -4; free -h; vcgencmd measure_temp; vcgencmd get_throttled
```

Risultato del 2026-11-26:

| Voce | Valore | Significato |
|---|---|---|
| hostname | `deskpi` | ok |
| architettura | `aarch64` | 64 bit ✅ |
| OS | Debian GNU/Linux 13 (trixie) | Raspberry Pi OS basato su Debian 13 |
| RAM | 905 Mi totali, 158 Mi usati, 746 Mi disponibili | ottimo, grazie a Lite |
| Swap | 904 Mi (0 usati) | memoria di riserva |
| Temperatura | 40,8 °C | ottima (problemi oltre 80 °C) |
| `get_throttled` | `0x0` | nessun undervoltage né surriscaldamento dall'avvio ✅ |

### 2.3 Chiave SSH (accesso senza password)

Sul PC (PowerShell) — chiave dedicata, senza passphrase:

```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\deskpi_ed25519" -N '""' -C "deskpi"
```

File `C:\Users\<utente>\.ssh\config` (scorciatoia `ssh deskpi`):

```
Host deskpi
    HostName deskpi.local
    User raux
    IdentityFile ~/.ssh/deskpi_ed25519
    IdentitiesOnly yes
```

Copia della chiave pubblica sul Pi (chiede la password un'ultima volta):

```powershell
Get-Content "$env:USERPROFILE\.ssh\deskpi_ed25519.pub" | ssh deskpi "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Verifica: `ssh deskpi hostname` deve rispondere `deskpi` senza chiedere password. ✅ (2026-11-26)

**Da un altro PC (es. ufficio):** stesso utente `raux`. Due modi:
- con password: `ssh raux@deskpi.local` (o `ssh raux@<ip-del-pi>` se `.local` non funziona sulla rete aziendale);
- con chiave: ripetere 2.3 su quel PC (**una chiave per ogni PC**, non copiare la chiave privata
  da un PC all'altro). Il file `authorized_keys` sul Pi può contenere più chiavi.
- Requisito: PC e Pi sulla stessa rete, e la rete non deve isolare i dispositivi tra loro.

### 2.4 sudo senza password (per l'utente `raux`)

Lanciato dal PC (chiede la password una volta):

```powershell
ssh -t deskpi "echo 'raux ALL=(ALL) NOPASSWD: ALL' | sudo tee /etc/sudoers.d/010_raux-nopasswd > /dev/null && sudo chmod 440 /etc/sudoers.d/010_raux-nopasswd && sudo visudo -c"
```

Verifica: `ssh deskpi "sudo -n true && echo SUDO-OK"` ✅

**Ripristino:** `ssh -t deskpi "sudo rm /etc/sudoers.d/010_raux-nopasswd"`

### 2.5 Controlli dopo il primo avvio (solo lettura)

```bash
sudo tune2fs -l /dev/mmcblk0p2 | grep -iE 'state|errors'   # stato filesystem
sudo dmesg | grep -iE 'ext4|voltage'                       # messaggi disco / alimentazione
sudo journalctl -b -p err --no-pager                       # errori dell'avvio corrente
timedatectl                                                # ora e fuso orario
nmcli connection show                                      # reti salvate
```

Esito 2026-11-26:
- Filesystem `clean` ✅. Lo stacco forzato al primo avvio ha lasciato solo un "orphan cleanup",
  riparato in automatico. Partizione estesa a tutta la scheda.
- Ora sincronizzata, fuso `Europe/Rome` ✅
- `userconfig.service` fallito/mascherato: normale, l'utente è stato creato da cloud-init (Imager).
- Errori `90-alsa-restore.rules` e `bluetoothd`: innocui (audio/bluetooth non usati).
- Wi-Fi: connessione `netplan-wlan0-<nome-rete>`, creata da Imager tramite cloud-init/netplan.

Spazio disco dopo l'installazione: `/` 2,8 GB usati su 14 GB (21%), `/boot/firmware` 75 MB su 505 MB.

### 2.6 Aggiornamento del sistema

Lanciato come servizio temporaneo (`systemd-run`), così continua anche se cade la connessione SSH;
`--force-confold` mantiene i file di configurazione esistenti senza fare domande.

```powershell
ssh deskpi "sudo systemd-run --unit=deskpi-upgrade --wait --collect --setenv=DEBIAN_FRONTEND=noninteractive bash -c 'apt-get update && apt-get -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold full-upgrade -y && apt-get autoremove -y'"
```

Log: `ssh deskpi "sudo journalctl -u deskpi-upgrade --no-pager"`

Esito 2026-11-26: completato in ~12 minuti ✅. Kernel aggiornato da `6.18.50` a `6.18.60`
→ serve un riavvio (`uname -r` mostra il kernel in uso, `ls /lib/modules` quelli installati).
Durante l'aggiornamento: temperatura 51,5 °C, `throttled=0x0`.

Riavvio: `ssh deskpi "sudo systemctl reboot"` (torna raggiungibile in ~1 minuto).
Dopo il riavvio: kernel `6.18.60+rpt-rpi-v8` ✅, 143 MB di RAM usati, Wi-Fi riconnesso da solo,
`throttled=0x0`.

**Fase 2 completata il 2026-11-26** (manca solo il Wi-Fi dell'ufficio: vedi WIFI-UFFICIO.md).

**Ripristino:** cancellare `deskpi_ed25519` e `deskpi_ed25519.pub` dal PC, la sezione `Host deskpi`
da `.ssh\config` e la riga che termina con `deskpi` in `~/.ssh/authorized_keys` sul Pi.

---

## Fase 3 — Kiosk: cage + Chromium all'avvio

**cage** è un compositor Wayland minimale: mostra una sola app a schermo intero (niente desktop,
~10–20 MB di RAM). Chromium gira dentro cage in modalità `--kiosk`.

### 3.1 Installazione

```powershell
ssh deskpi "sudo systemd-run --unit=deskpi-install --wait --collect --setenv=DEBIAN_FRONTEND=noninteractive apt-get install -y cage chromium fonts-noto-core"
```

Esito 2026-11-26: 190 pacchetti in ~10 min (cage 0.3.1, Chromium 156). Disco: 34% usato.

### 3.2 File di configurazione (cartella `pi/` del repo)

| File nel repo | Destinazione sul Pi | Ruolo |
|---|---|---|
| `pi/deskpi.env` | `/etc/default/deskpi` | **URL da mostrare** (`DESKPI_URL=...`) |
| `pi/deskpi-browser` | `/usr/local/bin/deskpi-browser` | avvia Chromium in kiosk con le opzioni giuste |
| `pi/deskpi-kiosk.service` | `/etc/systemd/system/deskpi-kiosk.service` | servizio: cage + Chromium su tty1, riavvio automatico dopo 5 s |

Installazione (dalla cartella `pi/` sul PC):

```powershell
scp deskpi.env deskpi-browser deskpi-kiosk.service deskpi:/tmp/
ssh deskpi "cd /tmp && sed -i 's/\r$//' deskpi.env deskpi-browser deskpi-kiosk.service && sudo install -m 644 deskpi.env /etc/default/deskpi && sudo install -m 755 deskpi-browser /usr/local/bin/deskpi-browser && sudo install -m 644 deskpi-kiosk.service /etc/systemd/system/deskpi-kiosk.service && sudo systemd-analyze verify /etc/systemd/system/deskpi-kiosk.service"
ssh deskpi "sudo systemctl daemon-reload && sudo systemctl enable --now deskpi-kiosk"
```

(`sed` toglie eventuali fine riga Windows; `install` copia e imposta i permessi in un colpo solo.)

**Policy Chromium** (`pi/chromium-policy.json` → `/etc/chromium/policies/managed/deskpi.json`):
disattiva traduttore, salvataggio password, autocompilazione, login Google, promozioni,
richieste di notifiche e posizione. Verifica sul Pi: aprire `chrome://policy` (non serve di solito).

```powershell
scp chromium-policy.json deskpi:/tmp/deskpi.json
ssh deskpi "sudo install -d /etc/chromium/policies/managed && sudo install -m 644 /tmp/deskpi.json /etc/chromium/policies/managed/deskpi.json && sudo systemctl restart deskpi-kiosk"
```

Anche la pagina Nuxt dichiara `translate="no"` e `<meta name="google" content="notranslate">`
(doppia protezione contro la barra del traduttore).

### 3.3 Uso quotidiano

```bash
sudo nano /etc/default/deskpi              # cambiare URL (es. IP del PC in ufficio)
sudo systemctl restart deskpi-kiosk        # applicare / ricaricare la pagina
systemctl status deskpi-kiosk              # stato
sudo journalctl -u deskpi-kiosk -f         # log in diretta
```

- Sul monitor: **Ctrl+Alt+F2** → console testuale; **Ctrl+Alt+F1** → di nuovo la dashboard.
- **Ripristino** (torna il login testuale sul monitor):
  `sudo systemctl disable --now deskpi-kiosk`

Esito 2026-11-26: servizio `active`, cage + 11 processi Chromium, RAM usata 335 MB / 904 (568 disponibili).
Dashboard visibile a schermo intero, nessuna barra del traduttore.

**Fase 3 completata il 2026-11-26.**

---

## Nota storica: app servita dal Pi (provata e rimossa)

Il 2026-11-26 abbiamo provato a servire la build di produzione dal Pi con Node.js
(più veloce del dev server). Rimossa lo stesso giorno: l'architettura finale è Firebase e il Pi
resta solo uno schermo. Rimosso anche Node.js dal Pi (`apt-get purge nodejs`).

**Velocità sul Pi durante i test:** il dev server (`npm run dev`) è lento sul Pi 3 (tanti moduli
non ottimizzati). Per vedere la velocità reale: `npm run build` e poi `npm run preview` sul PC.

---

## Note sulle reti (casa → ufficio)

Imager configura **una sola** rete Wi-Fi. Le altre si aggiungono con NetworkManager
(`nmtui` / `nmcli`): il Pi si collega automaticamente a quella disponibile.

Guida passo passo senza PC (tastiera + monitor sul Pi): **[WIFI-UFFICIO.md](WIFI-UFFICIO.md)**.
Una copia è anche sul Pi: `cat ~/WIFI-UFFICIO.md` (copiata con `scp WIFI-UFFICIO.md deskpi:~/`).

---

## Dashboard Nuxt (cartella `dashboard/`)

Progetto Nuxt 4 minimale, scritto a mano (niente template), CSS semplice senza framework.
Brand Webison (webison.it): font Red Hat Display (servito in locale con `@fontsource`),
viola `#4a2ed8`, magenta `#ee258e`, giallo `#ffeb5f`, gradiente dell'hero.

UI chiara, progettata per 1920×1080 senza scroll. Leggera per il Pi 3: niente blur, niente
animazioni continue, l'ora si aggiorna una volta al minuto.

```
dashboard/
├─ nuxt.config.ts                   SPA (ssr: false), config Firebase pubblica, emulatori sì/no
├─ firebase.json / .firebaserc      emulatori (Firestore 8080, Auth 9099, UI 4000), progetto demo-deskpi
├─ firestore.rules                  lettura libera, scrittura solo con login
├─ seed/demo.json                   dati DEMO inventati (tracciati: servono anche in ufficio)
├─ scripts/emulators.mjs            avvia gli emulatori salvando i dati in .firebase-data/ (non tracciata)
├─ scripts/seed.mjs                 svuota l'emulatore e carica seed/demo.json (date relative a oggi)
├─ shared/types/models.ts           modello dati: una collezione per sezione
├─ app/plugins/firebase.client.ts   init Firebase; con emulatori usa l'host della pagina (PC, Pi, telefono)
├─ app/composables/useCollection.ts collezione Firestore in tempo reale (onSnapshot)
├─ app/composables/useNow.ts        ora condivisa, aggiornata ogni minuto
├─ app/pages/index.vue              /       → schermo del Pi
├─ app/pages/admin.vue              /admin  → login + note + focus (anche da telefono)
├─ app/pages/checkin.vue            /checkin → "Bentornato in ufficio" (aperta dal QR)
├─ app/components/Dash*.vue         Hero (ora, meteo, numeri), Agenda, Focus, Progetti, Scadenze, Note, Check-in (QR)
├─ app/composables/useWeather.ts    meteo reale da Open-Meteo (gratis, senza chiave), ogni 15 min
└─ public/webison-logo*.svg         logo originale (su fondo colorato) e variante per fondo chiaro
```

### Meteo e check-in

- **Meteo:** [Open-Meteo](https://open-meteo.com), gratuito, nessuna chiave, chiamato dal browser.
  Città: **Monza**, in `nuxt.config.ts` → `runtimeConfig.public.weather` (nome + latitudine/longitudine).
  Mostra ora attuale + le **prossime 6 ore** (evidenziate se pioggia ≥ 50%).
  Se la rete cade resta l'ultimo dato valido.
- **QR check-in** (in basso a destra): codifica `<indirizzo della dashboard>/checkin`. Sul Pi è
  l'IP del PC (raggiungibile dai telefoni sulla stessa rete); aprendo la dashboard da `localhost`
  il QR punta a `localhost` e dal telefono non funziona. Generato in locale con `uqr` (nessun servizio esterno).

### Ritorno a casa, musica

- **Ritorno a casa** (in basso a destra, accanto al QR): tempi in auto da [OSRM](https://project-osrm.org) (gratis, senza chiave,
  **senza traffico**), aggiornati ogni 30 min, + avviso pioggia dalle prossime 6 ore del meteo.
  Partenza: `runtimeConfig.public.office` in `nuxt.config.ts` (ora centro di Monza: mettere
  l'indirizzo dell'ufficio). Destinazioni nella collezione `commute`: nel repo pubblico solo i
  comuni; i nomi si possono aggiungere nell'etichetta dall'UI degli emulatori.
- **Musica:** legge un documento della collezione `music`; un futuro connettore Spotify lo
  aggiornerà (il kiosk non deve fare login a Spotify).
- I numeri CRM (lead, preventivi, ore) sono stati tolti: torneranno quando ci sarà il CRM.

### Dati (Firestore)

| Collezione | Sezione | Fonte futura |
|---|---|---|
| `events` | Prossimi appuntamenti (max 3, compatta) | Google Calendar |
| `focus` | To-do di oggi (sezione principale) | admin / to-do |
| `projects` | Progetti attivi | admin / gestionale |
| `commute` | Ritorno a casa (destinazioni) | admin |
| `music` | "Sta suonando" (piccolo, in alto a destra) | connettore Spotify (futuro) |
| `deadlines` | Scadenze | admin / calendario |
| `notes` | Note | admin |

- **Emulatori:** `npm run emulators` (UI su `http://localhost:4000` per vedere/modificare i dati).
  I dati restano in `dashboard/.firebase-data/` (salvati alla chiusura con Ctrl+C), **mai nel repo**.
- **Dati demo:** `npm run seed` → cancella tutto nell'emulatore e ricarica `seed/demo.json`.
- **Tempo reale:** una modifica (admin o UI emulatori) compare subito sullo schermo.
- **Admin:** `http://<ip-del-pc>:3000/admin` → "Accedi con Google": in locale l'emulatore Auth
  mostra un account di prova (nessun account reale). Le regole rifiutano le scritture senza login.
- ⚠️ Prima di andare online: oggi la **lettura è pubblica** (va bene solo in locale). In produzione
  il kiosk dovrà autenticarsi (TODO in `firestore.rules`).

### Comandi (dal PC, cartella `dashboard`)

```powershell
npm run emulators   # Firestore + Auth + UI (serve Java)
npm run seed        # dati demo
npm run dev         # sviluppo con hot reload, anche dalla rete (--host 0.0.0.0)
npm run build; npm run preview   # versione ottimizzata (velocità reale sul Pi)
```

- Il Pi apre `http://<ip-del-pc>:3000/?kiosk`. IP del PC a casa il 2026-11-26: `192.168.0.133`.
- Windows chiederà di consentire **Node.js** e **Java** nel firewall: consentire **solo sulle reti
  private**, altrimenti il Pi non raggiunge app ed emulatori (porte 3000, 8080, 9099).
