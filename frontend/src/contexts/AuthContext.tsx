import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/authService";
import { clearToken, getToken, setToken } from "@/services/api";
import type { Usuario } from "@/types";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCarregando(false);
      return;
    }
    authService
      .me()
      .then(setUsuario)
      .catch(() => clearToken())
      .finally(() => setCarregando(false));
  }, []);

  async function login(email: string, senha: string) {
    const resposta = await authService.login(email, senha);
    setToken(resposta.access_token);
    setUsuario(resposta.usuario);
  }

  function logout() {
    clearToken();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, login, logout, isAdmin: usuario?.perfil === "ADMINISTRADOR" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
