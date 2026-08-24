import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { usuarioService } from "@/services/usuarioService";
import { Modal } from "@/components/Modal";
import type { PerfilUsuario, Usuario } from "@/types";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  function carregar() {
    setCarregando(true);
    usuarioService
      .listar()
      .then(setUsuarios)
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alternarAtivo(usuario: Usuario) {
    await usuarioService.atualizar(usuario.id, { ativo: !usuario.ativo });
    carregar();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Usuários</h1>
        <button
          onClick={() => {
            setEditando(null);
            setModalAberto(true);
          }}
          className="flex items-center gap-2 bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-800 w-fit"
        >
          <Plus size={16} /> Novo usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        {carregando ? (
          <p className="text-slate-400 text-sm p-4">Carregando...</p>
        ) : usuarios.length === 0 ? (
          <p className="text-slate-400 text-sm p-4">Nenhum usuário cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-700">{u.nome}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      {u.perfil === "ADMINISTRADOR" ? "Administrador" : "Operador"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setEditando(u);
                          setModalAberto(true);
                        }}
                        className="text-slate-600 hover:underline text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => alternarAtivo(u)}
                        className="text-slate-600 hover:underline text-xs"
                      >
                        {u.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <ModalUsuario
          usuario={editando}
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

function ModalUsuario({
  usuario,
  onFechar,
  onSucesso,
}: {
  usuario: Usuario | null;
  onFechar: () => void;
  onSucesso: () => void;
}) {
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<PerfilUsuario>(usuario?.perfil ?? "OPERADOR");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (usuario) {
        await usuarioService.atualizar(usuario.id, {
          nome,
          perfil,
          ...(senha ? { senha } : {}),
        });
      } else {
        await usuarioService.criar({ nome, email, senha, perfil });
      }
      onSucesso();
    } catch (err: any) {
      setErro(err?.response?.data?.detail ?? "Não foi possível salvar o usuário.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal aberto titulo={usuario ? "Editar usuário" : "Novo usuário"} onFechar={onFechar}>
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
          <label className="block text-sm text-slate-600 mb-1">E-mail</label>
          <input
            type="email"
            required
            disabled={!!usuario}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">
            {usuario ? "Nova senha (deixe em branco para manter)" : "Senha"}
          </label>
          <input
            type="password"
            required={!usuario}
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Perfil</label>
          <select
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="OPERADOR">Operador</option>
            <option value="ADMINISTRADOR">Administrador</option>
          </select>
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
