import pandas as pd
import requests
import json
import math
import sys

# Load Excel file
try:
    df = pd.read_excel('/app/data.xlsx', sheet_name=0)
except Exception as e:
    print("Error loading excel:", e)
    sys.exit(1)

def clean_val(v):
    if pd.isna(v) or type(v) == float and math.isnan(v):
        return None
    return str(v).strip()

count = 0
for index, row in df.iterrows():
    # Detect if row is completely empty
    if pd.isna(row.get('CÓDIGODEPROYECTOPEP')):
        continue
        
    folio_val = clean_val(row.get('FOLIO2020') or row.get('FOLIO'))
    
    codigo_sap_val = clean_val(row.get('CÓDIGO DE PROGRAMA SAP'))
    
    # Extraer vigencia (año) desde las posiciones 9 y 10 (1-indexed) del Código SAP
    vigencia_val = 2024
    if codigo_sap_val and len(codigo_sap_val) >= 10:
        year_str = codigo_sap_val[8:10] # Índices 8 y 9 (0-indexed) corresponden a posiciones 9 y 10
        if year_str.isdigit():
            vigencia_val = 2000 + int(year_str)

    payload = {
        "folio": folio_val,
        "codigo_sap": codigo_sap_val,
        "codigo_pep": clean_val(row.get('CÓDIGODEPROYECTOPEP')),
        "cliente": clean_val(row.get('CLIENTE')),
        "nombre_proyecto": clean_val(row.get('NOMBRE DE PROYECTO ')),
        "pm": clean_val(row.get('PM')),
        "am": clean_val(row.get('AM')),
        "observaciones": clean_val(row.get('OBSERVACIONES')),
        "vigencia": vigencia_val
    }
    
    try:
        resp = requests.post('http://localhost:8000/api/peps', json=payload)
        if resp.status_code in [200, 201]:
            count += 1
        else:
            print(f"Failed row {index}: {resp.text}")
    except Exception as e:
        print(f"Error row {index}: {e}")

print(f"Successfully loaded {count} PEPs.")
