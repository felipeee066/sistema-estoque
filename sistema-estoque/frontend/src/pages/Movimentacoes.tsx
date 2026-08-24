import { useEffect, useState } from "react";
import { movimentacaoService } from "@/services/movimentacaoService";
import { modeloService } from "@/services/modeloService";
import { corService } from "@/services/corService";
import type { Cor, Modelo, Movimentacao, TipoEstoque, TipoMovimentacao } from "@/types";

const TAMANHO_PAGINA = 20;

const rotulosTipo: Record<TipoMovimentacao, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
};

const coresTipo: Record<TipoMovimentacao, string> = {
  ENTRADA: "text-green-700",
  SAIDA: "text-red-700",
  AJUSTE: "text-slate-600",
};

const rotulosEstoque: Record<TipoEstoque, string> = {
  PECA: "Peça",
  CAIXA: "Caixa",
  EMBALAGEM: "Embalagem",
};

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

function descricaoProduto(m: Movimentacao): string {
  if (m.produto.tipo_estoque === "PECA") {
    return `${m.produto.modelo?.nome ?? "?"} — ${m.produto.cor?.nome ?? "?"}`;
  }
  return m.produto.nome ?? "?";
}

export default function Movimentacoes() {
  const [itens, setItens] = useState<Movimentacao[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);

  const [tipoEstoque, setTipoEstoque] = useState<TipoEstoque | "">("");
  const [modeloId, setModeloId] = useState<number | "">("");
  const [corId, setCorId] = useState<number | "">("");
  const [tipo, setTipo] = useState<TipoMovimentacao | "">("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [cores, setCores] = useState<Cor[]>([]);

  useEffect(() => {
    modeloService.listar().then(setModelos);
    corService.listar().then(setCores);
  }, []);

  useEffect(() => {
    setCarregando(true);
    movimentacaoService
      .listar({
        modelo_id: tipoEstoque === "PECA" || !tipoEstoque ? modeloId || undefined : undefined,
        cor_id: tipoEstoque === "PECA" || !tipoEstoque ? corId || undefined : undefined,
        tipo: tipo || undefined,
        data_inicio: dataInicio ? new Date(dataInicio).toISOString() : undefined,
        data_fim: dataFim ? new Date(dataFim).toISOString() : undefined,
        pagina,
        tamanho_pagina: TAMANHO_PAGINA,
      })
      .then((r) => {
        const filtrados = tipoEstoque
          ? r.itens.filter((m) => m.produto.tipo_estoque === tipoEstoque)
          : r.itens;
        setItens(filtrados);
        setTotal(tipoEstoque ? filtrados.length : r.total);
      })
      .finally(() => setCarregando(false));
  }, [tipoEstoque, modeloId, corId, tipo, dataInicio, dataFim, pagina]);

  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO_PAGINA));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Histórico de movimentações</h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Tipo de estoque</label>
          <select
            value={tipoEstoque}
            onChange={(e) => {
              setPagina(1);
              setTipoEstoque(e.target.value as TipoEstoque | "");
            }}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="PECA">Peças</option>
            <option value="CAIXA">Caixas</option>
            <option value="EMBALAGEM">Embalagens</option>
          </select>
        </div>

        {(tipoEstoque === "PECA" || !tipoEstoque) && (
          <>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Modelo</label>
              <select
                value={modeloId}
                onChange={(e) => {
                  setPagina(1);
                  setModeloId(e.target.value ? Number(e.target.value) : "");
                }}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Cor</label>
              <select
                value={corId}
                onChange={(e) => {
                  setPagina(1);
                  setCorId(e.target.value ? Number(e.target.value) : "");
                }}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {cores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs text-slate-500 mb-1">Movimento</label>
          <select
            value={tipo}
            onChange={(e) => {
              setPagina(1);
              setTipo(e.target.value as TipoMovimentacao | "");
            }}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="AJUSTE">Ajuste</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">De</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => {
              setPagina(1);
              setDataInicio(e.target.value);
            }}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Até</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => {
              setPagina(1);
              setDataFim(e.target.value);
            }}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {carregando ? (
          <p className="text-slate-400 text-sm p-4">Carregando...</p>
        ) : itens.length === 0 ? (
          <p className="text-slate-400 text-sm p-4">Nenhuma movimentação encontrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Tipo de estoque</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Movimento</th>
                <th className="px-4 py-3 font-medium text-right">Quantidade</th>
                <th className="px-4 py-3 font-medium text-right">Antes</th>
                <th className="px-4 py-3 font-medium text-right">Depois</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Observação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatarData(m.data_movimentacao)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{rotulosEstoque[m.produto.tipo_estoque]}</td>
                  <td className="px-4 py-3 text-slate-700">{descricaoProduto(m)}</td>
                  <td className={`px-4 py-3 font-medium ${coresTipo[m.tipo_movimentacao]}`}>
                    {rotulosTipo[m.tipo_movimentacao]}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{m.quantidade}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{m.quantidade_anterior}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{m.quantidade_posterior}</td>
                  <td className="px-4 py-3 text-slate-600">{m.usuario.nome}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                    {m.motivo || m.observacao || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > TAMANHO_PAGINA && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Página {pagina} de {totalPaginas} — {total} registros
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
              className="px-3 py-1.5 rounded-md border border-slate-300 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
              className="px-3 py-1.5 rounded-md border border-slate-300 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
