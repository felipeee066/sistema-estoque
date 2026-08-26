import { useEffect, useState, type FormEvent } from "react";
import { Plus, Search } from "lucide-react";
import { estoqueService } from "@/services/estoqueService";
import { movimentacaoService } from "@/services/movimentacaoService";
import { modeloService } from "@/services/modeloService";
import { corService } from "@/services/corService";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { Cor, Modelo, Produto, StatusEstoque, TipoEstoque } from "@/types";

const TAMANHO_PAGINA = 20;

interface EstoqueGenericoProps {
  tipoEstoque: TipoEstoque;
  titulo: string;
  rotuloItem: string; // "combinação", "caixa", "embalagem"
}

export function EstoqueGenerico({ tipoEstoque, titulo, rotuloItem }: EstoqueGenericoProps) {
  const { isAdmin } = useAuth();
  const ehPeca = tipoEstoque === "PECA";

  const [itens, setItens] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [busca, setBusca] = useState("");
  const [modeloId, setModeloId] = useState<number | "">("");
  const [corId, setCorId] = useState<number | "">("");
  const [status, setStatus] = useState<StatusEstoque | "">("");

  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [cores, setCores] = useState<Cor[]>([]);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [modalMovimentacao, setModalMovimentacao] = useState<"ENTRADA" | "SAIDA" | "AJUSTE" | null>(
    null
  );
  const [modalNovoItem, setModalNovoItem] = useState(false);
  const [modalEditar, setModalEditar] = useState<Produto | null>(null);
  const [modalExcluir, setModalExcluir] = useState<Produto | null>(null);

  useEffect(() => {
    if (ehPeca) {
      modeloService.listar(undefined, true).then(setModelos);
      corService.listar(undefined, true).then(setCores);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEstoque]);

  function carregar() {
    setCarregando(true);
    setErro(null);
    estoqueService
      .listar({
        tipo_estoque: tipoEstoque,
        busca: busca || undefined,
        modelo_id: ehPeca ? modeloId || undefined : undefined,
        cor_id: ehPeca ? corId || undefined : undefined,
        status: status || undefined,
        pagina,
        tamanho_pagina: TAMANHO_PAGINA,
      })
      .then((r) => {
        setItens(r.itens);
        setTotal(r.total);
      })
      .catch(() => setErro("Não foi possível carregar o estoque."))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    setPagina(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEstoque]);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, modeloId, corId, status]);

  function handleBuscar(e: FormEvent) {
    e.preventDefault();
    setPagina(1);
    carregar();
  }

  async function handleExcluir() {
    if (!modalExcluir) return;
    try {
      await estoqueService.excluir(modalExcluir.id);
      setModalExcluir(null);
      carregar();
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? "Não foi possível excluir este item.");
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(total / TAMANHO_PAGINA));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">{titulo}</h1>
        {isAdmin && (
          <button
            onClick={() => setModalNovoItem(true)}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 w-fit"
          >
            <Plus size={16} /> Nova {rotuloItem}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-3">
        <form onSubmit={handleBuscar} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 mb-1">Pesquisar</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={ehPeca ? "Modelo ou cor..." : "Nome..."}
                className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {ehPeca && (
            <>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Modelo</label>
                <select
                  value={modeloId}
                  onChange={(e) => setModeloId(e.target.value ? Number(e.target.value) : "")}
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
                  onChange={(e) => setCorId(e.target.value ? Number(e.target.value) : "")}
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
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setPagina(1);
                setStatus(e.target.value as StatusEstoque | "");
              }}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="NORMAL">Normal</option>
              <option value="BAIXO">Baixo</option>
              <option value="ZERADO">Zerado</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-slate-100 text-slate-700 text-sm px-4 py-2 rounded-md hover:bg-slate-200"
          >
            Filtrar
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {erro && <p className="text-red-600 text-sm p-4">{erro}</p>}
        {carregando ? (
          <p className="text-slate-400 text-sm p-4">Carregando...</p>
        ) : itens.length === 0 ? (
          <p className="text-slate-400 text-sm p-4">Nenhum item encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                {ehPeca ? (
                  <>
                    <th className="px-4 py-3 font-medium">Modelo</th>
                    <th className="px-4 py-3 font-medium">Cor</th>
                  </>
                ) : (
                  <th className="px-4 py-3 font-medium">Nome</th>
                )}
                <th className="px-4 py-3 font-medium text-right">Quantidade</th>
                <th className="px-4 py-3 font-medium text-right">Estoque mínimo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  {ehPeca ? (
                    <>
                      <td className="px-4 py-3 text-slate-700">{p.modelo?.nome}</td>
                      <td className="px-4 py-3 text-slate-700">{p.cor?.nome}</td>
                    </>
                  ) : (
                    <td className="px-4 py-3 text-slate-700">{p.nome}</td>
                  )}
                  <td className="px-4 py-3 text-right text-slate-700">{p.quantidade}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{p.estoque_minimo}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setProdutoSelecionado(p);
                          setModalMovimentacao("ENTRADA");
                        }}
                        className="text-green-700 hover:underline text-xs"
                      >
                        Entrada
                      </button>
                      <button
                        onClick={() => {
                          setProdutoSelecionado(p);
                          setModalMovimentacao("SAIDA");
                        }}
                        className="text-red-700 hover:underline text-xs"
                      >
                        Saída
                      </button>
                      <button
                        onClick={() => {
                          setProdutoSelecionado(p);
                          setModalMovimentacao("AJUSTE");
                        }}
                        className="text-slate-600 hover:underline text-xs"
                      >
                        Ajustar
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setModalEditar(p)}
                            className="text-blue-700 hover:underline text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setModalExcluir(p)}
                            className="text-red-800 hover:underline text-xs"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
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
            Página {pagina} de {totalPaginas} — {total} itens
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

      {produtoSelecionado && modalMovimentacao && (
        <ModalMovimentacao
          produto={produtoSelecionado}
          tipo={modalMovimentacao}
          isAdmin={isAdmin}
          onFechar={() => {
            setModalMovimentacao(null);
            setProdutoSelecionado(null);
          }}
          onSucesso={() => {
            setModalMovimentacao(null);
            setProdutoSelecionado(null);
            carregar();
          }}
        />
      )}

      {modalNovoItem && (
        <ModalNovoItem
          tipoEstoque={tipoEstoque}
          ehPeca={ehPeca}
          rotuloItem={rotuloItem}
          modelos={modelos}
          cores={cores}
          onFechar={() => setModalNovoItem(false)}
          onSucesso={() => {
            setModalNovoItem(false);
            carregar();
          }}
        />
      )}

      {modalEditar && (
        <ModalEditarItem
          produto={modalEditar}
          ehPeca={ehPeca}
          modelos={modelos}
          cores={cores}
          onFechar={() => setModalEditar(null)}
          onSucesso={() => {
            setModalEditar(null);
            carregar();
          }}
        />
      )}

      {modalExcluir && (
        <Modal aberto titulo="Confirmar exclusão" onFechar={() => setModalExcluir(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Tem certeza que deseja excluir{" "}
              <span className="font-medium">
                {ehPeca ? `${modalExcluir.modelo?.nome} — ${modalExcluir.cor?.nome}` : modalExcluir.nome}
              </span>
              ?
            </p>
            <p className="text-xs text-slate-500">
              Se este item já tiver movimentações registradas, ele será apenas desativado (o
              histórico é preservado). Se nunca teve movimentação, será removido definitivamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalExcluir(null)}
                className="flex-1 border border-slate-300 rounded-md py-2 text-sm hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="flex-1 bg-red-700 text-white rounded-md py-2 text-sm font-medium hover:bg-red-800"
              >
                Excluir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ModalMovimentacao({
  produto,
  tipo,
  isAdmin,
  onFechar,
  onSucesso,
}: {
  produto: Produto;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
  isAdmin: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}) {
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [forcar, setForcar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const titulos = { ENTRADA: "Registrar entrada", SAIDA: "Registrar saída", AJUSTE: "Ajustar estoque" };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (tipo === "AJUSTE") {
        await movimentacaoService.ajustar({
          produto_id: produto.id,
          quantidade_correta: Number(quantidade),
          motivo: motivo || undefined,
          observacao: observacao || undefined,
        });
      } else {
        await movimentacaoService.registrar({
          produto_id: produto.id,
          tipo_movimentacao: tipo,
          quantidade: Number(quantidade),
          motivo: motivo || undefined,
          observacao: observacao || undefined,
          forcar,
        });
      }
      onSucesso();
    } catch (err: any) {
      setErro(err?.response?.data?.detail ?? "Não foi possível registrar a movimentação.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto titulo={titulos[tipo]} onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          {produto.descricao} · estoque atual: <span className="font-medium">{produto.quantidade}</span>
        </p>

        {erro && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-600 mb-1">
            {tipo === "AJUSTE" ? "Quantidade correta" : "Quantidade"}
          </label>
          <input
            type="number"
            min={0}
            required
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Motivo</label>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Observação</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {tipo === "SAIDA" && isAdmin && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={forcar} onChange={(e) => setForcar(e.target.checked)} />
            Autorizar saída mesmo maior que o estoque disponível
          </label>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {enviando ? "Salvando..." : "Confirmar"}
        </button>
      </form>
    </Modal>
  );
}

function ModalNovoItem({
  tipoEstoque,
  ehPeca,
  rotuloItem,
  modelos,
  cores,
  onFechar,
  onSucesso,
}: {
  tipoEstoque: TipoEstoque;
  ehPeca: boolean;
  rotuloItem: string;
  modelos: Modelo[];
  cores: Cor[];
  onFechar: () => void;
  onSucesso: () => void;
}) {
  const [modeloId, setModeloId] = useState("");
  const [corId, setCorId] = useState("");
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("0");
  const [estoqueMinimo, setEstoqueMinimo] = useState("0");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await estoqueService.criar({
        tipo_estoque: tipoEstoque,
        modelo_id: ehPeca ? Number(modeloId) : undefined,
        cor_id: ehPeca ? Number(corId) : undefined,
        nome: ehPeca ? undefined : nome,
        quantidade: Number(quantidade),
        estoque_minimo: Number(estoqueMinimo),
      });
      onSucesso();
    } catch (err: any) {
      setErro(err?.response?.data?.detail ?? "Não foi possível cadastrar este item.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto titulo={`Nova ${rotuloItem}`} onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {erro}
          </div>
        )}

        {ehPeca ? (
          <>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Modelo</label>
              <select
                required
                value={modeloId}
                onChange={(e) => setModeloId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Cor</label>
              <select
                required
                value={corId}
                onChange={(e) => setCorId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {cores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-slate-600 mb-1">Nome</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Caixa Grande"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Quantidade inicial</label>
            <input
              type="number"
              min={0}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Estoque mínimo</label>
            <input
              type="number"
              min={0}
              value={estoqueMinimo}
              onChange={(e) => setEstoqueMinimo(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {enviando ? "Salvando..." : "Cadastrar"}
        </button>
      </form>
    </Modal>
  );
}

function ModalEditarItem({
  produto,
  ehPeca,
  modelos,
  cores,
  onFechar,
  onSucesso,
}: {
  produto: Produto;
  ehPeca: boolean;
  modelos: Modelo[];
  cores: Cor[];
  onFechar: () => void;
  onSucesso: () => void;
}) {
  const [modeloId, setModeloId] = useState(String(produto.modelo?.id ?? ""));
  const [corId, setCorId] = useState(String(produto.cor?.id ?? ""));
  const [nome, setNome] = useState(produto.nome ?? "");
  const [estoqueMinimo, setEstoqueMinimo] = useState(String(produto.estoque_minimo));
  const [ativo, setAtivo] = useState(produto.ativo);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await estoqueService.atualizar(produto.id, {
        modelo_id: ehPeca ? Number(modeloId) : undefined,
        cor_id: ehPeca ? Number(corId) : undefined,
        nome: ehPeca ? undefined : nome,
        estoque_minimo: Number(estoqueMinimo),
        ativo,
      });
      onSucesso();
    } catch (err: any) {
      setErro(err?.response?.data?.detail ?? "Não foi possível salvar as alterações.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto titulo="Editar cadastro" onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {erro}
          </div>
        )}

        <p className="text-xs text-slate-500">
          A quantidade atual ({produto.quantidade} un.) não é editada aqui — use os botões de
          Entrada, Saída ou Ajustar na tabela para isso.
        </p>

        {ehPeca ? (
          <>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Modelo</label>
              <select
                required
                value={modeloId}
                onChange={(e) => setModeloId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Cor</label>
              <select
                required
                value={corId}
                onChange={(e) => setCorId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              >
                {cores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm text-slate-600 mb-1">Nome</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-600 mb-1">Estoque mínimo</label>
          <input
            type="number"
            min={0}
            value={estoqueMinimo}
            onChange={(e) => setEstoqueMinimo(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Ativo (desmarque para ocultar do estoque sem apagar o histórico)
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {enviando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </Modal>
  );
}
