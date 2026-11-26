# Collegare il Pi al Wi-Fi dell'ufficio (senza PC)

Ti servono: tastiera USB, il monitor collegato al Pi, la password di `raux`.
Una copia di questa guida è anche sul Pi: `cat ~/WIFI-UFFICIO.md`

---

## 0. Prima di partire

- Il Pi 3 vede **solo reti a 2,4 GHz**.
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

## Problemi comuni

| Sintomo | Causa probabile | Cosa fare |
|---|---|---|
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
