import { api } from "./api";
import type { Usuario } from "@/types";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export const authService = {
  login: (email: string, senha: string) =>
    api.post<LoginResponse>("/auth/login", { email, senha }).then((r) => r.data),

  me: () => api.get<Usuario>("/auth/me").then((r) => r.data),
};
