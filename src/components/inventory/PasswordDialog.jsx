import { useEffect, useState } from "react";
import { PasswordsDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { system_name: "", username: "", password: "", url: "", notes: "" };

export default function PasswordDialog({ password, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(password ? { ...emptyForm, ...password } : emptyForm);
  }, [password]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.system_name || !form.username || !form.password) {
      toast.error("Preencha os campos obrigatorios");
      return;
    }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{password ? "Editar Senha" : "Nova Senha de Acesso"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Sistema / Aplicativo *</Label>
            <Input placeholder="Ex: Google Admin, Totvs..." value={form.system_name} onChange={(event) => set("system_name", event.target.value)} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Usuario / Login *</Label>
              <Input placeholder="usuario@email.com" value={form.username} onChange={(event) => set("username", event.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label>Senha *</Label>
              <Input type="text" placeholder="********" value={form.password} onChange={(event) => set("password", event.target.value)} className="rounded-xl font-mono" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>URL / Endereco</Label>
            <Input placeholder="https://..." value={form.url} onChange={(event) => set("url", event.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label>Observacoes</Label>
            <Textarea placeholder="Notas adicionais..." value={form.notes} onChange={(event) => set("notes", event.target.value)} className="rounded-xl resize-none" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : password ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
