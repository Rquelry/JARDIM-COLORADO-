import { useEffect, useState } from "react";
import { InventoryDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  category: "",
  brand: "",
  serial_number: "",
  asset_tag: "",
  cart: "",
  cable_length_m: "",
  status: "disponivel",
  current_user: "",
  user_type: "",
  notes: "",
};

export default function InventoryDialog({ item, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const isNotebook = form.category === "Notebook";

  useEffect(() => {
    setForm(item ? { ...emptyForm, ...item } : emptyForm);
  }, [item]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.category) {
      toast.error("Nome e categoria sao obrigatorios");
      return;
    }

    setLoading(true);
    if (item) {
      await InventoryDB.update(item.id, form);
      toast.success("Item atualizado!");
    } else {
      await InventoryDB.create(form);
      toast.success("Item adicionado ao estoque!");
    }
    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{item ? "Editar Item" : "Novo Item no Estoque"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Nome do Equipamento *</Label>
            <Input placeholder="Ex: Notebook Positivo, Fonte Dell..." value={form.name} onChange={(event) => set("name", event.target.value)} className="rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Categoria *</Label>
              <select value={form.category} onChange={(event) => set("category", event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Selecione</option>
                <option value="Notebook">Notebook</option>
                <option value="Fonte/Carregador">Fonte/Carregador</option>
                <option value="Cabo de Rede">Cabo de Rede</option>
                <option value="Cabo HDMI">Cabo HDMI</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Marca</Label>
              <Input placeholder="Dell, Positivo..." value={form.brand} onChange={(event) => set("brand", event.target.value)} className="rounded-xl" />
            </div>
          </div>

          {form.category === "Cabo de Rede" && (
            <div className="space-y-1">
              <Label>Comprimento do Cabo (metros)</Label>
              <Input type="number" placeholder="Ex: 5, 10, 20..." value={form.cable_length_m} onChange={(event) => set("cable_length_m", event.target.value)} className="rounded-xl" min="0" step="0.5" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>{isNotebook ? "Numero de Serie" : "Serie"}</Label>
              <Input placeholder={isNotebook ? "Ex: SN123456" : "Ex: SER-001"} value={form.serial_number} onChange={(event) => set("serial_number", event.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label>Patrimonio</Label>
              <Input placeholder="Ex: PAT-001" value={form.asset_tag} onChange={(event) => set("asset_tag", event.target.value)} className="rounded-xl" />
            </div>
          </div>

          {isNotebook && (
            <div className="space-y-1">
              <Label>Carrinho</Label>
              <Input placeholder="Ex: Carrinho 01" value={form.cart} onChange={(event) => set("cart", event.target.value)} className="rounded-xl" />
            </div>
          )}

          <div className="space-y-1">
            <Label>Status</Label>
            <select value={form.status} onChange={(event) => set("status", event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
              <option value="disponivel">Disponivel</option>
              <option value="em_uso">Em uso</option>
              <option value="manutencao">Manutencao</option>
              <option value="inativo">Inativo</option>
              <option value="nao_encontrado">Nao encontrado</option>
            </select>
          </div>

          {form.status === "em_uso" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Quem esta usando</Label>
                <Input placeholder="Nome da pessoa" value={form.current_user} onChange={(event) => set("current_user", event.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <select value={form.user_type} onChange={(event) => set("user_type", event.target.value)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                  <option value="">Tipo</option>
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                  <option value="estagiario">Estagiario</option>
                  <option value="jovem_aprendiz">Jovem Aprendiz</option>
                  <option value="funcionario">Funcionario</option>
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label>Observacoes</Label>
            <Textarea placeholder="Alguma observacao..." value={form.notes} onChange={(event) => set("notes", event.target.value)} className="rounded-xl resize-none" rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : item ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
