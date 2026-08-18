import { api } from "./api";
import type { Movimentacao, MovimentacaoListResponse, TipoMovimentacao } from "@/types";

export interface FiltrosMovimentacao {
  produto_id?: number;
  modelo_id?: number;
  cor_id?: number;
  tipo?: TipoMovimentacao;
  usuario_id?: number;
  data_inicio?: string;
  data_fim?: string;
  pagina?: number;
  tamanho_pagina?: number;
}

export const movimentacaoService = {
  listar: (filtros: FiltrosMovimentacao) =>
    api.get<MovimentacaoListResponse>("/movimentacoes", { params: filtros }).then((r) => r.data),

  registrar: (dados: {
    produto_id: number;
    tipo_movimentacao: "ENTRADA" | "SAIDA";
    quantidade: number;
    motivo?: string;
    observacao?: string;
    forcar?: boolean;
  }) => api.post<Movimentacao>("/movimentacoes", dados).then((r) => r.data),

  ajustar: (dados: {
    produto_id: number;
    quantidade_correta: number;
    motivo?: string;
    observacao?: string;
  }) => api.post<Movimentacao>("/movimentacoes/ajuste", dados).then((r) => r.data),
};
