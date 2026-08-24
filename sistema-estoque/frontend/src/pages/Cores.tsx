import { useEffect, useState, type FormEvent } from "react";
import { Plus, Search } from "lucide-react";
import { corService } from "@/services/corService";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import type { Cor } from "@/types";

export default function Cores() {
  const { isAdmin } = useAuth();
  const [cores, setCores] = useState<Cor[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Cor | null>(null);

  function carregar() {
    setCarregando(true);
    corService
      .listar(busca || undefined)
      .then(setCores)
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleBuscar(e: FormEvent) {
    e.preventDefault();
    carregar();
  }

  async function alternarAtivo(cor: Cor) {
    await corService.atualizar(cor.id, { ativo: !cor.ativo });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Cores</h1>
        {isAdmin && (
          <button
            onClick={() => {
              setEditando(null);
              setModalAberto(true);
            }}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 w-fit"
          >
            <Plus size={16} /> Nova cor
          </button>
        )}
      </div>

      <form onSubmit={handleBuscar} className="max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar cor..."
            className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm bg-white"
          />
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {carregando ? (
          <p className="text-slate-400 text-sm p-4">Carregando...</p>
        ) : cores.length === 0 ? (
          <p className="text-slate-400 text-sm p-4">Nenhuma cor cadastrada.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Cor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {cores.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-700">{c.nome}</td>
                  <td className="px-4 py-3">
                    {c.codigo_hex ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: c.codigo_hex }}
                        />
                        <span className="text-slate-500 text-xs">{c.codigo_hex}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        c.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditando(c);
                            setModalAberto(true);
                          }}
                          className="text-slate-600 hover:underline text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => alternarAtivo(c)}
                          className="text-slate-600 hover:underline text-xs"
                        >
                          {c.ativo ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <ModalCor
          cor={editando}
          onFechar={() => setModalAberto(false)}
          onSucesso={() => {
            setModalAberto(false);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function ModalCor({
  cor,
  onFechar,
  onSucesso,
}: {
  cor: Cor | null;
  onFechar: () => void;
  onSucesso: () => void;
}) {
  const [nome, setNome] = useState(cor?.nome ?? "");
  const [codigoHex, setCodigoHex] = useState(cor?.codigo_hex ?? "#000000");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (cor) {
        await corService.atualizar(cor.id, { nome, codigo_hex: codigoHex });
      } else {
        await corService.criar({ nome, codigo_hex: codigoHex });
      }
      onSucesso();
    } catch (err: any) {
      setErro(err?.response?.data?.detail ?? "Não foi possível salvar a cor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto titulo={cor ? "Editar cor" : "Nova cor"} onFechar={onFechar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {erro}
          </div>
        )}
        <div>
          <label className="block text-sm text-slate-600 mb-1">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Código hexadecimal</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={codigoHex}
              onChange={(e) => setCodigoHex(e.target.value)}
              className="w-10 h-10 border border-slate-300 rounded cursor-pointer"
            />
            <input
              value={codigoHex}
              onChange={(e) => setCodigoHex(e.target.value)}
              className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {enviando ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </Modal>
  );
}
