from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.movimentacao import Movimentacao, TipoMovimentacao
from app.models.produto import Produto
from app.models.usuario import PerfilUsuario, Usuario
from app.repositories.movimentacao_repository import MovimentacaoRepository
from app.repositories.produto_repository import ProdutoRepository
from app.schemas.movimentacao import AjusteCreate, MovimentacaoCreate


class MovimentacaoService:
    """
    Toda alteração de estoque passa por aqui. A atualização da quantidade
    em `produtos` e o registro em `movimentacoes` acontecem na mesma
    transação de banco: ou os dois são gravados, ou nenhum é (rollback
    automático se algo falhar, via `db.rollback()` no except).
    """

    def __init__(self, db: Session):
        self.db = db
        self.produto_repo = ProdutoRepository(db)
        self.mov_repo = MovimentacaoRepository(db)

    def _bloquear_produto(self, produto_id: int) -> Produto:
        produto = self.produto_repo.get_for_update(produto_id)
        if not produto:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado no estoque.")
        if not produto.ativo:
            raise HTTPException(status.HTTP_409_CONFLICT, "Não é possível movimentar um produto inativo.")
        return produto

    def registrar(self, dados: MovimentacaoCreate, usuario: Usuario) -> Movimentacao:
        if dados.quantidade <= 0:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "A quantidade deve ser maior que zero.")

        try:
            produto = self._bloquear_produto(dados.produto_id)
            quantidade_anterior = produto.quantidade

            if dados.tipo_movimentacao == TipoMovimentacao.ENTRADA:
                quantidade_posterior = quantidade_anterior + dados.quantidade

            elif dados.tipo_movimentacao == TipoMovimentacao.SAIDA:
                quantidade_posterior = quantidade_anterior - dados.quantidade
                if quantidade_posterior < 0:
                    pode_forcar = dados.forcar and usuario.perfil == PerfilUsuario.ADMINISTRADOR
                    if not pode_forcar:
                        raise HTTPException(
                            status.HTTP_422_UNPROCESSABLE_ENTITY,
                            f"Saída maior que o estoque disponível (disponível: {quantidade_anterior}). "
                            "Apenas um administrador pode autorizar essa operação.",
                        )
                    # admin autorizou: estoque pode zerar, nunca fica negativo
                    quantidade_posterior = max(quantidade_posterior, 0)

            else:  # AJUSTE não deveria vir por aqui (tem endpoint próprio), mas cobrimos por segurança
                raise HTTPException(
                    status.HTTP_422_UNPROCESSABLE_ENTITY,
                    "Use o endpoint de ajuste para o tipo AJUSTE.",
                )

            produto.quantidade = quantidade_posterior

            movimentacao = Movimentacao(
                produto_id=produto.id,
                usuario_id=usuario.id,
                tipo_movimentacao=dados.tipo_movimentacao,
                quantidade=dados.quantidade,
                quantidade_anterior=quantidade_anterior,
                quantidade_posterior=quantidade_posterior,
                motivo=dados.motivo,
                observacao=dados.observacao,
            )
            self.mov_repo.create(movimentacao)

            self.db.commit()
            self.db.refresh(movimentacao)
            return movimentacao

        except HTTPException:
            self.db.rollback()
            raise
        except Exception:
            self.db.rollback()
            raise

    def registrar_ajuste(self, dados: AjusteCreate, usuario: Usuario) -> Movimentacao:
        try:
            produto = self._bloquear_produto(dados.produto_id)
            quantidade_anterior = produto.quantidade
            quantidade_posterior = dados.quantidade_correta

            if quantidade_posterior == quantidade_anterior:
                raise HTTPException(
                    status.HTTP_422_UNPROCESSABLE_ENTITY,
                    "A quantidade corrigida é igual à quantidade atual — nada para ajustar.",
                )

            produto.quantidade = quantidade_posterior

            movimentacao = Movimentacao(
                produto_id=produto.id,
                usuario_id=usuario.id,
                tipo_movimentacao=TipoMovimentacao.AJUSTE,
                quantidade=abs(quantidade_posterior - quantidade_anterior),
                quantidade_anterior=quantidade_anterior,
                quantidade_posterior=quantidade_posterior,
                motivo=dados.motivo,
                observacao=dados.observacao,
            )
            self.mov_repo.create(movimentacao)

            self.db.commit()
            self.db.refresh(movimentacao)
            return movimentacao

        except HTTPException:
            self.db.rollback()
            raise
        except Exception:
            self.db.rollback()
            raise

    def listar(
        self,
        produto_id: int | None,
        modelo_id: int | None,
        cor_id: int | None,
        tipo: TipoMovimentacao | None,
        usuario_id: int | None,
        data_inicio: datetime | None,
        data_fim: datetime | None,
        pagina: int,
        tamanho_pagina: int,
    ) -> tuple[list[Movimentacao], int]:
        return self.mov_repo.list(
            produto_id=produto_id,
            modelo_id=modelo_id,
            cor_id=cor_id,
            tipo=tipo,
            usuario_id=usuario_id,
            data_inicio=data_inicio,
            data_fim=data_fim,
            pagina=pagina,
            tamanho_pagina=tamanho_pagina,
        )
