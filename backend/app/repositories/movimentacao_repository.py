from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.movimentacao import Movimentacao, TipoMovimentacao
from app.models.produto import Produto


class MovimentacaoRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, movimentacao: Movimentacao) -> Movimentacao:
        self.db.add(movimentacao)
        self.db.flush()
        return movimentacao

    def list(
        self,
        produto_id: int | None = None,
        modelo_id: int | None = None,
        cor_id: int | None = None,
        tipo: TipoMovimentacao | None = None,
        usuario_id: int | None = None,
        data_inicio: datetime | None = None,
        data_fim: datetime | None = None,
        pagina: int = 1,
        tamanho_pagina: int = 20,
    ) -> tuple[list[Movimentacao], int]:
        stmt = select(Movimentacao).options(
            joinedload(Movimentacao.produto).joinedload(Produto.modelo),
            joinedload(Movimentacao.produto).joinedload(Produto.cor),
            joinedload(Movimentacao.usuario),
        )

        if produto_id:
            stmt = stmt.where(Movimentacao.produto_id == produto_id)
        if modelo_id or cor_id:
            stmt = stmt.join(Produto, Movimentacao.produto_id == Produto.id)
            if modelo_id:
                stmt = stmt.where(Produto.modelo_id == modelo_id)
            if cor_id:
                stmt = stmt.where(Produto.cor_id == cor_id)
        if tipo:
            stmt = stmt.where(Movimentacao.tipo_movimentacao == tipo)
        if usuario_id:
            stmt = stmt.where(Movimentacao.usuario_id == usuario_id)
        if data_inicio:
            stmt = stmt.where(Movimentacao.data_movimentacao >= data_inicio)
        if data_fim:
            stmt = stmt.where(Movimentacao.data_movimentacao <= data_fim)

        stmt = stmt.order_by(Movimentacao.data_movimentacao.desc())

        total = len(self.db.execute(stmt).unique().scalars().all())

        stmt = stmt.offset((pagina - 1) * tamanho_pagina).limit(tamanho_pagina)
        itens = list(self.db.execute(stmt).unique().scalars().all())

        return itens, total

    def ultimas(self, limite: int = 10) -> list[Movimentacao]:
        stmt = (
            select(Movimentacao)
            .options(
                joinedload(Movimentacao.produto).joinedload(Produto.modelo),
                joinedload(Movimentacao.produto).joinedload(Produto.cor),
                joinedload(Movimentacao.usuario),
            )
            .order_by(Movimentacao.data_movimentacao.desc())
            .limit(limite)
        )
        return list(self.db.execute(stmt).unique().scalars().all())
