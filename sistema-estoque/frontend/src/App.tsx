import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import EstoquePecas from "@/pages/EstoquePecas";
import EstoqueCaixas from "@/pages/EstoqueCaixas";
import EstoqueEmbalagens from "@/pages/EstoqueEmbalagens";
import Modelos from "@/pages/Modelos";
import Cores from "@/pages/Cores";
import Movimentacoes from "@/pages/Movimentacoes";
import Relatorios from "@/pages/Relatorios";
import Usuarios from "@/pages/Usuarios";

function Protegida({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  return (
    <ProtectedRoute requerAdmin={admin}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Protegida><Dashboard /></Protegida>} />
          <Route path="/estoque/pecas" element={<Protegida><EstoquePecas /></Protegida>} />
          <Route path="/estoque/caixas" element={<Protegida><EstoqueCaixas /></Protegida>} />
          <Route path="/estoque/embalagens" element={<Protegida><EstoqueEmbalagens /></Protegida>} />
          <Route path="/movimentacoes" element={<Protegida><Movimentacoes /></Protegida>} />
          <Route path="/relatorios" element={<Protegida><Relatorios /></Protegida>} />
          <Route path="/modelos" element={<Protegida><Modelos /></Protegida>} />
          <Route path="/cores" element={<Protegida><Cores /></Protegida>} />
          <Route path="/usuarios" element={<Protegida admin><Usuarios /></Protegida>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
