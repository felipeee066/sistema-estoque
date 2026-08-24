from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ModeloBase(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    descricao: str | None = None


class ModeloCreate(ModeloBase):
    pass


class ModeloUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=120)
    descricao: str | None = None
    ativo: bool | None = None


class ModeloOut(ModeloBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime
