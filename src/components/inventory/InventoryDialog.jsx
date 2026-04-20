import { useState, useEffect } from "react";
import { InventoryDB } from "@/lib/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", category: "", brand: "", serial_number: "", cable_length_m: "", status: "disponivel", current_user: "", user_type: "", notes: "" };

export default function InventoryDialog({ open, item, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(item ? { ...emptyForm, ...item } : emptyForm);
  }, [item, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) { toast.error("Nome e categoria são obrigatórios"); return; }
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Item" : "Novo Item no Estoque"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Nome do Equipamento *</Label>
            <Input placeholder="Ex: Notebook Positivo, Fonte Dell..." value={form.name} onChange={(e) => set("name", e.target.value)} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {["Notebook", "Fonte/Carregador", "Cabo de Rede", "Cabo HDMI", "Outro"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Marca</Label>
              <Input placeholder="Dell, Positivo..." value={form.brand} onChange={(e) => set("brand", e.target.value)} className="rounded-xl" />
            </div>
          </div>
          {form.category === "Cabo de Rede" && (
            <div className="space-y-1">
              <Label>Comprimento do Cabo (metros)</Label>
              <Input type="number" placeholder="Ex: 5, 10, 20..." value={form.cable_length_m} onChange={(e) => set("cable_length_m", e.target.value)} className="rounded-xl" min="0" step="0.5" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nº Série / Patrimônio</Label>
              <Input placeholder="NB-001" value={form.serial_number} onChange={(e) => set("serial_number", e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.status === "em_uso" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Quem está usando</Label>
                <Input placeholder="Nome da pessoa" value={form.current_user} onChange={(e) => set("current_user", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.user_type} onValueChange={(v) => set("user_type", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluno">Aluno</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="estagiario">Estagiário</SelectItem>
                    <SelectItem value="jovem_aprendiz">Jovem Aprendiz</SelectItem>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <Label>Observações</Label>
            <Textarea placeholder="Alguma observação..." value={form.notes} onChange={(e) => set("notes", e.target.value)} className="rounded-xl resize-none" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (item ? "Salvar" : "Adicionar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}