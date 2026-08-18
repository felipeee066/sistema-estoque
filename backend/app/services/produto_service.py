from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.produto import Produto
from app.repositories.cor_repository import CorRepository
from app.repositories.modelo_repository import ModeloRepository
from app.repositories.produto_repository import ProdutoRepository
from app.schemas.produto import ProdutoCreate, ProdutoUpdate


class ProdutoService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ProdutoRepository(db)
        self.modelo_repo = ModeloRepository(db)
        self.cor_repo = CorRepository(db)

    def listar(
        self,
        busca: str | None,
        modelo_id: int | None,
        cor_id: int | None,
        status_filtro: str | None,
        apenas_ativos: bool,
        pagina: int,
        tamanho_pagina: int,
    ) -> tuple[list[Produto], int]:
        return self.repo.list(
            busca=busca,
            modelo_id=modelo_id,
            cor_id=cor_id,
            status=status_filtro,
            apenas_ativos=apenas_ativos,
            pagina=pagina,
            tamanho_pagina=tamanho_pagina,
        )

    def obter(self, produto_id: int) -> Produto:
        produto = self.repo.get(produto_id)
        if not produto:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado no estoque.")
        return produto

    def criar(self, dados: ProdutoCreate) -> Produto:
        modelo = self.modelo_repo.get(dados.modelo_id)
        if not modelo:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Modelo informado não existe.")
        cor = self.cor_repo.get(dados.cor_id)
        if not cor:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Cor informada não existe.")

        existente = self.repo.get_by_modelo_cor(dados.modelo_id, dados.cor_id)
        if existente:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Essa combinação (modelo '{modelo.nome}' + cor '{cor.nome}') já está cadastrada no estoque.",
            )

        produto = Produto(
            modelo_id=dados.modelo_id,
            cor_id=dados.cor_id,
            quantidade=dados.quantidade,
            estoque_minimo=dados.estoque_minimo,
        )
        self.repo.create(produto)
        self.repo.commit_refresh(produto)
        return self.obter(produto.id)

    def atualizar(self, produto_id: int, dados: ProdutoUpdate) -> Produto:
        produto = self.obter(produto_id)

        if dados.estoque_minimo is not None:
            produto.estoque_minimo = dados.estoque_minimo
        if dados.ativo is not None:
            produto.ativo = dados.ativo

        self.repo.commit_refresh(produto)
        return self.obter(produto.id)
