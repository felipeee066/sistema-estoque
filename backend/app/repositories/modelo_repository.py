from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.modelo import Modelo


class ModeloRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, modelo_id: int) -> Modelo | None:
        return self.db.get(Modelo, modelo_id)

    def get_by_nome(self, nome: str) -> Modelo | None:
        stmt = select(Modelo).where(func.lower(Modelo.nome) == nome.lower())
        return self.db.execute(stmt).scalar_one_or_none()

    def list(self, busca: str | None = None, apenas_ativos: bool = False) -> list[Modelo]:
        stmt = select(Modelo)
        if busca:
            stmt = stmt.where(Modelo.nome.ilike(f"%{busca}%"))
        if apenas_ativos:
            stmt = stmt.where(Modelo.ativo.is_(True))
        stmt = stmt.order_by(Modelo.nome)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, modelo: Modelo) -> Modelo:
        self.db.add(modelo)
        self.db.flush()
        return modelo

    def commit_refresh(self, modelo: Modelo) -> Modelo:
        self.db.commit()
        self.db.refresh(modelo)
        return modelo
