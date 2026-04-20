import { useState, useEffect } from "react";
import { TasksDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Circle, Trash2, Plus, CalendarDays, User, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import "moment/locale/pt-br";
moment.locale("pt-br");

const emptyForm = { title: "", assigned_to: "", due_date: "", notes: "", status: "pendente" };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("todas");

  const fetchTasks = async () => {
    const data = await TasksDB.list();
    setTasks(data);
  };

  useEffect(() => { fetchTasks(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.due_date) { toast.error("Título e data são obrigatórios"); return; }
    setLoading(true);
    await TasksDB.create(form);
    toast.success("Tarefa criada!");
    setLoading(false);
    setForm(emptyForm);
    setOpen(false);
    fetchTasks();
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "pendente" ? "feito" : "pendente";
    await TasksDB.update(task.id, { status: newStatus });
    toast.success(newStatus === "feito" ? "Tarefa concluída!" : "Tarefa reaberta!");
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await TasksDB.delete(id);
    toast.success("Tarefa excluída!");
    fetchTasks();
  };

  const today = moment().format("YYYY-MM-DD");

  const filtered = tasks.filter((t) => {
    if (filter === "pendente") return t.status === "pendente";
    if (filter === "feito") return t.status === "feito";
    if (filter === "atrasada") return t.status === "pendente" && t.due_date < today;
    return true;
  });

  const pendentes = tasks.filter((t) => t.status === "pendente").length;
  const atrasadas = tasks.filter((t) => t.status === "pendente" && t.due_date < today).length;
  const feitas = tasks.filter((t) => t.status === "feito").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Tarefas
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{pendentes} pendente{pendentes !== 1 ? "s" : ""} · {atrasadas} atrasada{atrasadas !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 rounded-xl h-11 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pendentes", value: pendentes, color: "bg-amber-100 text-amber-700", key: "pendente" },
          { label: "Atrasadas", value: atrasadas, color: "bg-red-100 text-red-700", key: "atrasada" },
          { label: "Concluídas", value: feitas, color: "bg-green-100 text-green-700", key: "feito" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? "todas" : s.key)}
            className={`rounded-2xl border p-4 text-left transition-all ${filter === s.key ? "ring-2 ring-primary border-primary" : "border-border bg-card hover:bg-accent"}`}
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap">
        {["todas", "pendente", "atrasada", "feito"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
          >
            {f === "todas" ? "Todas" : f === "pendente" ? "Pendentes" : f === "atrasada" ? "Atrasadas" : "Concluídas"}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhuma tarefa encontrada</p>
          </div>
        ) : (
          filtered.map((task) => {
            const isAtrasada = task.status === "pendente" && task.due_date < today;
            const isFeita = task.status === "feito";
            return (
              <div key={task.id} className={`bg-card rounded-2xl border p-4 flex items-start gap-3 transition-all ${isAtrasada ? "border-red-200 bg-red-50/40" : isFeita ? "border-green-200 bg-green-50/30 opacity-70" : "border-border"}`}>
                <button onClick={() => toggleStatus(task)} className="mt-0.5 flex-shrink-0">
                  {isFeita
                    ? <CheckCircle2 className="h-6 w-6 text-green-500" />
                    : <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isFeita ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {task.assigned_to && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> {task.assigned_to}
                      </span>
                    )}
                    <span className={`text-xs flex items-center gap-1 font-medium ${isAtrasada ? "text-red-600" : "text-muted-foreground"}`}>
                      <CalendarDays className="h-3 w-3" />
                      {moment(task.due_date).format("DD/MM/YYYY")}
                      {isAtrasada && " · Atrasada"}
                    </span>
                  </div>
                  {task.notes && <p className="text-xs text-muted-foreground mt-1 italic">{task.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className={`text-xs ${isFeita ? "text-green-600 border-green-300" : isAtrasada ? "text-red-600 border-red-300" : "text-amber-600 border-amber-300"}`}>
                    {isFeita ? "Feito" : isAtrasada ? "Atrasada" : "Pendente"}
                  </Badge>
                  <button onClick={() => handleDelete(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Tarefa *</Label>
              <Input placeholder="O que precisa ser feito?" value={form.title} onChange={(e) => set("title", e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Responsável</Label>
                <Input placeholder="Nome da pessoa" value={form.assigned_to} onChange={(e) => set("assigned_to", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Data Limite *</Label>
                <Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observações</Label>
              <Textarea placeholder="Detalhes adicionais..." value={form.notes} onChange={(e) => set("notes", e.target.value)} className="rounded-xl resize-none" rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button type="submit" disabled={loading} className="rounded-xl">Criar Tarefa</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}