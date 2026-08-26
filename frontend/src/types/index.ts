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
export type TipoEstoque = "PECA" | "CAIXA" | "EMBALAGEM";

export interface Produto {
  id: number;
  tipo_estoque: TipoEstoque;
  modelo: Modelo | null;
  cor: Cor | null;
  nome: string | null;
  descricao: string;
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
    tipo_estoque: TipoEstoque;
    modelo: { id: number; nome: string } | null;
    cor: { id: number; nome: string } | null;
    nome: string | null;
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

export interface ResumoTipoEstoque {
  total_itens: number;
  itens_estoque_baixo: number;
  itens_zerados: number;
}

export interface DashboardData {
  pecas: ResumoTipoEstoque;
  caixas: ResumoTipoEstoque;
  embalagens: ResumoTipoEstoque;
  ultimas_movimentacoes: Movimentacao[];
  produtos_criticos: Produto[];
}

export interface ItemRelatorio {
  id: number;
  tipo_estoque: TipoEstoque;
  modelo: string | null;
  cor: string | null;
  nome: string | null;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_faltante: number;
}

export interface RelatorioReposicao {
  gerado_em: string;
  total_itens: number;
  pecas: ItemRelatorio[];
  caixas: ItemRelatorio[];
  embalagens: ItemRelatorio[];
}
