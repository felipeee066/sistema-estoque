from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.produto import Produto, TipoEstoque
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
        tipo_estoque: TipoEstoque | None,
        busca: str | None,
        modelo_id: int | None,
        cor_id: int | None,
        status_filtro: str | None,
        apenas_ativos: bool,
        pagina: int,
        tamanho_pagina: int,
    ) -> tuple[list[Produto], int]:
        return self.repo.list(
            tipo_estoque=tipo_estoque,
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
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Item de estoque não encontrado.")
        return produto

    def criar(self, dados: ProdutoCreate) -> Produto:
        if dados.tipo_estoque == TipoEstoque.PECA:
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
                    f"Essa combinação (modelo '{modelo.nome}' + cor '{cor.nome}') já está cadastrada.",
                )
            produto = Produto(
                tipo_estoque=TipoEstoque.PECA,
                modelo_id=dados.modelo_id,
                cor_id=dados.cor_id,
                quantidade=dados.quantidade,
                estoque_minimo=dados.estoque_minimo,
            )
        else:
            existente = self.repo.get_by_tipo_nome(dados.tipo_estoque, dados.nome)
            if existente:
                raise HTTPException(
                    status.HTTP_409_CONFLICT,
                    f"Já existe um item de '{dados.tipo_estoque.value}' com o nome '{dados.nome}'.",
                )
            produto = Produto(
                tipo_estoque=dados.tipo_estoque,
                nome=dados.nome.strip(),
                quantidade=dados.quantidade,
                estoque_minimo=dados.estoque_minimo,
            )

        self.repo.create(produto)
        self.repo.commit_refresh(produto)
        return self.obter(produto.id)

    def atualizar(self, produto_id: int, dados: ProdutoUpdate) -> Produto:
        produto = self.obter(produto_id)

        if produto.tipo_estoque == TipoEstoque.PECA:
            novo_modelo_id = dados.modelo_id if dados.modelo_id is not None else produto.modelo_id
            novo_cor_id = dados.cor_id if dados.cor_id is not None else produto.cor_id

            if novo_modelo_id != produto.modelo_id or novo_cor_id != produto.cor_id:
                if not self.modelo_repo.get(novo_modelo_id):
                    raise HTTPException(status.HTTP_404_NOT_FOUND, "Modelo informado não existe.")
                if not self.cor_repo.get(novo_cor_id):
                    raise HTTPException(status.HTTP_404_NOT_FOUND, "Cor informada não existe.")
                conflito = self.repo.get_by_modelo_cor(novo_modelo_id, novo_cor_id)
                if conflito and conflito.id != produto.id:
                    raise HTTPException(
                        status.HTTP_409_CONFLICT,
                        "Já existe outro item com essa combinação de modelo e cor.",
                    )
                produto.modelo_id = novo_modelo_id
                produto.cor_id = novo_cor_id
        else:
            if dados.nome and dados.nome.strip().lower() != (produto.nome or "").lower():
                conflito = self.repo.get_by_tipo_nome(produto.tipo_estoque, dados.nome)
                if conflito and conflito.id != produto.id:
                    raise HTTPException(
                        status.HTTP_409_CONFLICT,
                        f"Já existe um item de '{produto.tipo_estoque.value}' com esse nome.",
                    )
                produto.nome = dados.nome.strip()

        if dados.estoque_minimo is not None:
            produto.estoque_minimo = dados.estoque_minimo
        if dados.ativo is not None:
            produto.ativo = dados.ativo

        self.repo.commit_refresh(produto)
        return self.obter(produto.id)

    def excluir(self, produto_id: int) -> dict:
        """
        Exclusão segura: se o item tiver movimentações no histórico, faz apenas
        exclusão lógica (ativo=False) para preservar o histórico. Se nunca teve
        nenhuma movimentação, exclui fisicamente do banco.
        """
        produto = self.obter(produto_id)

        if self.repo.tem_movimentacoes(produto.id):
            produto.ativo = False
            self.repo.commit_refresh(produto)
            return {
                "status": "desativado",
                "mensagem": "Este item possui histórico de movimentações, então foi apenas "
                "desativado (não aparece mais no estoque ativo, mas o histórico foi preservado).",
            }

        self.repo.delete(produto)
        self.repo.commit()
        return {
            "status": "excluido",
            "mensagem": "Item excluído definitivamente (não possuía nenhuma movimentação registrada).",
        }
