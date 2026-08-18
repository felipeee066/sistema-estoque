# Sistema de Controle de Estoque

Sistema web completo de controle de estoque por modelo e cor, com histórico de
movimentações, usuários com permissões e dashboard.

## Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Python + FastAPI + SQLAlchemy + Pydantic
- **Banco de dados:** PostgreSQL
- **Migrations:** Alembic
- **Autenticação:** JWT (login com usuário e senha, dois perfis: Administrador e Operador)

## Estrutura do projeto

```
sistema-estoque/
├── backend/
│   ├── app/
│   │   ├── main.py            # instância FastAPI + registro dos routers
│   │   ├── seed.py            # script para criar o 1º administrador
│   │   ├── core/               # config, database, security (JWT/hash)
│   │   ├── models/             # SQLAlchemy: usuario, modelo, cor, produto, movimentacao
│   │   ├── schemas/             # Pydantic (validação de entrada/saída)
│   │   ├── repositories/        # acesso a dados (queries)
│   │   ├── services/             # regras de negócio
│   │   ├── routers/              # endpoints REST
│   │   └── dependencies/          # autenticação/autorização
│   └── alembic/                    # migrations
├── frontend/
│   └── src/
│       ├── pages/              # Login, Dashboard, Estoque, Modelos, Cores,
│       │                         Movimentacoes, Usuarios
│       ├── components/          # Layout, Modal, StatusBadge, ProtectedRoute
│       ├── contexts/             # AuthContext (estado de autenticação)
│       ├── services/              # chamadas à API (axios)
│       └── types/                  # tipos TypeScript compartilhados
└── docker-compose.yml           # PostgreSQL local
```

## Funcionalidades entregues

- **Dashboard:** total de produtos, itens em estoque, produtos com estoque baixo/zerado,
  últimas movimentações e produtos críticos.
- **Estoque:** listagem com busca, filtros (modelo/cor/status), paginação, destaque visual
  de status (Normal/Baixo/Zerado), cadastro de novas combinações modelo+cor, e ações de
  Entrada/Saída/Ajuste direto na tabela.
- **Modelos e Cores:** CRUD completo, com verificação de duplicidade e ativar/desativar
  (nunca apaga fisicamente — preserva o histórico).
- **Movimentações:** toda alteração de estoque gera um registro automático, com
  quantidade anterior/posterior, motivo, observação, usuário e data. Histórico com
  filtros por período, modelo, cor, tipo e usuário.
- **Usuários e permissões:** dois perfis — Administrador (acesso total, incluindo
  gestão de usuários e autorização de saídas maiores que o estoque) e Operador
  (consulta, entradas, saídas e histórico).
- **Regras de integridade:** quantidade nunca negativa, sem duplicidade de modelo/cor,
  sem duplicidade de nome em modelos/cores, transação atômica entre estoque e
  movimentação (banco garante isso via `SELECT ... FOR UPDATE` + commit único).

## Como executar

### 1. Banco de dados (PostgreSQL via Docker)

```bash
cd sistema-estoque
docker compose up -d
```

Isso sobe um PostgreSQL em `localhost:5432` (usuário `estoque_user` / senha `estoque_pass`
/ banco `estoque_db`). Sem Docker? Aponte a `DATABASE_URL` do `.env` para qualquer
PostgreSQL já existente.

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # ajuste SECRET_KEY em produção

# Cria as tabelas no banco:
alembic upgrade head

# Cria o primeiro usuário administrador (obrigatório para conseguir logar):
python -m app.seed

# Sobe a API:
uvicorn app.main:app --reload
```

- API: `http://localhost:8000`
- Documentação interativa: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Acesse `http://localhost:5173` e faça login com o usuário administrador criado no seed.

## Fluxo de uso típico

1. Cadastre alguns **Modelos** (ex: "Deck Liso") e **Cores** (ex: "Natural") em suas
   respectivas telas.
2. Na tela **Estoque**, clique em "Nova combinação" para criar a combinação Modelo+Cor
   com uma quantidade inicial e estoque mínimo.
3. Use os botões **Entrada / Saída / Ajustar** na própria linha da tabela para
   movimentar o estoque — cada ação pede motivo/observação e gera um registro
   automático no histórico.
4. Acompanhe tudo pelo **Dashboard** e consulte o **histórico completo** em
   Movimentações, com filtros por período, modelo, cor, tipo e usuário.
5. Administradores podem gerenciar **Usuários** (criar operadores, promover a admin,
   desativar acessos).

## Observações importantes

- **Segurança:** senhas com hash bcrypt, autenticação JWT, autorização por perfil em
  cada endpoint sensível (ex: só admin cria/edita modelos, cores, produtos e usuários),
  nenhuma credencial hardcoded — tudo via `.env`.
- **Transações:** movimentações de estoque usam `SELECT ... FOR UPDATE` na linha do
  produto e um único commit para produto+movimentação, evitando condição de corrida
  entre usuários simultâneos e garantindo que o histórico nunca fique dessincronizado
  do saldo.
- **Sem apagar histórico:** modelos, cores e produtos são apenas desativados
  (soft delete via campo `ativo`), nunca removidos fisicamente. Movimentações nunca
  são editadas ou apagadas.
- **Ambiente de geração:** este projeto foi escrito neste ambiente sem acesso à
  internet, portanto não foi possível rodar `pip install` / `npm install` /
  `alembic upgrade` / `npm run build` para validação end-to-end automática. O código
  foi revisado manualmente (sintaxe Python validada com `py_compile`, chaves/parênteses
  do TypeScript conferidos) mas **recomenda-se fortemente testar localmente** seguindo
  os passos acima antes de usar em produção. Caso encontre algum erro ao rodar,
  descreva o que aconteceu que eu ajusto.

## Próximos passos sugeridos (fora do escopo atual)

- Testes automatizados (pytest no backend, Vitest/RTL no frontend)
- Deploy (Docker para o backend, build estático do frontend atrás de um proxy/CDN)
- Relatórios e exportação (CSV/PDF)
- Módulos futuros: pedidos, clientes, fornecedores, integrações
