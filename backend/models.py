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
    
    estado = Column(String, default="Abierto")
    gestor = Column(String, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
