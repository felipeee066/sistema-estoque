"""
Ponto de entrada da aplicação FastAPI.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="Sistema de Controle de Estoque",
    version="0.1.0",
    description="API REST para controle de estoque por modelo e cor.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.routers import auth, bootstrap, cores, dashboard, estoque, modelos, movimentacoes, usuarios

app.include_router(auth.router)
app.include_router(modelos.router)
app.include_router(cores.router)
app.include_router(estoque.router)
app.include_router(movimentacoes.router)
app.include_router(usuarios.router)
app.include_router(dashboard.router)
app.include_router(bootstrap.router)


@app.get("/health", tags=["health"])
def health_check():
    """Endpoint simples para verificar se a API está no ar e configurada."""
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
    }
