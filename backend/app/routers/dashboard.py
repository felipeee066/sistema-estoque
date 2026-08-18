from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.produto import Produto
from app.models.usuario import Usuario
from app.repositories.movimentacao_repository import MovimentacaoRepository
from app.repositories.produto_repository import ProdutoRepository
from app.schemas.dashboard import DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def obter_dashboard(
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    total_produtos = db.execute(
        select(func.count()).select_from(Produto).where(Produto.ativo.is_(True))
    ).scalar_one()

    total_itens_estoque = db.execute(
        select(func.coalesce(func.sum(Produto.quantidade), 0)).where(Produto.ativo.is_(True))
    ).scalar_one()

    produto_repo = ProdutoRepository(db)
    baixos, total_baixos = produto_repo.list(status="BAIXO", apenas_ativos=True, pagina=1, tamanho_pagina=5)
    zerados, total_zerados = produto_repo.list(status="ZERADO", apenas_ativos=True, pagina=1, tamanho_pagina=5)

    ultimas = MovimentacaoRepository(db).ultimas(limite=10)

    # produtos críticos para destaque no dashboard: zerados primeiro, depois baixos
    produtos_criticos = (zerados + baixos)[:8]

    return DashboardResponse(
        total_produtos=total_produtos,
        total_itens_estoque=int(total_itens_estoque),
        produtos_estoque_baixo=total_baixos,
        produtos_zerados=total_zerados,
        ultimas_movimentacoes=ultimas,
        produtos_criticos=produtos_criticos,
    )
