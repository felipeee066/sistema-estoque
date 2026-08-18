import { api } from "./api";
import type { Cor } from "@/types";

export const corService = {
  listar: (busca?: string, apenasAtivos = false) =>
    api.get<Cor[]>("/cores", { params: { busca, apenas_ativos: apenasAtivos } }).then((r) => r.data),

  criar: (dados: { nome: string; codigo_hex?: string }) =>
    api.post<Cor>("/cores", dados).then((r) => r.data),

  atualizar: (id: number, dados: Partial<{ nome: string; codigo_hex: string; ativo: boolean }>) =>
    api.put<Cor>(`/cores/${id}`, dados).then((r) => r.data),
};
