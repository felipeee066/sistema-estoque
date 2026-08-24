import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes as BoxIcon,
  PackageOpen,
  ArrowLeftRight,
  FileBarChart,
  Tags,
  Palette,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ItemMenu {
  to: string;
  label: string;
  icon: typeof Package;
}

interface GrupoMenu {
  titulo: string | null; // null = item único sem subgrupo (ex: Dashboard)
  itens: ItemMenu[];
  admin?: boolean;
}

const grupos: GrupoMenu[] = [
  { titulo: null, itens: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }] },
  {
    titulo: "Estoques",
    itens: [
      { to: "/estoque/pecas", label: "Peças", icon: Package },
      { to: "/estoque/caixas", label: "Caixas", icon: BoxIcon },
      { to: "/estoque/embalagens", label: "Embalagens", icon: PackageOpen },
    ],
  },
  {
    titulo: null,
    itens: [
      { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
      { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
    ],
  },
  {
    titulo: "Cadastros",
    itens: [
      { to: "/modelos", label: "Modelos", icon: Tags },
      { to: "/cores", label: "Cores", icon: Palette },
    ],
  },
  {
    titulo: "Administração",
    admin: true,
    itens: [{ to: "/usuarios", label: "Usuários", icon: Users }],
  },
];

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, logout, isAdmin } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* overlay mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden print:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        className={`print:hidden fixed md:sticky top-0 md:top-0 left-0 z-40 md:z-auto h-screen w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform ${
          menuAberto ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800 shrink-0">
          <h1 className="text-lg font-semibold text-white leading-tight">Controle de Estoque</h1>
          <p className="text-xs text-slate-400 mt-1">{usuario?.nome}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {grupos
            .filter((g) => !g.admin || isAdmin)
            .map((grupo, idx) => (
              <div key={idx}>
                {grupo.titulo && (
                  <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {grupo.titulo}
                  </p>
                )}
                <div className="space-y-1">
                  {grupo.itens.map(({ to, label, icon: Icon }) => (
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
                </div>
              </div>
            ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800 shrink-0">
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
        <header className="print:hidden md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <span className="font-semibold text-slate-800">Controle de Estoque</span>
          <button onClick={() => setMenuAberto(!menuAberto)} aria-label="Abrir menu">
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 print:p-0 overflow-x-hidden bg-slate-50 print:bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
