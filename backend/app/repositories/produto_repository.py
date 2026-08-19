from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.cor import Cor
from app.models.modelo import Modelo
from app.models.produto import Produto


class ProdutoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, produto_id: int) -> Produto | None:
        stmt = (
            select(Produto)
            .options(joinedload(Produto.modelo), joinedload(Produto.cor))
            .where(Produto.id == produto_id)
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_for_update(self, produto_id: int) -> Produto | None:
        """Busca com lock de linha (SELECT FOR UPDATE) para evitar race condition
        em atualizações concorrentes de estoque."""
        stmt = select(Produto).where(Produto.id == produto_id).with_for_update()
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_modelo_cor(self, modelo_id: int, cor_id: int) -> Produto | None:
        stmt = select(Produto).where(Produto.modelo_id == modelo_id, Produto.cor_id == cor_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def list(
        self,
        busca: str | None = None,
        modelo_id: int | None = None,
        cor_id: int | None = None,
        status: str | None = None,
        apenas_ativos: bool = True,
        pagina: int = 1,
        tamanho_pagina: int = 20,
    ) -> tuple[list[Produto], int]:
        stmt = (
            select(Produto)
            .join(Modelo, Produto.modelo_id == Modelo.id)
            .join(Cor, Produto.cor_id == Cor.id)
            .options(joinedload(Produto.modelo), joinedload(Produto.cor))
        )

        if apenas_ativos:
            stmt = stmt.where(Produto.ativo.is_(True))
        if modelo_id:
            stmt = stmt.where(Produto.modelo_id == modelo_id)
        if cor_id:
            stmt = stmt.where(Produto.cor_id == cor_id)
        if busca:
            stmt = stmt.where(Modelo.nome.ilike(f"%{busca}%") | Cor.nome.ilike(f"%{busca}%"))
        if status == "ZERADO":
            stmt = stmt.where(Produto.quantidade == 0)
        elif status == "BAIXO":
            stmt = stmt.where(Produto.quantidade > 0, Produto.quantidade <= Produto.estoque_minimo)
        elif status == "NORMAL":
            stmt = stmt.where(Produto.quantidade > Produto.estoque_minimo)

        stmt = stmt.order_by(Modelo.nome, Cor.nome)

        # total antes da paginação
        total = len(self.db.execute(stmt).unique().scalars().all())

        stmt = stmt.offset((pagina - 1) * tamanho_pagina).limit(tamanho_pagina)
        itens = list(self.db.execute(stmt).unique().scalars().all())

        return itens, total

    def create(self, produto: Produto) -> Produto:
        self.db.add(produto)
        self.db.flush()
        return produto

    def commit_refresh(self, produto: Produto) -> Produto:
        self.db.commit()
        self.db.refresh(produto)
        return produto
