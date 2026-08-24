"""
Importa todos os models para que fiquem registrados em Base.metadata
— necessário para o Alembic detectar as tabelas automaticamente.
"""
from app.models.usuario import Usuario, PerfilUsuario  # noqa: F401
from app.models.modelo import Modelo  # noqa: F401
from app.models.cor import Cor  # noqa: F401
from app.models.produto import Produto, TipoEstoque  # noqa: F401
from app.models.movimentacao import Movimentacao, TipoMovimentacao  # noqa: F401
