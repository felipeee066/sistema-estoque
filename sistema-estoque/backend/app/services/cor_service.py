import re

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.cor import Cor
from app.repositories.cor_repository import CorRepository
from app.schemas.cor import CorCreate, CorUpdate

HEX_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")


class CorService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CorRepository(db)

    def _validar_hex(self, codigo_hex: str | None) -> None:
        if codigo_hex and not HEX_PATTERN.match(codigo_hex):
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "código hexadecimal inválido, use o formato #RRGGBB.",
            )

    def listar(self, busca: str | None, apenas_ativos: bool) -> list[Cor]:
        return self.repo.list(busca=busca, apenas_ativos=apenas_ativos)

    def obter(self, cor_id: int) -> Cor:
        cor = self.repo.get(cor_id)
        if not cor:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cor não encontrada.")
        return cor

    def criar(self, dados: CorCreate) -> Cor:
        self._validar_hex(dados.codigo_hex)
        existente = self.repo.get_by_nome(dados.nome)
        if existente:
            raise HTTPException(status.HTTP_409_CONFLICT, "Já existe uma cor com esse nome.")
        cor = Cor(nome=dados.nome.strip(), codigo_hex=dados.codigo_hex)
        self.repo.create(cor)
        return self.repo.commit_refresh(cor)

    def atualizar(self, cor_id: int, dados: CorUpdate) -> Cor:
        cor = self.obter(cor_id)

        if dados.nome and dados.nome.strip().lower() != cor.nome.lower():
            existente = self.repo.get_by_nome(dados.nome)
            if existente:
                raise HTTPException(status.HTTP_409_CONFLICT, "Já existe uma cor com esse nome.")
            cor.nome = dados.nome.strip()

        if dados.codigo_hex is not None:
            self._validar_hex(dados.codigo_hex)
            cor.codigo_hex = dados.codigo_hex
        if dados.ativo is not None:
            cor.ativo = dados.ativo

        return self.repo.commit_refresh(cor)
