"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-08-17

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    perfil_usuario = sa.Enum("ADMINISTRADOR", "OPERADOR", name="perfil_usuario")
    tipo_movimentacao = sa.Enum("ENTRADA", "SAIDA", "AJUSTE", name="tipo_movimentacao")

    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("senha_hash", sa.String(length=255), nullable=False),
        sa.Column("perfil", perfil_usuario, nullable=False, server_default="OPERADOR"),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("data_criacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("data_atualizacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_usuarios_email", "usuarios", ["email"], unique=True)

    op.create_table(
        "modelos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(length=120), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("data_criacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("data_atualizacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_modelos_nome", "modelos", ["nome"], unique=True)

    op.create_table(
        "cores",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(length=80), nullable=False),
        sa.Column("codigo_hex", sa.String(length=7), nullable=True),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("data_criacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("data_atualizacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_cores_nome", "cores", ["nome"], unique=True)

    op.create_table(
        "produtos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("modelo_id", sa.Integer(), sa.ForeignKey("modelos.id"), nullable=False),
        sa.Column("cor_id", sa.Integer(), sa.ForeignKey("cores.id"), nullable=False),
        sa.Column("quantidade", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("estoque_minimo", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("data_criacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("data_atualizacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("modelo_id", "cor_id", name="uq_produto_modelo_cor"),
    )
    op.create_check_constraint("ck_produto_quantidade_nao_negativa", "produtos", "quantidade >= 0")
    op.create_check_constraint(
        "ck_produto_estoque_minimo_nao_negativo", "produtos", "estoque_minimo >= 0"
    )

    op.create_table(
        "movimentacoes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("produto_id", sa.Integer(), sa.ForeignKey("produtos.id"), nullable=False),
        sa.Column("usuario_id", sa.Integer(), sa.ForeignKey("usuarios.id"), nullable=False),
        sa.Column("tipo_movimentacao", tipo_movimentacao, nullable=False),
        sa.Column("quantidade", sa.Integer(), nullable=False),
        sa.Column("quantidade_anterior", sa.Integer(), nullable=False),
        sa.Column("quantidade_posterior", sa.Integer(), nullable=False),
        sa.Column("motivo", sa.String(length=255), nullable=True),
        sa.Column("observacao", sa.Text(), nullable=True),
        sa.Column("data_movimentacao", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_movimentacoes_produto_id", "movimentacoes", ["produto_id"])
    op.create_index("ix_movimentacoes_data_movimentacao", "movimentacoes", ["data_movimentacao"])
    op.create_check_constraint(
        "ck_movimentacao_quantidade_positiva", "movimentacoes", "quantidade > 0"
    )
    op.create_check_constraint(
        "ck_movimentacao_quantidade_anterior_nao_negativa",
        "movimentacoes",
        "quantidade_anterior >= 0",
    )
    op.create_check_constraint(
        "ck_movimentacao_quantidade_posterior_nao_negativa",
        "movimentacoes",
        "quantidade_posterior >= 0",
    )


def downgrade() -> None:
    op.drop_table("movimentacoes")
    op.drop_table("produtos")
    op.drop_table("cores")
    op.drop_table("modelos")
    op.drop_table("usuarios")
    sa.Enum(name="tipo_movimentacao").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="perfil_usuario").drop(op.get_bind(), checkfirst=True)
