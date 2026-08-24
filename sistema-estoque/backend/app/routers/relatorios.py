from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.produto import Produto, TipoEstoque
from app.models.usuario import Usuario
from app.repositories.produto_repository import ProdutoRepository
from app.schemas.relatorio import ItemRelatorio, RelatorioReposicaoResponse

router = APIRouter(prefix="/relatorios", tags=["relatorios"])


def _para_item(p: Produto) -> ItemRelatorio:
    return ItemRelatorio(
        id=p.id,
        tipo_estoque=p.tipo_estoque,
        modelo=p.modelo.nome if p.modelo else None,
        cor=p.cor.nome if p.cor else None,
        nome=p.nome,
        quantidade_atual=p.quantidade,
        quantidade_minima=p.estoque_minimo,
    )


@router.get("/reposicao", response_model=RelatorioReposicaoResponse)
def relatorio_reposicao(
    tipo_estoque: TipoEstoque | None = Query(
        default=None, description="Filtra por um tipo específico. Omitido = todos."
    ),
    somente_zerados: bool = Query(default=False),
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    """
    Lista itens que precisam de reposição: quantidade <= estoque_minimo
    (isso já inclui os zerados). Use somente_zerados=true para restringir
    apenas aos itens com quantidade = 0.
    """
    itens = ProdutoRepository(db).list_abaixo_minimo(tipo_estoque=tipo_estoque)

    if somente_zerados:
        itens = [p for p in itens if p.quantidade == 0]

    pecas = [_para_item(p) for p in itens if p.tipo_estoque == TipoEstoque.PECA]
    caixas = [_para_item(p) for p in itens if p.tipo_estoque == TipoEstoque.CAIXA]
    embalagens = [_para_item(p) for p in itens if p.tipo_estoque == TipoEstoque.EMBALAGEM]

    return RelatorioReposicaoResponse(
        gerado_em=datetime.now(timezone.utc),
        total_itens=len(itens),
        pecas=pecas,
        caixas=caixas,
        embalagens=embalagens,
    )
