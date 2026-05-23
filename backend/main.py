import os
import shutil
from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import holidays

from database import engine, Base, get_db
from models import SolicitudAdministrativaDB

# Crear tablas en BD
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestión Administrativa y Ausencias API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utilidad para calcular días hábiles (Lunes-Viernes, sin festivos en Colombia)
co_holidays = holidays.Colombia()

def calcular_dias_habiles(fecha_inicio: datetime) -> int:
    # Si acaba de ser creada, son 0 días
    if not fecha_inicio:
        return 0
    dias_habiles = 0
    fecha_actual = fecha_inicio.date()
    hoy = datetime.utcnow().date()
    
    while fecha_actual < hoy:
        # 5 es Sábado, 6 es Domingo
        if fecha_actual.weekday() < 5 and fecha_actual not in co_holidays:
            dias_habiles += 1
        fecha_actual += timedelta(days=1)
        
    return dias_habiles

# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------
class SolicitudAdminResponse(BaseModel):
    id: int
    tipoSolicitud: str
    tipoCompra: Optional[str] = None
    pep: Optional[str] = None
    ceco: Optional[str] = None
    proveedor: Optional[str] = None
    monto: Optional[float] = None
    moneda: Optional[str] = None
    compraPlaneada: Optional[str] = None
    observaciones: Optional[str] = None
    webOrder: Optional[str] = None
    dealId: Optional[str] = None
    estado: str
    gestor: Optional[str] = None
    diasHabiles: int
    rutaCotizacion: Optional[str] = None
    
    # Nuevos campos de gestión
    fechaOrdenCompra: Optional[str] = None
    ordenCompra: Optional[str] = None
    valorFinal: Optional[float] = None
    monedaFinal: Optional[str] = None
    ciscoQuote: Optional[str] = None
    ciscoSo: Optional[str] = None
    ciscoWebOrderFinal: Optional[str] = None

    class Config:
        from_attributes = True

class SolicitudAdminGestionar(BaseModel):
    fecha_orden_compra: Optional[str] = None
    orden_compra: Optional[str] = None
    valor_final: Optional[float] = None
    moneda_final: Optional[str] = None
    gestor: str
    cisco_quote: Optional[str] = None
    cisco_so: Optional[str] = None
    cisco_web_order_final: Optional[str] = None

# Directorio de subida de archivos (Volumen persistente de Docker)
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------------------------------------
# Endpoints Gestión Administrativa
# ---------------------------------------------------------

