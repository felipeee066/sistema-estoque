import type { StatusEstoque } from "@/types";

const estilos: Record<StatusEstoque, string> = {
  NORMAL: "bg-green-100 text-green-700",
  BAIXO: "bg-yellow-100 text-yellow-700",
  ZERADO: "bg-red-100 text-red-700",
};

const rotulos: Record<StatusEstoque, string> = {
  NORMAL: "Normal",
  BAIXO: "Baixo",
  ZERADO: "Zerado",
};

export function StatusBadge({ status }: { status: StatusEstoque }) {
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${estilos[status]}`}>
      {rotulos[status]}
    </span>
  );
}
