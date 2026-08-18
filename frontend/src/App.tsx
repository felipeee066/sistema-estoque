import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Estoque from "@/pages/Estoque";
import Modelos from "@/pages/Modelos";
import Cores from "@/pages/Cores";
import Movimentacoes from "@/pages/Movimentacoes";
import Usuarios from "@/pages/Usuarios";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/estoque"
            element={
              <ProtectedRoute>
                <Layout>
                  <Estoque />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/movimentacoes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Movimentacoes />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/modelos"
            element={
              <ProtectedRoute>
                <Layout>
                  <Modelos />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cores"
            element={
              <ProtectedRoute>
                <Layout>
                  <Cores />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <ProtectedRoute requerAdmin>
                <Layout>
                  <Usuarios />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
