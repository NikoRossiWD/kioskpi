#!/usr/bin/env python3
# Crea il tema cursore "deskpi-invisible" (cursore 1x1 trasparente) in /usr/share/icons.
# cage disegna sempre un puntatore al centro dello schermo, anche senza mouse collegato;
# cage 0.3 ignora XCURSOR_THEME e carica sempre il tema "default": per questo lo script fa
# ereditare anche /usr/share/icons/default dal tema invisibile (copia dell'originale in index.theme.orig).
# Uso sul Pi: sudo python3 invisible-cursor.py   poi: sudo systemctl restart --no-block deskpi-kiosk
# Ripristino: sudo mv /usr/share/icons/default/index.theme.orig /usr/share/icons/default/index.theme
import os
import struct

THEME = '/usr/share/icons/deskpi-invisible'
NAMES = ['default', 'left_ptr', 'arrow', 'pointer', 'hand2', 'text', 'xterm', 'wait', 'watch']
SIZE = 24  # dimensione nominale

# Formato Xcursor: header + 1 voce di indice + 1 immagine 1x1 con pixel ARGB = 0 (trasparente)
header = struct.pack('<4sIII', b'Xcur', 16, 0x10000, 1)
toc = struct.pack('<III', 0xFFFD0002, SIZE, 16 + 12)
image = struct.pack('<IIIIIIIII', 36, 0xFFFD0002, SIZE, 1, 1, 1, 0, 0, 0) + struct.pack('<I', 0)
data = header + toc + image

os.makedirs(f'{THEME}/cursors', exist_ok=True)
with open(f'{THEME}/index.theme', 'w') as f:
    f.write('[Icon Theme]\nName=deskpi-invisible\nComment=Cursore invisibile per il kiosk\n')
with open(f'{THEME}/cursors/default', 'wb') as f:
    f.write(data)
for name in NAMES[1:]:
    link = f'{THEME}/cursors/{name}'
    if not os.path.lexists(link):
        os.symlink('default', link)
# Tema "default" del sistema -> cursore invisibile (è quello che usa cage)
DEFAULT = '/usr/share/icons/default/index.theme'
os.makedirs(os.path.dirname(DEFAULT), exist_ok=True)
if os.path.exists(DEFAULT) and not os.path.exists(DEFAULT + '.orig'):
    os.rename(DEFAULT, DEFAULT + '.orig')
with open(DEFAULT, 'w') as f:
    f.write('[Icon Theme]\nInherits=deskpi-invisible\n')
print(f'Tema creato in {THEME} e impostato come cursore predefinito')
