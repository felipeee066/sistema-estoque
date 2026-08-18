from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.cor import Cor


class CorRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, cor_id: int) -> Cor | None:
        return self.db.get(Cor, cor_id)

    def get_by_nome(self, nome: str) -> Cor | None:
        stmt = select(Cor).where(func.lower(Cor.nome) == nome.lower())
        return self.db.execute(stmt).scalar_one_or_none()

    def list(self, busca: str | None = None, apenas_ativos: bool = False) -> list[Cor]:
        stmt = select(Cor)
        if busca:
            stmt = stmt.where(Cor.nome.ilike(f"%{busca}%"))
        if apenas_ativos:
            stmt = stmt.where(Cor.ativo.is_(True))
        stmt = stmt.order_by(Cor.nome)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, cor: Cor) -> Cor:
        self.db.add(cor)
        self.db.flush()
        return cor

    def commit_refresh(self, cor: Cor) -> Cor:
        self.db.commit()
        self.db.refresh(cor)
        return cor
