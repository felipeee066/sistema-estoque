export type PerfilUsuario = "ADMINISTRADOR" | "OPERADOR";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  data_criacao: string;
}

export interface Modelo {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Cor {
  id: number;
  nome: string;
  codigo_hex: string | null;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export type StatusEstoque = "NORMAL" | "BAIXO" | "ZERADO";

export interface Produto {
  id: number;
  modelo: Modelo;
  cor: Cor;
  quantidade: number;
  estoque_minimo: number;
  ativo: boolean;
  status: StatusEstoque;
  data_criacao: string;
  data_atualizacao: string;
}

export interface ProdutoListResponse {
  total: number;
  pagina: number;
  tamanho_pagina: number;
  itens: Produto[];
}

export type TipoMovimentacao = "ENTRADA" | "SAIDA" | "AJUSTE";

export interface Movimentacao {
  id: number;
  produto: {
    id: number;
    modelo: { id: number; nome: string };
    cor: { id: number; nome: string };
  };
  usuario: { id: number; nome: string };
  tipo_movimentacao: TipoMovimentacao;
  quantidade: number;
  quantidade_anterior: number;
  quantidade_posterior: number;
  motivo: string | null;
  observacao: string | null;
  data_movimentacao: string;
}

export interface MovimentacaoListResponse {
  total: number;
  pagina: number;
  tamanho_pagina: number;
  itens: Movimentacao[];
}

export interface DashboardData {
  total_produtos: number;
  total_itens_estoque: number;
  produtos_estoque_baixo: number;
  produtos_zerados: number;
  ultimas_movimentacoes: Movimentacao[];
  produtos_criticos: Produto[];
}
