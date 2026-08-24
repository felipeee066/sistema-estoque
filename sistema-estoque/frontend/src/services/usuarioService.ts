import { api } from "./api";
import type { PerfilUsuario, Usuario } from "@/types";

export const usuarioService = {
  listar: (apenasAtivos = false) =>
    api.get<Usuario[]>("/usuarios", { params: { apenas_ativos: apenasAtivos } }).then((r) => r.data),

  criar: (dados: { nome: string; email: string; senha: string; perfil: PerfilUsuario }) =>
    api.post<Usuario>("/usuarios", dados).then((r) => r.data),

  atualizar: (
    id: number,
    dados: Partial<{ nome: string; perfil: PerfilUsuario; ativo: boolean; senha: string }>
  ) => api.put<Usuario>(`/usuarios/${id}`, dados).then((r) => r.data),
};
