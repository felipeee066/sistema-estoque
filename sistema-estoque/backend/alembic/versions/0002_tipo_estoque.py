"""add tipo_estoque, caixas e embalagens

Revision ID: 0002_tipo_estoque
Revises: 0001_initial
Create Date: 2026-08-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_tipo_estoque"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    tipo_estoque = sa.Enum("PECA", "CAIXA", "EMBALAGEM", name="tipo_estoque")
    tipo_estoque.create(op.get_bind(), checkfirst=True)

    # Novo campo tipo_estoque — todo produto existente é PECA por padrão
    op.add_column(
        "produtos",
        sa.Column("tipo_estoque", tipo_estoque, nullable=False, server_default="PECA"),
    )

    # Novo campo nome — usado só por CAIXA/EMBALAGEM
    op.add_column("produtos", sa.Column("nome", sa.String(length=120), nullable=True))

    # modelo_id e cor_id passam a ser opcionais (só obrigatórios para PECA)
    op.alter_column("produtos", "modelo_id", existing_type=sa.Integer(), nullable=True)
    op.alter_column("produtos", "cor_id", existing_type=sa.Integer(), nullable=True)

    # Novo índice único: não pode haver duas caixas (ou embalagens) com o mesmo nome
    op.create_unique_constraint("uq_produto_tipo_nome", "produtos", ["tipo_estoque", "nome"])


def downgrade() -> None:
    op.drop_constraint("uq_produto_tipo_nome", "produtos", type_="unique")
    op.alter_column("produtos", "cor_id", existing_type=sa.Integer(), nullable=False)
    op.alter_column("produtos", "modelo_id", existing_type=sa.Integer(), nullable=False)
    op.drop_column("produtos", "nome")
    op.drop_column("produtos", "tipo_estoque")

    tipo_estoque = sa.Enum("PECA", "CAIXA", "EMBALAGEM", name="tipo_estoque")
    tipo_estoque.drop(op.get_bind(), checkfirst=True)
