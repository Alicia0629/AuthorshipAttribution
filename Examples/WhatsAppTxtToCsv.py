import sys
import re
import pandas as pd

# Este script procesa un archivo .txt exportado de una conversación de WhatsApp, el cual se pasa como argumento al ejecutarlo. A continuación, genera un archivo .csv con dos columnas: Usuario y Mensaje.
archivo_txt = sys.argv[1]

with open(archivo_txt, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s(\d{1,2}:\d{2})\s-\s([^:]+):\s(.+?)(?=\n\d{1,2}/\d{1,2}/\d{2,4},\s\d{1,2}:\d{2}\s-\s[^:]+:|\Z)',
    re.DOTALL | re.MULTILINE
)

data = []
for match in pattern.finditer(content):
    usuario = match.group(3).strip()
    
    if usuario.startswith('+'):
        usuario = usuario.split(' ')[1]+"******"
    else:
        usuario = usuario.split(' ')[0]

    mensaje = match.group(4).strip()
    
    if mensaje and len(mensaje)>50 and not(mensaje.startswith('<') and mensaje.endswith('>')):
        data.append([usuario, mensaje])

df = pd.DataFrame(data, columns=['Usuario', 'Mensaje']).dropna().reset_index(drop=True)

archivo_csv = archivo_txt.replace('.txt', '.csv')
df.to_csv(archivo_csv, index=False, encoding='utf-8', escapechar='\\', quoting=1)
