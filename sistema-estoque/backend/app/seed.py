"""
Script para criar o primeiro usuário administrador do sistema.
Necessário porque a criação de usuários via API exige um admin logado
(problema do "ovo e da galinha" na primeira execução).

Uso:
    cd backend
    python -m app.seed
"""
import getpass

from app.core.database import SessionLocal
from app.core.security import hash_senha
from app.models.usuario import PerfilUsuario, Usuario
from app.repositories.usuario_repository import UsuarioRepository


def main():
    print("=== Criação do primeiro usuário administrador ===")
    nome = input("Nome: ").strip()
    email = input("E-mail: ").strip().lower()
    senha = getpass.getpass("Senha (mín. 6 caracteres): ")

    if len(senha) < 6:
        print("Senha muito curta. Abortando.")
        return

    db = SessionLocal()
    try:
        repo = UsuarioRepository(db)
        if repo.get_by_email(email):
            print(f"Já existe um usuário com o e-mail {email}. Abortando.")
            return

        usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=hash_senha(senha),
            perfil=PerfilUsuario.ADMINISTRADOR,
        )
        repo.create(usuario)
        repo.commit_refresh(usuario)
        print(f"Administrador '{nome}' criado com sucesso (id={usuario.id}).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
