from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CorBase(BaseModel):
    nome: str = Field(min_length=1, max_length=80)
    codigo_hex: str | None = Field(default=None, max_length=7)


class CorCreate(CorBase):
    pass


class CorUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=80)
    codigo_hex: str | None = Field(default=None, max_length=7)
    ativo: bool | None = None


class CorOut(CorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime
