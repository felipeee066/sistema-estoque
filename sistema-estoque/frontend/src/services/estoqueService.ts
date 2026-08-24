import { api } from "./api";
import type { Produto, ProdutoListResponse, StatusEstoque, TipoEstoque } from "@/types";

export interface FiltrosEstoque {
  tipo_estoque?: TipoEstoque;
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

  criar: (dados: {
    tipo_estoque: TipoEstoque;
    modelo_id?: number;
    cor_id?: number;
    nome?: string;
    quantidade: number;
    estoque_minimo: number;
  }) => api.post<Produto>("/estoque", dados).then((r) => r.data),

  atualizar: (
    id: number,
    dados: Partial<{
      modelo_id: number;
      cor_id: number;
      nome: string;
      estoque_minimo: number;
      ativo: boolean;
    }>
  ) => api.put<Produto>(`/estoque/${id}`, dados).then((r) => r.data),

  excluir: (id: number) =>
    api.delete<{ status: string; mensagem: string }>(`/estoque/${id}`).then((r) => r.data),
};
