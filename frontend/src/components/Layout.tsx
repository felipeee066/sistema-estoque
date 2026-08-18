import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Tags,
  Palette,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const itensMenu = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, admin: false },
  { to: "/estoque", label: "Estoque", icon: Package, admin: false },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight, admin: false },
  { to: "/modelos", label: "Modelos", icon: Tags, admin: false },
  { to: "/cores", label: "Cores", icon: Palette, admin: false },
  { to: "/usuarios", label: "Usuários", icon: Users, admin: true },
];

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, logout, isAdmin } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  const itensVisiveis = itensMenu.filter((item) => !item.admin || isAdmin);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* overlay mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        className={`fixed md:static z-40 md:z-auto top-0 left-0 h-full w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform ${
          menuAberto ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800">
          <h1 className="text-lg font-semibold text-white leading-tight">Controle de Estoque</h1>
          <p className="text-xs text-slate-400 mt-1">{usuario?.nome}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {itensVisiveis.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMenuAberto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <span className="font-semibold text-slate-800">Controle de Estoque</span>
          <button onClick={() => setMenuAberto(!menuAberto)} aria-label="Abrir menu">
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
