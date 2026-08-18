"""
Model de Cor (ex: "Natural", "Branco").
"""
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Cor(Base):
    __tablename__ = "cores"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    codigo_hex: Mapped[str | None] = mapped_column(String(7), nullable=True)  # ex: "#FFFFFF"
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    data_criacao: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    data_atualizacao: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    produtos: Mapped[list["Produto"]] = relationship(back_populates="cor")
