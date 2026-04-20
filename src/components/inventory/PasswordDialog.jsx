import { useState, useEffect } from "react";
import { PasswordsDB } from "@/lib/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { system_name: "", username: "", password: "", url: "", notes: "" };

export default function PasswordDialog({ open, password, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(password ? { ...emptyForm, ...password } : emptyForm);
  }, [password, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.system_name || !form.username || !form.password) { toast.error("Preencha os campos obrigatórios"); return; }
    setLoading(true);
    if (password) {
      await PasswordsDB.update(password.id, form);
      toast.success("Senha atualizada!");
    } else {
      await PasswordsDB.create(form);
      toast.success("Senha salva!");
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
          <DialogTitle>{password ? "Editar Senha" : "Nova Senha de Acesso"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Sistema / Aplicativo *</Label>
            <Input placeholder="Ex: Google Admin, Totvs..." value={form.system_name} onChange={(e) => set("system_name", e.target.value)} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Usuário / Login *</Label>
              <Input placeholder="usuario@email.com" value={form.username} onChange={(e) => set("username", e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label>Senha *</Label>
              <Input type="text" placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} className="rounded-xl font-mono" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>URL / Endereço</Label>
            <Input placeholder="https://..." value={form.url} onChange={(e) => set("url", e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label>Observações</Label>
            <Textarea placeholder="Notas adicionais..." value={form.notes} onChange={(e) => set("notes", e.target.value)} className="rounded-xl resize-none" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (password ? "Salvar" : "Adicionar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}