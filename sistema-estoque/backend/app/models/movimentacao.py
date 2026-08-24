"""
Model de Movimentação: registra toda alteração de quantidade em um Produto.
Nunca é apagado fisicamente — é o histórico permanente do estoque.
"""
import enum
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TipoMovimentacao(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SAIDA = "SAIDA"
    AJUSTE = "AJUSTE"


class Movimentacao(Base):
    __tablename__ = "movimentacoes"
    __table_args__ = (
        CheckConstraint("quantidade > 0", name="ck_movimentacao_quantidade_positiva"),
        CheckConstraint("quantidade_anterior >= 0", name="ck_movimentacao_quantidade_anterior_nao_negativa"),
        CheckConstraint("quantidade_posterior >= 0", name="ck_movimentacao_quantidade_posterior_nao_negativa"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    produto_id: Mapped[int] = mapped_column(ForeignKey("produtos.id"), nullable=False, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)

    tipo_movimentacao: Mapped[TipoMovimentacao] = mapped_column(
        Enum(TipoMovimentacao, name="tipo_movimentacao"), nullable=False
    )
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    quantidade_anterior: Mapped[int] = mapped_column(Integer, nullable=False)
    quantidade_posterior: Mapped[int] = mapped_column(Integer, nullable=False)

    motivo: Mapped[str | None] = mapped_column(String(255), nullable=True)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)

    data_movimentacao: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    produto: Mapped["Produto"] = relationship(back_populates="movimentacoes")
    usuario: Mapped["Usuario"] = relationship(back_populates="movimentacoes")
