import os
import pandas as pd
import PyPDF2
import docx2txt
import re
from datetime import datetime

base_dir = "/tmp/Operaciones"
data = []

def extract_info(text):
    objetivo = "Extracción automática no concluyente"
    version = "N/A"
    fecha = "N/A"
    resumen = "Requiere validación manual"
    
    if not text:
        return objetivo, version, fecha, resumen
        
    text = text.replace("\n", " ").replace("\r", " ")
    
    # Try to find Version (e.g., "Versión: 1.0" or "V1.0" or "v 02")
    v_match = re.search(r'(?i)versi[oó]n[\s:]*([A-Za-z0-9\.]+)', text)
    if v_match: version = v_match.group(1)[:10]
    
    # Try to find Date (e.g., "Fecha: 2026-05-20" or "20/05/2026")
    f_match = re.search(r'(?i)fecha[\s:]*([0-9]{2,4}[-/][0-9]{2}[-/][0-9]{2,4})', text)
    if f_match: fecha = f_match.group(1)
    
    # Try to find Objetivo
    o_match = re.search(r'(?i)objetivo(?:s)?\s*(.*?)(?:alcance|2\.|desarrollo|glosario)', text)
    if o_match: 
        obj_text = o_match.group(1).strip()
        if len(obj_text) > 10:
            objetivo = obj_text[:250] + ("..." if len(obj_text) > 250 else "")
            resumen = objetivo[:120] + "..."
            
    return objetivo, version, fecha, resumen

for root, dirs, files in os.walk(base_dir):
    if '2. Interno' not in root: continue
    for file in files:
        if file.startswith('~') or file.startswith('.'): continue
        
        full_path = os.path.join(root, file)
        ext = os.path.splitext(file)[1].lower()
        
        # Extract process and tipo
        parts = full_path.split('/')
        try:
            op_idx = parts.index('Operaciones')
            proceso = parts[op_idx+1]
        except:
            proceso = 'Desconocido'
            
        tipo = 'Otro'
        if 'Procedimiento' in root: tipo = 'Procedimiento'
        elif 'Formato' in root: tipo = 'Formato'
        elif 'Manual' in root: tipo = 'Manual'
        elif 'Caracterizaci' in root: tipo = 'Caracterización'
        
        # Read file text
        text = ""
        try:
            if ext == '.pdf':
                with open(full_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages[:3]: # read first 3 pages
                        t = page.extract_text()
                        if t: text += t + "\n"
            elif ext == '.docx':
                text = docx2txt.process(full_path)
        except Exception as e:
            text = ""
            
        if not text:
            objetivo, version, fecha, resumen = "No fue posible leer el archivo (formato binario u obsoleto)", "N/A", "N/A", "No fue posible extraer el texto."
        else:
            objetivo, version, fecha, resumen = extract_info(text)
            
        data.append({
            'Proceso': proceso,
            'Tipo Documental': tipo,
            'Nombre del Documento': file,
            'Ruta Completa': full_path.replace('/tmp/', 'C:\\Users\\samirna.beltran\\VELATIA\\Sistemas de Gestión Integrados (SGI) Colombia - Documentos\\').replace('/', '\\'),
            'Extensión': ext,
            'Fecha de Modificación': datetime.fromtimestamp(os.path.getmtime(full_path)).strftime('%Y-%m-%d %H:%M') if os.path.exists(full_path) else 'N/A',
            'Responsable': 'Sin asignar',
            'Objetivo': objetivo,
            'Versión': version,
            'Fecha': fecha,
            'Descripción del Documento': resumen
        })

df = pd.DataFrame(data)
df.to_excel("/tmp/Reporte_Documental_Completo.xlsx", index=False)
print("Excel generated at /tmp/Reporte_Documental_Completo.xlsx")
