import { useState } from "react";
import { PasswordsDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff, ExternalLink, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function PasswordList({ passwords, onEdit, onRefresh }) {
  const [visibleIds, setVisibleIds] = useState(new Set());

  const toggleVisibility = (id) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async (p) => {
    if (!confirm(`Excluir senha de "${p.system_name}"?`)) return;
    await PasswordsDB.delete(p.id);
    toast.success("Senha removida!");
    onRefresh();
  };

  if (passwords.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
        Nenhuma senha cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {passwords.map((p) => {
        const visible = visibleIds.has(p.id);
        return (
          <div key={p.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.system_name}</p>
                  <p className="text-sm text-muted-foreground">Usuário: {p.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono text-foreground">
                      {visible ? p.password : "••••••••"}
                    </span>
                    <button onClick={() => toggleVisibility(p.id)} className="text-muted-foreground hover:text-foreground">
                      {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {p.url && (
                  <a href={p.url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5" /></Button>
                  </a>
                )}
                <Button size="sm" variant="ghost" onClick={() => onEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(p)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            {p.notes && <p className="mt-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5">{p.notes}</p>}
          </div>
        );
      })}
    </div>
  );
}