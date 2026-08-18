import { api } from "./api";
import type { Produto, ProdutoListResponse, StatusEstoque } from "@/types";

export interface FiltrosEstoque {
  busca?: string;
  modelo_id?: number;
  cor_id?: number;
  status?: StatusEstoque;
  pagina?: number;
  tamanho_pagina?: number;
}

export const estoqueService = {
  listar: (filtros: FiltrosEstoque) =>
    api.get<ProdutoListResponse>("/estoque", { params: filtros }).then((r) => r.data),

  obter: (id: number) => api.get<Produto>(`/estoque/${id}`).then((r) => r.data),

  criar: (dados: { modelo_id: number; cor_id: number; quantidade: number; estoque_minimo: number }) =>
    api.post<Produto>("/estoque", dados).then((r) => r.data),

  atualizar: (id: number, dados: Partial<{ estoque_minimo: number; ativo: boolean }>) =>
    api.put<Produto>(`/estoque/${id}`, dados).then((r) => r.data),
};
