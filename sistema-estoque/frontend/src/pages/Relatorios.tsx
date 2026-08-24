import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { relatorioService } from "@/services/relatorioService";
import type { ItemRelatorio, RelatorioReposicao, TipoEstoque } from "@/types";

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

function TabelaPecas({ itens }: { itens: ItemRelatorio[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="mb-6 break-inside-avoid">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 print:text-black">PEÇAS</h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-slate-300">
            <th className="py-1.5 pr-2 font-medium">Modelo</th>
            <th className="py-1.5 pr-2 font-medium">Cor</th>
            <th className="py-1.5 pr-2 font-medium text-right">Atual</th>
            <th className="py-1.5 pr-2 font-medium text-right">Mínimo</th>
            <th className="py-1.5 font-medium text-right">Faltante</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((i) => (
            <tr key={i.id} className="border-b border-slate-100">
              <td className="py-1.5 pr-2">{i.modelo}</td>
              <td className="py-1.5 pr-2">{i.cor}</td>
              <td className="py-1.5 pr-2 text-right">{i.quantidade_atual}</td>
              <td className="py-1.5 pr-2 text-right">{i.quantidade_minima}</td>
              <td className="py-1.5 text-right font-medium text-red-700 print:text-black">
                {i.quantidade_faltante}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabelaSimples({ titulo, itens }: { titulo: string; itens: ItemRelatorio[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="mb-6 break-inside-avoid">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 print:text-black">{titulo}</h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-slate-300">
            <th className="py-1.5 pr-2 font-medium">Nome</th>
            <th className="py-1.5 pr-2 font-medium text-right">Atual</th>
            <th className="py-1.5 pr-2 font-medium text-right">Mínimo</th>
            <th className="py-1.5 font-medium text-right">Faltante</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((i) => (
            <tr key={i.id} className="border-b border-slate-100">
              <td className="py-1.5 pr-2">{i.nome}</td>
              <td className="py-1.5 pr-2 text-right">{i.quantidade_atual}</td>
              <td className="py-1.5 pr-2 text-right">{i.quantidade_minima}</td>
              <td className="py-1.5 text-right font-medium text-red-700 print:text-black">
                {i.quantidade_faltante}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Relatorios() {
  const [dados, setDados] = useState<RelatorioReposicao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tipoEstoque, setTipoEstoque] = useState<TipoEstoque | "">("");
  const [somenteZerados, setSomenteZerados] = useState(false);

  useEffect(() => {
    setCarregando(true);
    relatorioService
      .reposicao({ tipo_estoque: tipoEstoque || undefined, somente_zerados: somenteZerados })
      .then(setDados)
      .finally(() => setCarregando(false));
  }, [tipoEstoque, somenteZerados]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho e filtros — não aparecem na impressão */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Relatório de Reposição</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 w-fit"
        >
          <Printer size={16} /> Imprimir relatório
        </button>
      </div>

      <div className="print:hidden bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tipo de estoque</label>
          <select
            value={tipoEstoque}
            onChange={(e) => setTipoEstoque(e.target.value as TipoEstoque | "")}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="PECA">Peças</option>
            <option value="CAIXA">Caixas</option>
            <option value="EMBALAGEM">Embalagens</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
          <input
            type="checkbox"
            checked={somenteZerados}
            onChange={(e) => setSomenteZerados(e.target.checked)}
          />
          Somente zerados
        </label>
      </div>

      {/* Área do relatório — visível na tela e otimizada para impressão */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 print:shadow-none print:border-0 print:p-0">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800 print:text-black">
            RELATÓRIO DE ESTOQUE — ITENS PARA REPOSIÇÃO
          </h2>
          {dados && (
            <p className="text-xs text-slate-500 print:text-black">
              Gerado em: {formatarData(dados.gerado_em)} · Total de itens: {dados.total_itens}
            </p>
          )}
        </div>

        {carregando ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : !dados || dados.total_itens === 0 ? (
          <p className="text-slate-400 text-sm">
            Nenhum item precisa de reposição no momento — tudo dentro do estoque mínimo.
          </p>
        ) : (
          <div>
            <TabelaPecas itens={dados.pecas} />
            <TabelaSimples titulo="CAIXAS" itens={dados.caixas} />
            <TabelaSimples titulo="EMBALAGENS" itens={dados.embalagens} />
          </div>
        )}
      </div>
    </div>
  );
}
