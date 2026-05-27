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

def calcular_dias_habiles(fecha_inicio: datetime, fecha_fin: Optional[datetime] = None) -> int:
    # Si acaba de ser creada, son 0 días
    if not fecha_inicio:
        return 0
    dias_habiles = 0
    fecha_actual = fecha_inicio.date()
    hoy = fecha_fin.date() if fecha_fin else datetime.utcnow().date()
    
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
    fechaCierre: Optional[str] = None
    solicitante: Optional[str] = None
    detallesPrestamo: Optional[str] = None
    
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

class PepIkusiCreate(BaseModel):
    folio: Optional[str] = None
    codigo_sap: Optional[str] = None
    codigo_pep: Optional[str] = None
    cliente: Optional[str] = None
    nombre_proyecto: Optional[str] = None
    pm: Optional[str] = None
    am: Optional[str] = None
    observaciones: Optional[str] = None
    vigencia: Optional[int] = None

class PepIkusiResponse(PepIkusiCreate):
    id: int
    fecha_creacion: str

    class Config:
        from_attributes = True

class AssignPMRequest(BaseModel):
    pm: str

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
    solicitante: Optional[str] = Form(None),
    detallesPrestamo: Optional[str] = Form(None),
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
        solicitante=solicitante,
        ruta_cotizacion=ruta_archivo,
        detalles_prestamo=detallesPrestamo
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
        "solicitante": db_solicitud.solicitante,
        "diasHabiles": calcular_dias_habiles(db_solicitud.fecha_creacion, db_solicitud.fecha_cierre),
        "rutaCotizacion": db_solicitud.ruta_cotizacion,
        "fechaCierre": str(db_solicitud.fecha_cierre) if db_solicitud.fecha_cierre else None,
        "fechaOrdenCompra": str(db_solicitud.fecha_orden_compra) if db_solicitud.fecha_orden_compra else None,
        "ordenCompra": db_solicitud.orden_compra,
        "valorFinal": db_solicitud.valor_final,
        "monedaFinal": db_solicitud.moneda_final,
        "ciscoQuote": db_solicitud.cisco_quote,
        "ciscoSo": db_solicitud.cisco_so,
        "ciscoWebOrderFinal": db_solicitud.cisco_web_order_final,
        "detallesPrestamo": db_solicitud.detalles_prestamo
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
    solicitud.fecha_cierre = datetime.utcnow()

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
        "solicitante": solicitud.solicitante,
        "diasHabiles": calcular_dias_habiles(solicitud.fecha_creacion, solicitud.fecha_cierre),
        "rutaCotizacion": solicitud.ruta_cotizacion,
        "fechaCierre": str(solicitud.fecha_cierre) if solicitud.fecha_cierre else None,
        "fechaOrdenCompra": str(solicitud.fecha_orden_compra) if solicitud.fecha_orden_compra else None,
        "ordenCompra": solicitud.orden_compra,
        "valorFinal": solicitud.valor_final,
        "monedaFinal": solicitud.moneda_final,
        "ciscoQuote": solicitud.cisco_quote,
        "ciscoSo": solicitud.cisco_so,
        "ciscoWebOrderFinal": solicitud.cisco_web_order_final,
        "detallesPrestamo": solicitud.detalles_prestamo
    }

import json

@app.post("/api/logistica/{solicitud_id}/gestionar")
def gestionar_logistica(
    solicitud_id: int,
    gestor: str = Form(...),
    fechaLimite: str = Form(...),
    observaciones: Optional[str] = Form(None),
    contratoInicial: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    solicitud = db.query(SolicitudAdministrativaDB).filter(SolicitudAdministrativaDB.id == solicitud_id).first()
    if not solicitud:
        return {"error": "No encontrada"}

    filename = f"{datetime.utcnow().timestamp()}_{contratoInicial.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(contratoInicial.file, buffer)

    detalles = json.loads(solicitud.detalles_prestamo) if solicitud.detalles_prestamo else {}
    detalles["gestionLogistica"] = {
        "gestor": gestor,
        "fechaLimite": fechaLimite,
        "observaciones": observaciones,
        "rutaContratoInicial": filepath
    }
    
    solicitud.detalles_prestamo = json.dumps(detalles)
    solicitud.estado = "Pendiente firma contrato"
    
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
        "solicitante": solicitud.solicitante,
        "diasHabiles": calcular_dias_habiles(solicitud.fecha_creacion, solicitud.fecha_cierre),
        "rutaCotizacion": solicitud.ruta_cotizacion,
        "fechaCierre": str(solicitud.fecha_cierre) if solicitud.fecha_cierre else None,
        "fechaOrdenCompra": str(solicitud.fecha_orden_compra) if solicitud.fecha_orden_compra else None,
        "ordenCompra": solicitud.orden_compra,
        "valorFinal": solicitud.valor_final,
        "monedaFinal": solicitud.moneda_final,
        "ciscoQuote": solicitud.cisco_quote,
        "ciscoSo": solicitud.cisco_so,
        "ciscoWebOrderFinal": solicitud.cisco_web_order_final,
        "detallesPrestamo": solicitud.detalles_prestamo
    }

