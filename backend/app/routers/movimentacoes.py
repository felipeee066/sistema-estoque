from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.movimentacao import TipoMovimentacao
from app.models.usuario import Usuario
from app.schemas.movimentacao import (
    AjusteCreate,
    MovimentacaoCreate,
    MovimentacaoListResponse,
    MovimentacaoOut,
)
from app.services.movimentacao_service import MovimentacaoService

router = APIRouter(prefix="/movimentacoes", tags=["movimentacoes"])


@router.get("", response_model=MovimentacaoListResponse)
def listar_movimentacoes(
    produto_id: int | None = Query(default=None),
    modelo_id: int | None = Query(default=None),
    cor_id: int | None = Query(default=None),
    tipo: TipoMovimentacao | None = Query(default=None),
    usuario_id: int | None = Query(default=None),
    data_inicio: datetime | None = Query(default=None),
    data_fim: datetime | None = Query(default=None),
    pagina: int = Query(default=1, ge=1),
    tamanho_pagina: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    itens, total = MovimentacaoService(db).listar(
        produto_id=produto_id,
        modelo_id=modelo_id,
        cor_id=cor_id,
        tipo=tipo,
        usuario_id=usuario_id,
        data_inicio=data_inicio,
        data_fim=data_fim,
        pagina=pagina,
        tamanho_pagina=tamanho_pagina,
    )
    return MovimentacaoListResponse(total=total, pagina=pagina, tamanho_pagina=tamanho_pagina, itens=itens)


@router.post("", response_model=MovimentacaoOut, status_code=201)
def registrar_movimentacao(
    dados: MovimentacaoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    """Registra ENTRADA ou SAIDA. Para AJUSTE, use POST /movimentacoes/ajuste."""
    return MovimentacaoService(db).registrar(dados, usuario)


@router.post("/ajuste", response_model=MovimentacaoOut, status_code=201)
def registrar_ajuste(
    dados: AjusteCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    return MovimentacaoService(db).registrar_ajuste(dados, usuario)
