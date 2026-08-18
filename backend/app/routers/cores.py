from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.usuario import Usuario
from app.schemas.cor import CorCreate, CorOut, CorUpdate
from app.services.cor_service import CorService

router = APIRouter(prefix="/cores", tags=["cores"])


@router.get("", response_model=list[CorOut])
def listar_cores(
    busca: str | None = Query(default=None),
    apenas_ativos: bool = Query(default=False),
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    return CorService(db).listar(busca=busca, apenas_ativos=apenas_ativos)


@router.get("/{cor_id}", response_model=CorOut)
def obter_cor(
    cor_id: int,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    return CorService(db).obter(cor_id)


@router.post("", response_model=CorOut, status_code=201)
def criar_cor(
    dados: CorCreate,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(require_admin),
):
    return CorService(db).criar(dados)


@router.put("/{cor_id}", response_model=CorOut)
def atualizar_cor(
    cor_id: int,
    dados: CorUpdate,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(require_admin),
):
    return CorService(db).atualizar(cor_id, dados)
