"""
Endpoint de inicialização (bootstrap): cria o primeiro usuário administrador
sem precisar de acesso a um terminal (Shell) no servidor.
"""
import os

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_senha
from app.models.usuario import PerfilUsuario, Usuario
from app.repositories.usuario_repository import UsuarioRepository

router = APIRouter(tags=["bootstrap"])


@router.get("/bootstrap-admin")
def bootstrap_admin(
    secret: str = Query(...),
    nome: str = Query(..., min_length=1, max_length=120),
    email: str = Query(...),
    senha: str = Query(..., min_length=6, max_length=100),
):
    esperado = os.environ.get("BOOTSTRAP_SECRET")
    if not esperado:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "BOOTSTRAP_SECRET não configurado no servidor.",
        )
    if secret != esperado:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Senha mestra inválida.")

    db: Session = SessionLocal()
    try:
        repo = UsuarioRepository(db)

        if repo.list():
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Já existe pelo menos um usuário cadastrado — este endpoint "
                "só funciona para criar o primeiro administrador.",
            )

        usuario = Usuario(
            nome=nome.strip(),
            email=email.strip().lower(),
            senha_hash=hash_senha(senha),
            perfil=PerfilUsuario.ADMINISTRADOR,
        )
        repo.create(usuario)
        repo.commit_refresh(usuario)

        return {
            "status": "ok",
            "mensagem": f"Administrador '{usuario.nome}' criado com sucesso. "
            "Você já pode fazer login normalmente.",
        }
    finally:
        db.close()
