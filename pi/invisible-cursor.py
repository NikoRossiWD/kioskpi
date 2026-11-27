#!/usr/bin/env python3
# Crea il tema cursore "deskpi-invisible" (cursore 1x1 trasparente) in /usr/share/icons.
# cage disegna sempre un puntatore al centro dello schermo, anche senza mouse collegato;
# il servizio deskpi-kiosk usa questo tema (XCURSOR_THEME) così il puntatore non si vede.
# Uso sul Pi: sudo python3 invisible-cursor.py
# Ripristino: sudo rm -r /usr/share/icons/deskpi-invisible (e togliere XCURSOR_THEME dal servizio)
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
print(f'Tema creato in {THEME}')
