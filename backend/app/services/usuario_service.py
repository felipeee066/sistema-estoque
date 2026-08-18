from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import criar_access_token, hash_senha, verificar_senha
from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.usuario import LoginRequest, TokenResponse, UsuarioCreate, UsuarioUpdate


class UsuarioService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UsuarioRepository(db)

    def listar(self, apenas_ativos: bool) -> list[Usuario]:
        return self.repo.list(apenas_ativos=apenas_ativos)

    def obter(self, usuario_id: int) -> Usuario:
        usuario = self.repo.get(usuario_id)
        if not usuario:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuário não encontrado.")
        return usuario

    def criar(self, dados: UsuarioCreate) -> Usuario:
        existente = self.repo.get_by_email(dados.email)
        if existente:
            raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um usuário com esse e-mail.")

        usuario = Usuario(
            nome=dados.nome.strip(),
            email=dados.email.lower(),
            senha_hash=hash_senha(dados.senha),
            perfil=dados.perfil,
        )
        self.repo.create(usuario)
        return self.repo.commit_refresh(usuario)

    def atualizar(self, usuario_id: int, dados: UsuarioUpdate) -> Usuario:
        usuario = self.obter(usuario_id)

        if dados.nome is not None:
            usuario.nome = dados.nome.strip()
        if dados.perfil is not None:
            usuario.perfil = dados.perfil
        if dados.ativo is not None:
            usuario.ativo = dados.ativo
        if dados.senha:
            usuario.senha_hash = hash_senha(dados.senha)

        return self.repo.commit_refresh(usuario)

    def autenticar(self, dados: LoginRequest) -> TokenResponse:
        usuario = self.repo.get_by_email(dados.email)
        credenciais_invalidas = HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "E-mail ou senha inválidos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

        if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
            raise credenciais_invalidas
        if not usuario.ativo:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Usuário desativado. Contate um administrador.")

        token = criar_access_token(subject=str(usuario.id))
        return TokenResponse(access_token=token, usuario=usuario)
