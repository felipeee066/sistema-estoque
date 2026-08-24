"""
Model de Produto (item de estoque): pode ser uma PECA (combinação modelo+cor),
uma CAIXA ou uma EMBALAGEM (identificadas por nome). O tipo é definido pelo
campo `tipo_estoque`.
"""
import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TipoEstoque(str, enum.Enum):
    PECA = "PECA"
    CAIXA = "CAIXA"
    EMBALAGEM = "EMBALAGEM"


class Produto(Base):
    __tablename__ = "produtos"
    __table_args__ = (
        UniqueConstraint("modelo_id", "cor_id", name="uq_produto_modelo_cor"),
        UniqueConstraint("tipo_estoque", "nome", name="uq_produto_tipo_nome"),
        CheckConstraint("quantidade >= 0", name="ck_produto_quantidade_nao_negativa"),
        CheckConstraint("estoque_minimo >= 0", name="ck_produto_estoque_minimo_nao_negativo"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    tipo_estoque: Mapped[TipoEstoque] = mapped_column(
        Enum(TipoEstoque, name="tipo_estoque"),
        nullable=False,
        default=TipoEstoque.PECA,
    )

    # Usados apenas quando tipo_estoque == PECA
    modelo_id: Mapped[int | None] = mapped_column(ForeignKey("modelos.id"), nullable=True)
    cor_id: Mapped[int | None] = mapped_column(ForeignKey("cores.id"), nullable=True)

    # Usado apenas quando tipo_estoque in (CAIXA, EMBALAGEM)
    nome: Mapped[str | None] = mapped_column(String(120), nullable=True)

    quantidade: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estoque_minimo: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    data_criacao: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    data_atualizacao: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    modelo: Mapped["Modelo | None"] = relationship(back_populates="produtos")
    cor: Mapped["Cor | None"] = relationship(back_populates="produtos")
    movimentacoes: Mapped[list["Movimentacao"]] = relationship(back_populates="produto")

    @property
    def descricao(self) -> str:
        """Descrição amigável do item, independente do tipo."""
        if self.tipo_estoque == TipoEstoque.PECA:
            nome_modelo = self.modelo.nome if self.modelo else "?"
            nome_cor = self.cor.nome if self.cor else "?"
            return f"{nome_modelo} — {nome_cor}"
        return self.nome or "?"

