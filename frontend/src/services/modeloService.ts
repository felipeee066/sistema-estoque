import { api } from "./api";
import type { Modelo } from "@/types";

export const modeloService = {
  listar: (busca?: string, apenasAtivos = false) =>
    api
      .get<Modelo[]>("/modelos", { params: { busca, apenas_ativos: apenasAtivos } })
      .then((r) => r.data),

  criar: (dados: { nome: string; descricao?: string }) =>
    api.post<Modelo>("/modelos", dados).then((r) => r.data),

  atualizar: (id: number, dados: Partial<{ nome: string; descricao: string; ativo: boolean }>) =>
    api.put<Modelo>(`/modelos/${id}`, dados).then((r) => r.data),
};
