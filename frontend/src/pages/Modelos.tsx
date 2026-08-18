import { useEffect, useState, type FormEvent } from "react";
import { Plus, Search } from "lucide-react";
import { modeloService } from "@/services/modeloService";
import { Modal } from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import type { Modelo } from "@/types";

export default function Modelos() {
  const { isAdmin } = useAuth();
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Modelo | null>(null);

  function carregar() {
    setCarregando(true);
    modeloService
      .listar(busca || undefined)
      .then(setModelos)
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

  async function alternarAtivo(modelo: Modelo) {
    await modeloService.atualizar(modelo.id, { ativo: !modelo.ativo });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Modelos</h1>
        {isAdmin && (
          <button
            onClick={() => {
              setEditando(null);
              setModalAberto(true);
            }}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 w-fit"
          >
            <Plus size={16} /> Novo modelo
          </button>
        )}
      </div>

      <form onSubmit={handleBuscar} className="max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar modelo..."
            className="w-full border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm bg-white"
          />
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {carregando ? (
          <p className="text-slate-400 text-sm p-4">Carregando...</p>
        ) : modelos.length === 0 ? (
          <p className="text-slate-400 text-sm p-4">Nenhum modelo cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {modelos.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-700">{m.nome}</td>
                  <td className="px-4 py-3 text-slate-500">{m.descricao || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        m.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditando(m);
                            setModalAberto(true);
                          }}
                          className="text-slate-600 hover:underline text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => alternarAtivo(m)}
                          className="text-slate-600 hover:underline text-xs"
                        >
                          {m.ativo ? "Desativar" : "Ativar"}
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
        <ModalModelo
          modelo={editando}
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

function ModalModelo({
  modelo,
  onFechar,
  onSucesso,
}: {
  modelo: Modelo | null;
  onFechar: () => void;
  onSucesso: () => void;
}) {
  const [nome, setNome] = useState(modelo?.nome ?? "");
  const [descricao, setDescricao] = useState(modelo?.descricao ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (modelo) {
        await modeloService.atualizar(modelo.id, { nome, descricao });
      } else {
        await modeloService.criar({ nome, descricao: descricao || undefined });
      }
      onSucesso();
    } catch (err: any) {
      setErro(err?.response?.data?.detail ?? "Não foi possível salvar o modelo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto titulo={modelo ? "Editar modelo" : "Novo modelo"} onFechar={onFechar}>
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
          <label className="block text-sm text-slate-600 mb-1">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
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
