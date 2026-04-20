import { InventoryDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Laptop, BatteryCharging, Cable, Network, Box } from "lucide-react";
import { toast } from "sonner";

const categoryIcons = {
  "Notebook": Laptop,
  "Fonte/Carregador": BatteryCharging,
  "Cabo HDMI": Cable,
  "Cabo de Rede": Network,
  "Outro": Box,
};

const statusConfig = {
  disponivel: { label: "Disponível", className: "bg-green-100 text-green-700" },
  em_uso: { label: "Em Uso", className: "bg-blue-100 text-blue-700" },
  manutencao: { label: "Manutenção", className: "bg-amber-100 text-amber-700" },
  inativo: { label: "Inativo", className: "bg-gray-100 text-gray-500" },
};

const userTypeLabels = {
  aluno: "Aluno",
  professor: "Professor",
  estagiario: "Estagiário",
  jovem_aprendiz: "Jovem Aprendiz",
  funcionario: "Funcionário",
};

export default function InventoryList({ items, onEdit, onRefresh }) {
  const handleDelete = async (item) => {
    if (!confirm(`Excluir "${item.name}"?`)) return;
    await InventoryDB.delete(item.id);
    toast.success("Item removido!");
    onRefresh();
  };

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
        Nenhum item no estoque ainda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = categoryIcons[item.category] || Box;
        const status = statusConfig[item.status] || statusConfig.disponivel;
        return (
          <div key={item.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.category}{item.brand ? ` — ${item.brand}` : ""}</p>
                  {item.serial_number && <p className="text-xs text-muted-foreground">Nº {item.serial_number}</p>}
                  {item.category === "Cabo de Rede" && item.cable_length_m && (
                    <p className="text-xs text-muted-foreground">{item.cable_length_m}m</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(item)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className={status.className}>{status.label}</Badge>
              {item.status === "em_uso" && item.current_user && (
                <span className="text-xs text-muted-foreground">
                  👤 {item.current_user}
                  {item.user_type ? ` (${userTypeLabels[item.user_type] || item.user_type})` : ""}
                </span>
              )}
              {item.notes && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{item.notes}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}