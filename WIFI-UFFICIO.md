# Collegare il Pi al Wi-Fi dell'ufficio (senza PC)

Ti servono: tastiera USB, il monitor collegato al Pi, la password di `raux`.
Una copia di questa guida è anche sul Pi: `cat ~/WIFI-UFFICIO.md`

---

## 0. Prima di partire

- Il Pi 3 vede **solo reti a 2,4 GHz**.
- ⚠️ **Router recenti (Wi-Fi 6/7) con sicurezza "WPA2+WPA3" e 2,4/5 GHz unite** (es. Fastweb dell'ufficio):
  il Pi 3 **non riesce a collegarsi**, anche con la password giusta. Sintomi: `nmtui`/`nmcli` richiede
  la password all'infinito ("Push of the WPS button... or password"), nei log
  `Authentication with ... timed out`. Non è la password e non è il segnale: il chip del Pi 3 non
  "parla" con quella rete. **Soluzione:** una seconda rete sul router in **solo WPA2** (sui Fastweb:
  Wi-Fi → Generale → "Rete personalizzata"; in ufficio è quella con `_2` nel nome). Vedi sezione 7.
- Le reti con **pagina di login nel browser** (captive portal, tipo hotel/ospiti) **non funzionano**
  senza un browser: chiedi all'IT una rete normale o un cavo Ethernet.
- Se in ufficio c'è un cavo di rete libero, collegarlo al Pi funziona subito, senza configurare niente.

## 1. Arrivare al prompt

1. Collega tastiera e monitor, poi alimentazione.
2. Aspetta la scritta `deskpi login:`.
   - Se sullo schermo c'è la dashboard (Chromium) e non il testo: premi **Ctrl + Alt + F2**
     per passare a una console testuale. (Per tornare alla dashboard: **Ctrl + Alt + F1** o **F7**.)
3. Scrivi `raux` e Invio, poi la password e Invio (la password non si vede mentre la scrivi).

Ora vedi `raux@deskpi:~ $`.

## 2. Metodo facile: menu `nmtui`

```bash
sudo nmtui
```

Si muove con **frecce**, **Tab** e **Invio**.

1. **Activate a connection** → scegli la rete dell'ufficio → Invio.
2. Se chiede la password, scrivila → Invio.
3. Compare un asterisco `*` accanto alla rete = connesso. **Back** → **Quit**.

Se la rete richiede **utente + password aziendali** (WPA2-Enterprise / 802.1X), il menu
"Activate" potrebbe non bastare: usa il metodo 3B.

## 3. Metodo con comandi (alternativa)

Vedere le reti disponibili:

```bash
nmcli device wifi list
```

### 3A. Rete con una sola password (WPA2/WPA3 Personal)

```bash
sudo nmcli device wifi connect "NOME_RETE" password "PASSWORD_WIFI"
```

### 3B. Rete aziendale con utente + password (WPA2-Enterprise)

Configurazione più comune (PEAP + MSCHAPv2). Chiedi conferma all'IT se non si collega.

```bash
sudo nmcli connection add type wifi con-name ufficio ifname wlan0 ssid "NOME_RETE" \
  wifi-sec.key-mgmt wpa-eap 802-1x.eap peap 802-1x.phase2-auth mschapv2 \
  802-1x.identity "TUO_UTENTE" 802-1x.password "TUA_PASSWORD"
sudo nmcli connection up ufficio
```

(Il `\` a fine riga serve a continuare il comando sulla riga successiva.)

## 4. Verificare

```bash
nmcli connection show --active     # deve comparire la rete dell'ufficio
hostname -I                        # mostra l'IP del Pi, es. 10.0.12.34 — annotalo
ping -c 3 google.com               # deve rispondere: internet ok
```

Da un altro PC in ufficio (stessa rete): `ssh raux@deskpi.local`
oppure, se non funziona, `ssh raux@<IP letto con hostname -I>`.

## 5. Uscire

```bash
exit
```

La rete resta salvata: al prossimo avvio il Pi si collega da solo a quella disponibile
(casa o ufficio).

---

## 6. Far mostrare al Pi la dashboard del PC dell'ufficio

Sul PC dell'ufficio: `ipconfig` → "Indirizzo IPv4" (es. 10.0.12.50). Poi sul Pi:

```bash
sudo nano /etc/default/deskpi
```

Cambia la riga `DESKPI_URL=http://...:3000/?kiosk` mettendo l'IP del PC dell'ufficio.
Salva: **Ctrl+O**, Invio, **Ctrl+X**. Poi:

```bash
sudo systemctl restart deskpi-kiosk
```

e **Ctrl+Alt+F1** per tornare alla dashboard. (Sul PC devono essere accesi `npm run emulators`
e `npm run dev`: vedi la checklist in cima al README.)

## 7. Se il Wi-Fi non va: cavo + configurazione da PC (metodo usato in ufficio il 2026-11-27)

1. Collega il Pi al router con un **cavo di rete** (non servono schermo né tastiera): prende un IP da solo.
2. Dal PC trova l'IP del Pi: `ping deskpi.local`, oppure cerca nella lista dispositivi del router un
   indirizzo che inizia con `B8:27:EB` (i Pi 3).
3. Dal PC (chiede la password di `raux` solo se la chiave SSH non è ancora sul Pi, vedi README 2.3):

   ```powershell
   ssh -t raux@IP_DEL_PI "sudo nmcli --ask device wifi connect NOME_RETE ifname wlan0 name ufficio2"
   ```

   `--ask` chiede la password del Wi-Fi nel terminale (non resta nella cronologia dei comandi).
4. Verifica: `ssh raux@IP_DEL_PI "nmcli device status; hostname -I"` → `wlan0 connected` con un secondo IP.
   Solo allora stacca il cavo: il Pi cambia IP (quello del Wi-Fi).

Per capire **perché** il Wi-Fi fallisce, col cavo attaccato:
`ssh raux@IP_DEL_PI "sudo journalctl -b -u wpa_supplicant --no-pager | tail -30"`
(`Authentication ... timed out` = incompatibilità col router; `WRONG_KEY` / `4-Way Handshake failed` = password).

## Problemi comuni

| Sintomo | Causa probabile | Cosa fare |
|---|---|---|
| Chiede la password all'infinito, anche giusta; log `Authentication ... timed out` | router WPA2+WPA3 / Wi-Fi 7 con bande unite | rete separata in solo WPA2 (sezione 0 e 7) |
| La rete non compare in `nmcli device wifi list` | è solo a 5 GHz | chiedere all'IT una rete 2,4 GHz, o usare il cavo |
| "Secrets were required, but not provided" | password sbagliata | ripetere il comando, attenzione a maiuscole e virgolette |
| Connesso ma `ping google.com` non risponde | captive portal o rete bloccata | chiedere all'IT / usare il cavo |
| `ssh deskpi.local` non funziona dal PC dell'ufficio | la rete blocca i nomi `.local` | usare l'IP |
| `ssh` non funziona nemmeno con l'IP | la rete isola i dispositivi | serve Tailscale/Raspberry Pi Connect (da configurare a casa) |
| Tastiera con simboli sbagliati | layout non italiano | `sudo raspi-config` → Localisation Options → Keyboard |

## Rimuovere una rete salvata

```bash
nmcli connection show              # elenco reti salvate
sudo nmcli connection delete "NOME_CONNESSIONE"
```
