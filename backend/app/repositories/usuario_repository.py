from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.usuario import Usuario


class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, usuario_id: int) -> Usuario | None:
        return self.db.get(Usuario, usuario_id)

    def get_by_email(self, email: str) -> Usuario | None:
        stmt = select(Usuario).where(func.lower(Usuario.email) == email.lower())
        return self.db.execute(stmt).scalar_one_or_none()

    def list(self, apenas_ativos: bool = False) -> list[Usuario]:
        stmt = select(Usuario)
        if apenas_ativos:
            stmt = stmt.where(Usuario.ativo.is_(True))
        stmt = stmt.order_by(Usuario.nome)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, usuario: Usuario) -> Usuario:
        self.db.add(usuario)
        self.db.flush()
        return usuario

    def commit_refresh(self, usuario: Usuario) -> Usuario:
        self.db.commit()
        self.db.refresh(usuario)
        return usuario
