from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/usuarios", tags=["usuarios"])
# Toda a gestão de usuários é restrita a administradores.


@router.get("", response_model=list[UsuarioOut])
def listar_usuarios(
    apenas_ativos: bool = Query(default=False),
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    return UsuarioService(db).listar(apenas_ativos=apenas_ativos)


@router.get("/{usuario_id}", response_model=UsuarioOut)
def obter_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    return UsuarioService(db).obter(usuario_id)


@router.post("", response_model=UsuarioOut, status_code=201)
def criar_usuario(
    dados: UsuarioCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    return UsuarioService(db).criar(dados)


@router.put("/{usuario_id}", response_model=UsuarioOut)
def atualizar_usuario(
    usuario_id: int,
    dados: UsuarioUpdate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(require_admin),
):
    return UsuarioService(db).atualizar(usuario_id, dados)
