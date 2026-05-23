from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

app = FastAPI(title="Gestión de Ausencias Laborales API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResponsableBackup(BaseModel):
    nombre: str
    correo: str
    gestion: str

class AusenciaCreate(BaseModel):
    tipo_ausencia: str
    fecha_inicio: date
    fecha_fin: date
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    dia_completo: bool
    incluye_no_habiles: bool
    motivo: str
    observaciones: Optional[str] = None
    cantidad_responsables: int
    responsables_backup: List[ResponsableBackup]
    actividades_criticas: List[str]
    tiene_pendientes: bool
    descripcion_pendientes: Optional[str] = None
    archivo_adjunto: Optional[str] = None

class Ausencia(AusenciaCreate):
    id: int
    usuario: str
    rol: str
    estado: str = "PENDIENTE"
    riesgo: str = "BAJO"

# Mock database
mock_ausencias = [
    Ausencia(
        id=1, 
        usuario="Juan Perez", 
        rol="Operador",
        tipo_ausencia="Vacaciones", 
        fecha_inicio=date(2023, 10, 1), 
        fecha_fin=date(2023, 10, 15), 
        dia_completo=True,
        incluye_no_habiles=True,
        motivo="Vacaciones anuales",
        cantidad_responsables=1,
        responsables_backup=[ResponsableBackup(nombre="Pedro Gómez", correo="pedro@corphr.com", gestion="Atención de tickets prioritarios")],
        actividades_criticas=["Soporte"],
        tiene_pendientes=False,
        estado="PENDIENTE", 
        riesgo="BAJO"
    )
]

@app.get("/api/ausencias", response_model=List[Ausencia])
def get_ausencias():
    return mock_ausencias

@app.post("/api/ausencias", response_model=Ausencia)
def crear_ausencia(ausencia_in: AusenciaCreate):
    nueva_ausencia = Ausencia(
        id=len(mock_ausencias) + 1,
        usuario="Funcionario Actual",
        rol="Analista",
        estado="PENDIENTE",
        riesgo="ALTO" if "Proyecto crítico" in ausencia_in.actividades_criticas else "BAJO",
        **ausencia_in.dict()
    )
    mock_ausencias.append(nueva_ausencia)
    return nueva_ausencia
