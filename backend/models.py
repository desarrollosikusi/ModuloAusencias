from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from database import Base
from datetime import datetime

class SolicitudAdministrativaDB(Base):
    __tablename__ = "solicitudes_administrativas"

    id = Column(Integer, primary_key=True, index=True)
    tipo_solicitud = Column(String, index=True)
    tipo_compra = Column(String, nullable=True)
    pep = Column(String, nullable=True)
    ceco = Column(String, nullable=True)
    proveedor = Column(String, nullable=True)
    monto = Column(Float, nullable=True)
    moneda = Column(String, nullable=True)
    compra_planeada = Column(String, nullable=True)
    observaciones = Column(String, nullable=True)
    web_order = Column(String, nullable=True)
    deal_id = Column(String, nullable=True)
    ruta_cotizacion = Column(String, nullable=True)
    detalles_prestamo = Column(String, nullable=True)
    
    estado = Column(String, default="Abierto")
    gestor = Column(String, nullable=True)
    solicitante = Column(String, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Campos de Gestión (Llenados por el Gestor Financiero)
    fecha_cierre = Column(DateTime, nullable=True)
    fecha_orden_compra = Column(DateTime, nullable=True)
    orden_compra = Column(String(8), nullable=True)
    valor_final = Column(Float, nullable=True)
    moneda_final = Column(String, nullable=True)
    
    # Campos adicionales para CISCO (Gestión)
    cisco_quote = Column(String, nullable=True)
    cisco_so = Column(String, nullable=True)
    cisco_web_order_final = Column(String, nullable=True)

class PepIkusiDB(Base):
    __tablename__ = "peps_ikusi"

    id = Column(Integer, primary_key=True, index=True)
    folio = Column(String, index=True, nullable=True)
    codigo_sap = Column(String, nullable=True)
    codigo_pep = Column(String, nullable=True)
    cliente = Column(String, nullable=True)
    nombre_proyecto = Column(String, nullable=True)
    pm = Column(String, nullable=True)
    am = Column(String, nullable=True)
    observaciones = Column(String, nullable=True)
    vigencia = Column(Integer, nullable=True) # Año de vigencia
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

