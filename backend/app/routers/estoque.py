from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.usuario import Usuario
from app.schemas.produto import ProdutoCreate, ProdutoListResponse, ProdutoOut, ProdutoUpdate
from app.services.produto_service import ProdutoService

router = APIRouter(prefix="/estoque", tags=["estoque"])


@router.get("", response_model=ProdutoListResponse)
def listar_estoque(
    busca: str | None = Query(default=None),
    modelo_id: int | None = Query(default=None),
    cor_id: int | None = Query(default=None),
    status: str | None = Query(default=None, pattern="^(NORMAL|BAIXO|ZERADO)$"),
    apenas_ativos: bool = Query(default=True),
    pagina: int = Query(default=1, ge=1),
    tamanho_pagina: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    itens, total = ProdutoService(db).listar(
        busca=busca,
        modelo_id=modelo_id,
        cor_id=cor_id,
        status_filtro=status,
        apenas_ativos=apenas_ativos,
        pagina=pagina,
        tamanho_pagina=tamanho_pagina,
    )
    return ProdutoListResponse(total=total, pagina=pagina, tamanho_pagina=tamanho_pagina, itens=itens)


@router.get("/{produto_id}", response_model=ProdutoOut)
def obter_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    return ProdutoService(db).obter(produto_id)


@router.post("", response_model=ProdutoOut, status_code=201)
def criar_produto(
    dados: ProdutoCreate,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(require_admin),
):
    return ProdutoService(db).criar(dados)


@router.put("/{produto_id}", response_model=ProdutoOut)
def atualizar_produto(
    produto_id: int,
    dados: ProdutoUpdate,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(require_admin),
):
    return ProdutoService(db).atualizar(produto_id, dados)
