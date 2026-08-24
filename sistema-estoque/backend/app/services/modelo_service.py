from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.modelo import Modelo
from app.repositories.modelo_repository import ModeloRepository
from app.schemas.modelo import ModeloCreate, ModeloUpdate


class ModeloService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ModeloRepository(db)

    def listar(self, busca: str | None, apenas_ativos: bool) -> list[Modelo]:
        return self.repo.list(busca=busca, apenas_ativos=apenas_ativos)

    def obter(self, modelo_id: int) -> Modelo:
        modelo = self.repo.get(modelo_id)
        if not modelo:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Modelo não encontrado.")
        return modelo

    def criar(self, dados: ModeloCreate) -> Modelo:
        existente = self.repo.get_by_nome(dados.nome)
        if existente:
            raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um modelo com esse nome.")
        modelo = Modelo(nome=dados.nome.strip(), descricao=dados.descricao)
        self.repo.create(modelo)
        return self.repo.commit_refresh(modelo)

    def atualizar(self, modelo_id: int, dados: ModeloUpdate) -> Modelo:
        modelo = self.obter(modelo_id)

        if dados.nome and dados.nome.strip().lower() != modelo.nome.lower():
            existente = self.repo.get_by_nome(dados.nome)
            if existente:
                raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um modelo com esse nome.")
            modelo.nome = dados.nome.strip()

        if dados.descricao is not None:
            modelo.descricao = dados.descricao
        if dados.ativo is not None:
            modelo.ativo = dados.ativo

        return self.repo.commit_refresh(modelo)
