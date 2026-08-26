from datetime import datetime

from pydantic import BaseModel, ConfigDict, computed_field

from app.models.produto import TipoEstoque


class ItemRelatorio(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo_estoque: TipoEstoque
    modelo: str | None = None
    cor: str | None = None
    nome: str | None = None
    quantidade_atual: int
    quantidade_minima: int

    @computed_field
    @property
    def quantidade_faltante(self) -> int:
        falta = self.quantidade_minima - self.quantidade_atual
        return max(falta, 0)


class RelatorioReposicaoResponse(BaseModel):
    gerado_em: datetime
    total_itens: int
    pecas: list[ItemRelatorio]
    caixas: list[ItemRelatorio]
    embalagens: list[ItemRelatorio]
