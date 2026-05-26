from database import SessionLocal
from models import PepIkusiDB

def clear_peps():
    db = SessionLocal()
    try:
        deleted = db.query(PepIkusiDB).delete()
        db.commit()
        print(f"Deleted {deleted} old PEPs.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_peps()
