from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decodificar_access_token
from app.models.usuario import PerfilUsuario, Usuario
from app.repositories.usuario_repository import UsuarioRepository

# tokenUrl aponta para o endpoint de login (usado apenas pela doc /docs)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    credenciais_invalidas = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "Não foi possível validar as credenciais.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credenciais_invalidas

    payload = decodificar_access_token(token)
    if not payload or "sub" not in payload:
        raise credenciais_invalidas

    usuario = UsuarioRepository(db).get(int(payload["sub"]))
    if not usuario:
        raise credenciais_invalidas
    if not usuario.ativo:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Usuário desativado. Contate um administrador.")

    return usuario


def require_admin(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.perfil != PerfilUsuario.ADMINISTRADOR:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Apenas administradores podem realizar esta operação.",
        )
    return usuario
