# -*- coding: utf-8 -*-
import os
import re
import json

base_dir = "/tmp/Operaciones"
data = []
next_id = 1

def get_carpeta_interna(root_path):
    rel_path = os.path.relpath(root_path, base_dir)
    parts = rel_path.split(os.sep)
    if len(parts) > 1:
        return "/".join(parts[1:])
    return ""

def process_directory(dir_path):
    global next_id
    process_name = "Desconocido"
    rel_path = os.path.relpath(dir_path, base_dir)
    parts = rel_path.split(os.sep)
    if len(parts) > 0 and parts[0] != ".":
        process_name = parts[0]
        
    carpeta = get_carpeta_interna(dir_path)
    
    items = os.listdir(dir_path)
    subdirs = [i for i in items if os.path.isdir(os.path.join(dir_path, i))]
    files = [i for i in items if os.path.isfile(os.path.join(dir_path, i))]
    
    if len(subdirs) == 0:
        if len(files) == 0:
            data.append({
                "id": next_id,
                "intranet": "Operaciones",
                "proceso": process_name,
                "carpeta": carpeta,
                "documento": None,
                "version": "-",
                "fecha": "-",
                "descripcion": "-"
            })
            next_id += 1
        else:
            for f in files:
                if f.startswith('~') or f.startswith('.'): continue
                data.append({
                    "id": next_id,
                    "intranet": "Operaciones",
                    "proceso": process_name,
                    "carpeta": carpeta,
                    "documento": f,
                    "version": "-",
                    "fecha": "-",
                    "descripcion": "-"
                })
                next_id += 1
    else:
        if len(files) > 0:
            for f in files:
                if f.startswith('~') or f.startswith('.'): continue
                data.append({
                    "id": next_id,
                    "intranet": "Operaciones",
                    "proceso": process_name,
                    "carpeta": carpeta,
                    "documento": f,
                    "version": "-",
                    "fecha": "-",
                    "descripcion": "-"
                })
                next_id += 1
                
        for s in subdirs:
            process_directory(os.path.join(dir_path, s))

if os.path.exists(base_dir):
    for p in os.listdir(base_dir):
        p_path = os.path.join(base_dir, p)
        if os.path.isdir(p_path):
            process_directory(p_path)

with open("/tmp/documentos.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("documentos.json generated successfully.")
