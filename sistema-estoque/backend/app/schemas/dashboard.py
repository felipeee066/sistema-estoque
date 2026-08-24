from pydantic import BaseModel

from app.schemas.movimentacao import MovimentacaoOut
from app.schemas.produto import ProdutoOut


class ResumoTipoEstoque(BaseModel):
    total_itens: int
    itens_estoque_baixo: int
    itens_zerados: int


class DashboardResponse(BaseModel):
    pecas: ResumoTipoEstoque
    caixas: ResumoTipoEstoque
    embalagens: ResumoTipoEstoque
    ultimas_movimentacoes: list[MovimentacaoOut]
    produtos_criticos: list[ProdutoOut]
