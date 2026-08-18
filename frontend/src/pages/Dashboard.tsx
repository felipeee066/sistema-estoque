import { useEffect, useState } from "react";
import { Package, AlertTriangle, XCircle, Boxes } from "lucide-react";
import { api } from "@/services/api";
import { StatusBadge } from "@/components/StatusBadge";
import type { DashboardData } from "@/types";

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const rotulosTipo: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
};

function CardMetrica({
  titulo,
  valor,
  icone: Icone,
  cor,
}: {
  titulo: string;
  valor: number;
  icone: typeof Package;
  cor: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${cor}`}>
        <Icone size={22} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-800">{valor}</p>
        <p className="text-sm text-slate-500">{titulo}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardData>("/dashboard")
      .then((r) => setDados(r.data))
      .catch(() => setErro("Não foi possível carregar o dashboard."))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p className="text-slate-400">Carregando...</p>;
  if (erro) return <p className="text-red-600">{erro}</p>;
  if (!dados) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardMetrica
          titulo="Produtos cadastrados"
          valor={dados.total_produtos}
          icone={Boxes}
          cor="bg-blue-50 text-blue-600"
        />
        <CardMetrica
          titulo="Itens em estoque"
          valor={dados.total_itens_estoque}
          icone={Package}
          cor="bg-slate-100 text-slate-700"
        />
        <CardMetrica
          titulo="Estoque baixo"
          valor={dados.produtos_estoque_baixo}
          icone={AlertTriangle}
          cor="bg-yellow-50 text-yellow-600"
        />
        <CardMetrica
          titulo="Zerados"
          valor={dados.produtos_zerados}
          icone={XCircle}
          cor="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Produtos críticos</h2>
          {dados.produtos_criticos.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum produto com estoque baixo ou zerado.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {dados.produtos_criticos.map((p) => (
                <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    {p.modelo.nome} — {p.cor.nome}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{p.quantidade} un.</span>
                    <StatusBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Últimas movimentações</h2>
          {dados.ultimas_movimentacoes.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma movimentação registrada ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {dados.ultimas_movimentacoes.map((m) => (
                <li key={m.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">
                      {m.produto.modelo.nome} — {m.produto.cor.nome}
                    </span>
                    <span className="text-slate-400 text-xs">{formatarData(m.data_movimentacao)}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {rotulosTipo[m.tipo_movimentacao]} de {m.quantidade} un. por {m.usuario.nome}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
