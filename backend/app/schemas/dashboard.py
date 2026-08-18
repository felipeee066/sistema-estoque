from pydantic import BaseModel

from app.schemas.movimentacao import MovimentacaoOut
from app.schemas.produto import ProdutoOut


class DashboardResponse(BaseModel):
    total_produtos: int
    total_itens_estoque: int
    produtos_estoque_baixo: int
    produtos_zerados: int
    ultimas_movimentacoes: list[MovimentacaoOut]
    produtos_criticos: list[ProdutoOut]