@app.post("/api/administrativa", response_model=SolicitudAdminResponse)
def crear_solicitud_admin(
    tipoSolicitud: str = Form(...),
    tipoCompra: Optional[str] = Form(None),
    pep: Optional[str] = Form(None),
    ceco: Optional[str] = Form(None),
    proveedor: Optional[str] = Form(None),
    monto: Optional[float] = Form(None),
    moneda: Optional[str] = Form(None),
    compraPlaneada: Optional[str] = Form(None),
    observaciones: Optional[str] = Form(None),
    webOrder: Optional[str] = Form(None),
    dealId: Optional[str] = Form(None),
    cotizacion: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    ruta_archivo = None
    if cotizacion:
        # Guardar en volumen Docker
        filename = f"{datetime.utcnow().timestamp()}_{cotizacion.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(cotizacion.file, buffer)
        ruta_archivo = filepath

    db_solicitud = SolicitudAdministrativaDB(
        tipo_solicitud=tipoSolicitud,
        tipo_compra=tipoCompra,
        pep=pep,
        ceco=ceco,
        proveedor=proveedor,
        monto=monto,
        moneda=moneda,
        compra_planeada=compraPlaneada,
        observaciones=observaciones,
        web_order=webOrder,
        deal_id=dealId,
        ruta_cotizacion=ruta_archivo
    )
    db.add(db_solicitud)
    db.commit()
    db.refresh(db_solicitud)
    
    return {
        "id": db_solicitud.id,
        "tipoSolicitud": db_solicitud.tipo_solicitud,
        "tipoCompra": db_solicitud.tipo_compra,
        "pep": db_solicitud.pep,
        "ceco": db_solicitud.ceco,
        "proveedor": db_solicitud.proveedor,
        "monto": db_solicitud.monto,
        "moneda": db_solicitud.moneda,
        "compraPlaneada": db_solicitud.compra_planeada,
        "observaciones": db_solicitud.observaciones,
        "webOrder": db_solicitud.web_order,
        "dealId": db_solicitud.deal_id,
        "estado": db_solicitud.estado,
        "gestor": db_solicitud.gestor,
        "diasHabiles": calcular_dias_habiles(db_solicitud.fecha_creacion),
        "rutaCotizacion": db_solicitud.ruta_cotizacion,
        "fechaOrdenCompra": str(db_solicitud.fecha_orden_compra) if db_solicitud.fecha_orden_compra else None,
        "ordenCompra": db_solicitud.orden_compra,
        "valorFinal": db_solicitud.valor_final,
        "monedaFinal": db_solicitud.moneda_final,
        "ciscoQuote": db_solicitud.cisco_quote,
        "ciscoSo": db_solicitud.cisco_so,
        "ciscoWebOrderFinal": db_solicitud.cisco_web_order_final
    }

@app.put("/api/administrativa/{solicitud_id}/gestionar", response_model=SolicitudAdminResponse)
def gestionar_solicitud(solicitud_id: int, datos: SolicitudAdminGestionar, db: Session = Depends(get_db)):
    solicitud = db.query(SolicitudAdministrativaDB).filter(SolicitudAdministrativaDB.id == solicitud_id).first()
    if not solicitud:
        return {"error": "No encontrada"}
    
    if datos.fecha_orden_compra:
        solicitud.fecha_orden_compra = datetime.fromisoformat(datos.fecha_orden_compra.replace("Z", "+00:00"))
    
    solicitud.orden_compra = datos.orden_compra
    solicitud.valor_final = datos.valor_final
    solicitud.moneda_final = datos.moneda_final
    solicitud.gestor = datos.gestor
    solicitud.cisco_quote = datos.cisco_quote
    solicitud.cisco_so = datos.cisco_so
    solicitud.cisco_web_order_final = datos.cisco_web_order_final
    solicitud.estado = "Gestionado"

    db.commit()
    db.refresh(solicitud)

    return {
        "id": solicitud.id,
        "tipoSolicitud": solicitud.tipo_solicitud,
        "tipoCompra": solicitud.tipo_compra,
        "pep": solicitud.pep,
        "ceco": solicitud.ceco,
        "proveedor": solicitud.proveedor,
        "monto": solicitud.monto,
        "moneda": solicitud.moneda,
        "compraPlaneada": solicitud.compra_planeada,
        "observaciones": solicitud.observaciones,
        "webOrder": solicitud.web_order,
        "dealId": solicitud.deal_id,
        "estado": solicitud.estado,
        "gestor": solicitud.gestor,
        "diasHabiles": calcular_dias_habiles(solicitud.fecha_creacion),
        "rutaCotizacion": solicitud.ruta_cotizacion,
        "fechaOrdenCompra": str(solicitud.fecha_orden_compra) if solicitud.fecha_orden_compra else None,
        "ordenCompra": solicitud.orden_compra,
        "valorFinal": solicitud.valor_final,
        "monedaFinal": solicitud.moneda_final,
        "ciscoQuote": solicitud.cisco_quote,
        "ciscoSo": solicitud.cisco_so,
        "ciscoWebOrderFinal": solicitud.cisco_web_order_final
    }

@app.get("/api/administrativa", response_model=List[SolicitudAdminResponse])
def get_solicitudes_admin(db: Session = Depends(get_db)):
    solicitudes = db.query(SolicitudAdministrativaDB).order_by(SolicitudAdministrativaDB.id.desc()).all()
    resultado = []
    for sol in solicitudes:
        resultado.append({
            "id": sol.id,
            "tipoSolicitud": sol.tipo_solicitud,
            "tipoCompra": sol.tipo_compra,
            "pep": sol.pep,
            "ceco": sol.ceco,
            "proveedor": sol.proveedor,
            "monto": sol.monto,
            "moneda": sol.moneda,
            "compraPlaneada": sol.compra_planeada,
            "observaciones": sol.observaciones,
            "webOrder": sol.web_order,
            "dealId": sol.deal_id,
            "estado": sol.estado,
            "gestor": sol.gestor,
            "diasHabiles": calcular_dias_habiles(sol.fecha_creacion),
            "rutaCotizacion": sol.ruta_cotizacion,
            "fechaOrdenCompra": str(sol.fecha_orden_compra) if sol.fecha_orden_compra else None,
            "ordenCompra": sol.orden_compra,
            "valorFinal": sol.valor_final,
            "monedaFinal": sol.moneda_final,
            "ciscoQuote": sol.cisco_quote,
            "ciscoSo": sol.cisco_so,
            "ciscoWebOrderFinal": sol.cisco_web_order_final
        })
    return resultado
