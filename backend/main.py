from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import date

app = FastAPI(title="Gestión de Ausencias Laborales API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Ausencia(BaseModel):
    id: int
    usuario: str
    tipo: str
    fecha_inicio: date
    fecha_fin: date
    dias: int
    estado: str
    riesgo: str

# Mock database
mock_ausencias = [
    Ausencia(id=1, usuario="Juan Perez", tipo="Vacaciones", fecha_inicio=date(2023, 10, 1), fecha_fin=date(2023, 10, 15), dias=15, estado="PENDIENTE", riesgo="BAJO"),
    Ausencia(id=2, usuario="Ana Gomez", tipo="Incapacidad", fecha_inicio=date(2023, 10, 5), fecha_fin=date(2023, 10, 7), dias=3, estado="APROBADA", riesgo="MEDIO"),
]

@app.get("/api/ausencias", response_model=List[Ausencia])
def get_ausencias():
    return mock_ausencias

@app.post("/api/ausencias")
def crear_ausencia(ausencia: Ausencia):
    mock_ausencias.append(ausencia)
    return {"message": "Ausencia creada exitosamente"}
