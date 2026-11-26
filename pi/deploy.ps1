# Deploy della dashboard sul Raspberry Pi (da lanciare sul PC, in PowerShell).
#
#   .\pi\deploy.ps1            build Nuxt + copia sul Pi + riavvio dell'app
#   .\pi\deploy.ps1 -System    in più reinstalla i file di sistema (servizi, script, policy, URL)
#
# Requisiti: chiave SSH configurata con l'alias "deskpi" (README, sezione 2.3).
param(
  [switch]$System,
  [string]$PiHost = 'deskpi'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$dash = Join-Path $root 'dashboard'
$pi = Join-Path $root 'pi'
$tmp = Join-Path $env:TEMP 'deskpi-output.tgz'

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Magenta }

Step 'Build Nuxt di produzione'
Push-Location $dash
try { npx nuxt build | Out-Host; if ($LASTEXITCODE) { throw 'Build fallita' } } finally { Pop-Location }

Step 'Compressione della build'
if (Test-Path $tmp) { Remove-Item $tmp }
tar -czf $tmp -C (Join-Path $dash '.output') .
if ($LASTEXITCODE) { throw 'tar fallito' }

Step 'Copia sul Pi'
scp $tmp "${PiHost}:/tmp/deskpi-output.tgz"
if ($LASTEXITCODE) { throw 'scp fallito' }

if ($System) {
  Step 'File di sistema (servizi, script, policy)'
  scp (Join-Path $pi 'deskpi-app.service') (Join-Path $pi 'deskpi-kiosk.service') (Join-Path $pi 'deskpi-browser') `
      (Join-Path $pi 'deskpi.env') (Join-Path $pi 'chromium-policy.json') "${PiHost}:/tmp/"
  if ($LASTEXITCODE) { throw 'scp fallito' }
  ssh $PiHost @'
set -e
cd /tmp
sed -i 's/\r$//' deskpi-app.service deskpi-kiosk.service deskpi-browser deskpi.env chromium-policy.json
sudo install -m 644 deskpi-app.service deskpi-kiosk.service /etc/systemd/system/
sudo install -m 755 deskpi-browser /usr/local/bin/deskpi-browser
sudo install -m 644 deskpi.env /etc/default/deskpi
sudo install -d /etc/chromium/policies/managed
sudo install -m 644 chromium-policy.json /etc/chromium/policies/managed/deskpi.json
rm deskpi-app.service deskpi-kiosk.service deskpi-browser deskpi.env chromium-policy.json
sudo systemctl daemon-reload
sudo systemctl enable deskpi-app deskpi-kiosk
'@
  if ($LASTEXITCODE) { throw 'Installazione file di sistema fallita' }
}

Step 'Installazione della nuova versione e riavvio'
# Estrae in una cartella nuova e poi la scambia con quella vecchia: se qualcosa va storto
# a metà, la versione precedente resta intatta in /opt/deskpi.prev
ssh $PiHost @'
set -e
sudo rm -rf /opt/deskpi.new
sudo mkdir -p /opt/deskpi.new
sudo tar -xzf /tmp/deskpi-output.tgz -C /opt/deskpi.new
sudo chown -R raux:raux /opt/deskpi.new
rm /tmp/deskpi-output.tgz
sudo rm -rf /opt/deskpi.prev
[ -d /opt/deskpi ] && sudo mv /opt/deskpi /opt/deskpi.prev
sudo mv /opt/deskpi.new /opt/deskpi
sudo systemctl restart deskpi-app
for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:3000/ && break; sleep 1; done
curl -s -o /dev/null -w 'App: HTTP %{http_code}\n' http://localhost:3000/
sudo systemctl restart deskpi-kiosk
'@
if ($LASTEXITCODE) { throw 'Deploy fallito' }

Remove-Item $tmp
Step 'Fatto. Il monitor si ricarica in qualche secondo.'
