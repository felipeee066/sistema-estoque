from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.movimentacao import TipoMovimentacao


class MovimentacaoCreate(BaseModel):
    produto_id: int
    tipo_movimentacao: TipoMovimentacao
    quantidade: int = Field(gt=0, description="Quantidade sempre positiva; o tipo define o efeito")
    motivo: str | None = Field(default=None, max_length=255)
    observacao: str | None = None
    forcar: bool = Field(
        default=False,
        description="Se True, permite saída maior que o estoque disponível (apenas administrador).",
    )


class AjusteCreate(BaseModel):
    produto_id: int
    quantidade_correta: int = Field(ge=0)
    motivo: str | None = Field(default=None, max_length=255)
    observacao: str | None = None


class UsuarioResumo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str


class ModeloResumo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str


class CorResumo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str


class ProdutoResumo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    modelo: ModeloResumo
    cor: CorResumo


class MovimentacaoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    produto: ProdutoResumo
    usuario: UsuarioResumo
    tipo_movimentacao: TipoMovimentacao
    quantidade: int
    quantidade_anterior: int
    quantidade_posterior: int
    motivo: str | None
    observacao: str | None
    data_movimentacao: datetime


class MovimentacaoListResponse(BaseModel):
    total: int
    pagina: int
    tamanho_pagina: int
    itens: list[MovimentacaoOut]
