import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Tomamos la URL de la base de datos de las variables de entorno inyectadas por Docker
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@localhost:5432/ausencias_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
