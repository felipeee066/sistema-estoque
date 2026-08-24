import { api } from "./api";
import type { RelatorioReposicao, TipoEstoque } from "@/types";

export const relatorioService = {
  reposicao: (filtros: { tipo_estoque?: TipoEstoque; somente_zerados?: boolean }) =>
    api.get<RelatorioReposicao>("/relatorios/reposicao", { params: filtros }).then((r) => r.data),
};
