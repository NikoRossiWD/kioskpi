# Desk Dashboard su Raspberry Pi 3

Diario di bordo del setup: cosa è stato fatto, con quali comandi e come ripristinare.
Serve a replicare tutto su un altro Pi.

## Ripartire da un altro PC (es. ufficio)

```powershell
git clone https://github.com/NikoRossiWD/kioskpi.git
cd kioskpi/dashboard
npm install
npm run dev
```

- **Wi-Fi dell'ufficio sul Pi** (tastiera + monitor, senza PC): [WIFI-UFFICIO.md](WIFI-UFFICIO.md),
  copia anche sul Pi con `cat ~/WIFI-UFFICIO.md`.
- **SSH dal nuovo PC:** `ssh raux@deskpi.local` (o l'IP) con la password; per entrare senza
  password creare una chiave nuova su quel PC (sezione 2.3). Non copiare la chiave privata.
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
┌──── Raspberry Pi 3 (Lite) ────┐          ┌──── App Nuxt ─────────────────────┐
│ cage + Chromium kiosk ────────┼─ URL ──► │ ora: dev server sul PC            │
│ cron: monitor on/off          │          │ poi: build sul Pi o cloud         │
└───────────────────────────────┘          │ server routes: iCal, meteo, ...   │
                                           └───────────────────────────────────┘
```

- **Per ora tutto in locale**: niente Firebase finché non sappiamo cosa mostrare. L'app Nuxt gira
  sul PC (`nuxi dev --host`) oppure, quando sarà stabile, come build servita dal Pi stesso.
  Il cloud si aggiunge solo se serve (dati modificabili da telefono, ecc.).
- Il Pi è un **thin client**: mostra solo una pagina.
- **Durante lo sviluppo** Chromium sul Pi può aprire il dev server del PC
  (`nuxi dev --host`, es. `http://<ip-pc>:3000`) → hot reload direttamente sul monitor.

### Piano fasi aggiornato

1. microSD con Raspberry Pi OS Lite 64-bit
2. Primo avvio, SSH, aggiornamenti, controlli (temperatura, undervoltage, RAM), Wi-Fi ufficio
3. Kiosk: `cage` + Chromium a schermo intero all'avvio (systemd), su una pagina di test
4. Ottimizzazioni: cursore nascosto, no blanking di giorno, monitor spento 23:30–7:30, Wi-Fi stabile
5. App Nuxt: scheletro, calendario (iCal via server route), meteo, to-do, note… (contenuti da decidere)

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

```
dashboard/
├─ nuxt.config.ts                 devtools off, CSS globale, storage "db" su .data/db
├─ app/pages/index.vue            /       → schermo del Pi: orologio + 3 card
├─ app/pages/admin.vue            /admin  → gestione contenuti (anche da telefono)
├─ app/components/DashClock.vue   ora e data in italiano, aggiornata ogni secondo
├─ app/components/DashCard.vue    contenitore dei widget (pallino colore brand)
├─ app/components/DashNotes.vue   note sulla dashboard, ricaricate ogni 15 s
├─ app/assets/css/main.css        variabili brand, tema scuro, ?kiosk = cursore nascosto
├─ public/webison-logo.svg        logo (da webison.it)
├─ shared/types/note.ts           tipo Note condiviso tra pagine e API
└─ server/
   ├─ utils/notes.ts              lettura/scrittura note + validazione
   └─ api/notes/                  GET / POST /api/notes, PUT / DELETE /api/notes/:id
```

### Contenuti e admin

- Le note sono salvate in `dashboard/.data/db/notes.json` (escluso da git): semplici e locali.
- Gestione da `http://<ip>:3000/admin`: aggiungi, modifica, elimina, scegli il colore.
- La dashboard rilegge le note ogni 15 secondi.
- ⚠️ **Admin e API di scrittura non sono protetti**: chiunque sia sulla stessa rete può modificare
  le note. Protezione prevista con **Firebase Auth** (il punto da toccare è la funzione `api()` in
  `admin.vue` e un controllo del token nelle API `server/api/notes/*`).

Comandi (dal PC, nella cartella `dashboard`):

```powershell
npm install
npm run dev        # avvia su http://localhost:3000 e su tutta la rete locale (--host 0.0.0.0)
npm run build      # build di produzione in .output/
```

- Dal Pi (fase 3) Chromium aprirà `http://<ip-del-pc>:3000/?kiosk` durante lo sviluppo.
  IP del PC a casa il 2026-11-26: `192.168.0.133` (può cambiare).
- Al primo `npm run dev` Windows può chiedere di consentire Node.js nel firewall: consentire
  **solo sulle reti private**, altrimenti il Pi non raggiunge il PC.
- Risoluzione del monitor di test: 1920×1080.
