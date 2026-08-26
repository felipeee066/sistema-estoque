from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator

from app.models.produto import TipoEstoque
from app.schemas.cor import CorOut
from app.schemas.modelo import ModeloOut


class ProdutoCreate(BaseModel):
    tipo_estoque: TipoEstoque = TipoEstoque.PECA

    # Obrigatórios apenas quando tipo_estoque == PECA
    modelo_id: int | None = None
    cor_id: int | None = None

    # Obrigatório apenas quando tipo_estoque in (CAIXA, EMBALAGEM)
    nome: str | None = Field(default=None, min_length=1, max_length=120)

    quantidade: int = Field(default=0, ge=0)
    estoque_minimo: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def validar_campos_por_tipo(self):
        if self.tipo_estoque == TipoEstoque.PECA:
            if not self.modelo_id or not self.cor_id:
                raise ValueError("Para PECA, modelo_id e cor_id são obrigatórios.")
        else:
            if not self.nome:
                raise ValueError("Para CAIXA ou EMBALAGEM, o nome é obrigatório.")
        return self


class ProdutoUpdate(BaseModel):
    """Atualização cadastral (não mexe na quantidade — isso é feito via movimentações)."""

    modelo_id: int | None = None
    cor_id: int | None = None
    nome: str | None = Field(default=None, min_length=1, max_length=120)
    estoque_minimo: int | None = Field(default=None, ge=0)
    ativo: bool | None = None


class ProdutoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo_estoque: TipoEstoque
    modelo: ModeloOut | None = None
    cor: CorOut | None = None
    nome: str | None = None
    quantidade: int
    estoque_minimo: int
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime

    @computed_field
    @property
    def status(self) -> str:
        if self.quantidade == 0:
            return "ZERADO"
        if self.quantidade <= self.estoque_minimo:
            return "BAIXO"
        return "NORMAL"

    @computed_field
    @property
    def descricao(self) -> str:
        if self.tipo_estoque == TipoEstoque.PECA and self.modelo and self.cor:
            return f"{self.modelo.nome} — {self.cor.nome}"
        return self.nome or "?"


class ProdutoListResponse(BaseModel):
    total: int
    pagina: int
    tamanho_pagina: int
    itens: list[ProdutoOut]