@app.post("/api/administrativa/{solicitud_id}/contrato-firmado")
def subir_contrato_firmado(
    solicitud_id: int,
    contratoFirmado: UploadFile = File(...),
    direccion: str = Form(None),
    fechaHora: str = Form(None),
    responsableRecepcion: str = Form(None),
    telefono: str = Form(None),
    observaciones: str = Form(None),
    db: Session = Depends(get_db)
):
    solicitud = db.query(SolicitudAdministrativaDB).filter(SolicitudAdministrativaDB.id == solicitud_id).first()
    if not solicitud:
        return {"error": "No encontrada"}

    filename = f"{datetime.utcnow().timestamp()}_{contratoFirmado.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(contratoFirmado.file, buffer)

    detalles = json.loads(solicitud.detalles_prestamo) if solicitud.detalles_prestamo else {}
    if "gestionLogistica" not in detalles:
        detalles["gestionLogistica"] = {}
    detalles["gestionLogistica"]["rutaContratoFirmado"] = filepath
    
    if direccion or fechaHora:
        detalles["entrega"] = {
            "direccion": direccion or "",
            "fechaHora": fechaHora or "",
            "responsableRecepcion": responsableRecepcion or "",
            "telefono": telefono or "",
            "observaciones": observaciones or ""
        }
    
    solicitud.detalles_prestamo = json.dumps(detalles)
    solicitud.estado = "Pendiente envío equipos"
    
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
        "solicitante": solicitud.solicitante,
        "diasHabiles": calcular_dias_habiles(solicitud.fecha_creacion, solicitud.fecha_cierre),
        "rutaCotizacion": solicitud.ruta_cotizacion,
        "fechaCierre": str(solicitud.fecha_cierre) if solicitud.fecha_cierre else None,
        "fechaOrdenCompra": str(solicitud.fecha_orden_compra) if solicitud.fecha_orden_compra else None,
        "ordenCompra": solicitud.orden_compra,
        "valorFinal": solicitud.valor_final,
        "monedaFinal": solicitud.moneda_final,
        "ciscoQuote": solicitud.cisco_quote,
        "ciscoSo": solicitud.cisco_so,
        "ciscoWebOrderFinal": solicitud.cisco_web_order_final,
        "detallesPrestamo": solicitud.detalles_prestamo
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
            "solicitante": sol.solicitante,
            "diasHabiles": calcular_dias_habiles(sol.fecha_creacion, sol.fecha_cierre),
            "rutaCotizacion": sol.ruta_cotizacion,
            "fechaCierre": str(sol.fecha_cierre) if sol.fecha_cierre else None,
            "fechaOrdenCompra": str(sol.fecha_orden_compra) if sol.fecha_orden_compra else None,
            "ordenCompra": sol.orden_compra,
            "valorFinal": sol.valor_final,
            "monedaFinal": sol.moneda_final,
            "ciscoQuote": sol.cisco_quote,
            "ciscoSo": sol.cisco_so,
            "ciscoWebOrderFinal": sol.cisco_web_order_final,
            "detallesPrestamo": sol.detalles_prestamo
        })
    return resultado

# ---------------------------------------------------------
# Endpoints PEPs Ikusi
# ---------------------------------------------------------

from models import PepIkusiDB

@app.post("/api/peps", response_model=PepIkusiResponse)
def crear_pep(pep: PepIkusiCreate, db: Session = Depends(get_db)):
    db_pep = PepIkusiDB(
        folio=pep.folio,
        codigo_sap=pep.codigo_sap,
        codigo_pep=pep.codigo_pep,
        cliente=pep.cliente,
        nombre_proyecto=pep.nombre_proyecto,
        pm=pep.pm,
        am=pep.am,
        observaciones=pep.observaciones,
        vigencia=pep.vigencia or datetime.utcnow().year
    )
    db.add(db_pep)
    db.commit()
    db.refresh(db_pep)
    
    return {
        **db_pep.__dict__,
        "fecha_creacion": str(db_pep.fecha_creacion)
    }

@app.get("/api/peps", response_model=List[PepIkusiResponse])
def get_peps(db: Session = Depends(get_db)):
    peps = db.query(PepIkusiDB).order_by(PepIkusiDB.id.desc()).all()
    resultado = []
    for pep in peps:
        data = {k: v for k, v in pep.__dict__.items() if not k.startswith('_')}
        data["fecha_creacion"] = str(pep.fecha_creacion)
        resultado.append(data)
    return resultado

@app.put("/api/peps/{pep_id}/assign-pm", response_model=PepIkusiResponse)
def assign_pm(pep_id: int, assign_req: AssignPMRequest, db: Session = Depends(get_db)):
    db_pep = db.query(PepIkusiDB).filter(PepIkusiDB.id == pep_id).first()
    if not db_pep:
        raise HTTPException(status_code=404, detail="PEP no encontrado")
        
    db_pep.pm = assign_req.pm
    db.commit()
    db.refresh(db_pep)
    
    return {
        **db_pep.__dict__,
        "fecha_creacion": str(db_pep.fecha_creacion)
    }
