from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.usuario import PerfilUsuario


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=6, max_length=100)
    perfil: PerfilUsuario = PerfilUsuario.OPERADOR


class UsuarioUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=120)
    perfil: PerfilUsuario | None = None
    ativo: bool | None = None
    senha: str | None = Field(default=None, min_length=6, max_length=100)


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: EmailStr
    perfil: PerfilUsuario
    ativo: bool
    data_criacao: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut
