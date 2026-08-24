from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.usuario import Usuario
from app.schemas.modelo import ModeloCreate, ModeloOut, ModeloUpdate
from app.services.modelo_service import ModeloService

router = APIRouter(prefix="/modelos", tags=["modelos"])


@router.get("", response_model=list[ModeloOut])
def listar_modelos(
    busca: str | None = Query(default=None),
    apenas_ativos: bool = Query(default=False),
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    return ModeloService(db).listar(busca=busca, apenas_ativos=apenas_ativos)


@router.get("/{modelo_id}", response_model=ModeloOut)
def obter_modelo(
    modelo_id: int,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(get_current_user),
):
    return ModeloService(db).obter(modelo_id)


@router.post("", response_model=ModeloOut, status_code=201)
def criar_modelo(
    dados: ModeloCreate,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(require_admin),
):
    return ModeloService(db).criar(dados)


@router.put("/{modelo_id}", response_model=ModeloOut)
def atualizar_modelo(
    modelo_id: int,
    dados: ModeloUpdate,
    db: Session = Depends(get_db),
    _usuario: Usuario = Depends(require_admin),
):
    return ModeloService(db).atualizar(modelo_id, dados)
