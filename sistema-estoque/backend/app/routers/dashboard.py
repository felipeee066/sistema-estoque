from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.produto import Produto, TipoEstoque
from app.models.usuario import Usuario
from app.repositories.movimentacao_repository import MovimentacaoRepository
from app.repositories.produto_repository import ProdutoRepository
from app.schemas.dashboard import DashboardResponse, ResumoTipoEstoque

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _resumo_tipo(db: Session, tipo: TipoEstoque) -> ResumoTipoEstoque:
    total = db.execute(
        select(func.count())
        .select_from(Produto)
        .where(Produto.ativo.is_(True), Produto.tipo_estoque == tipo)
    ).scalar_one()

    baixos = db.execute(
        select(func.count())
        .select_from(Produto)
        .where(
            Produto.ativo.is_(True),
            Produto.tipo_estoque == tipo,
            Produto.quantidade > 0,
            Produto.quantidade <= Produto.estoque_minimo,
        )
    ).scalar_one()

    zerados = db.execute(
        select(func.count())
        .select_from(Produto)
        .where(Produto.ativo.is_(True), Produto.tipo_estoque == tipo, Produto.quantidade == 0)
    ).scalar_one()

    return ResumoTipoEstoque(total_itens=total, itens_estoque_baixo=baixos, itens_zerados=zerados)


@router.get("", response_model=DashboardResponse)
def obter_dashboard(
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    ultimas = MovimentacaoRepository(db).ultimas(limite=10)

    produto_repo = ProdutoRepository(db)
    criticos_peca = produto_repo.list_abaixo_minimo(tipo_estoque=TipoEstoque.PECA)[:5]
    criticos_caixa = produto_repo.list_abaixo_minimo(tipo_estoque=TipoEstoque.CAIXA)[:3]
    criticos_embalagem = produto_repo.list_abaixo_minimo(tipo_estoque=TipoEstoque.EMBALAGEM)[:3]

    return DashboardResponse(
        pecas=_resumo_tipo(db, TipoEstoque.PECA),
        caixas=_resumo_tipo(db, TipoEstoque.CAIXA),
        embalagens=_resumo_tipo(db, TipoEstoque.EMBALAGEM),
        ultimas_movimentacoes=ultimas,
        produtos_criticos=criticos_peca + criticos_caixa + criticos_embalagem,
    )
