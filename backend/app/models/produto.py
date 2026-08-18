"""
Model de Produto: representa uma combinação única de Modelo + Cor no estoque.
"""
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Produto(Base):
    __tablename__ = "produtos"
    __table_args__ = (
        UniqueConstraint("modelo_id", "cor_id", name="uq_produto_modelo_cor"),
        CheckConstraint("quantidade >= 0", name="ck_produto_quantidade_nao_negativa"),
        CheckConstraint("estoque_minimo >= 0", name="ck_produto_estoque_minimo_nao_negativo"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    modelo_id: Mapped[int] = mapped_column(ForeignKey("modelos.id"), nullable=False)
    cor_id: Mapped[int] = mapped_column(ForeignKey("cores.id"), nullable=False)

    quantidade: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estoque_minimo: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    data_criacao: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    data_atualizacao: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    modelo: Mapped["Modelo"] = relationship(back_populates="produtos")
    cor: Mapped["Cor"] = relationship(back_populates="produtos")
    movimentacoes: Mapped[list["Movimentacao"]] = relationship(back_populates="produto")
