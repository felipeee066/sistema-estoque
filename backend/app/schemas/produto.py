from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.schemas.cor import CorOut
from app.schemas.modelo import ModeloOut


class ProdutoCreate(BaseModel):
    modelo_id: int
    cor_id: int
    quantidade: int = Field(default=0, ge=0)
    estoque_minimo: int = Field(default=0, ge=0)


class ProdutoUpdate(BaseModel):
    estoque_minimo: int | None = Field(default=None, ge=0)
    ativo: bool | None = None


class ProdutoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    modelo: ModeloOut
    cor: CorOut
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


class ProdutoListResponse(BaseModel):
    total: int
    pagina: int
    tamanho_pagina: int
    itens: list[ProdutoOut]
