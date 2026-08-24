"""
Configuração da conexão com o banco de dados (engine, sessão, base declarativa).
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # evita conexões "mortas" em pool
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Classe base para todos os models SQLAlchemy."""
    pass


def get_db() -> Generator:
    """
    Dependency do FastAPI: abre uma sessão por request e garante
    que ela seja fechada no final, mesmo em caso de erro.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
