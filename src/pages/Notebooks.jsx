import { useEffect, useMemo, useState } from "react";
import { Laptop, Loader2, PlusCircle, Pencil, Trash2, Search, ClipboardCheck, AlertTriangle } from "lucide-react";
import { NotebooksDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CsvImportButton from "@/components/CsvImportButton";
import { mapNotebooksCsv } from "@/lib/csv-mappers";
import { toast } from "sonner";

const defaultProblems = [
  { label: "Nao liga", checked: false, marked_at: null },
  { label: "Tela quebrada ou manchada", checked: false, marked_at: null },
  { label: "Teclado com falha", checked: false, marked_at: null },
  { label: "Touchpad com falha", checked: false, marked_at: null },
  { label: "Bateria com defeito", checked: false, marked_at: null },
  { label: "Carregador ausente ou defeituoso", checked: false, marked_at: null },
  { label: "Wi-Fi ou rede com falha", checked: false, marked_at: null },
  { label: "Sistema operacional com problema", checked: false, marked_at: null },
];

const peopleOptions = [
  "MARCOS ANTONIO DIAS DA SILVA",
  "PEDRO HENRIQUE DE JESUS SOUSA",
  "RAQUELRY SILVA DA FONSECA",
  "IAN KAIQUE BRITO FREITAS",
];

const defaultCartOptions = ["01", "02", "03", "04", "05", "06"].map(
  (number) => `Carrinho ${number}`,
);

const getTodayDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const emptyForm = {
  name: "",
  model: "",
  serial_number: "",
  asset_tag: "",
  cart: "",
  current_location: "",
  responsible: "",
  status: "disponivel",
  notes: "",
  problems: defaultProblems,
  presence_checklists: [],
};

const emptyPresence = {
  date: getTodayDate(),
  in_unit: true,
  checked_by: "",
  notes: "",
};

const statusConfig = {
  disponivel: { label: "Disponivel", className: "bg-green-100 text-green-700" },
  em_uso: { label: "Em uso", className: "bg-blue-100 text-blue-700" },
  manutencao: { label: "Manutencao", className: "bg-amber-100 text-amber-700" },
  inativo: { label: "Inativo", className: "bg-gray-100 text-gray-600" },
  nao_encontrado: { label: "Nao encontrado", className: "bg-red-100 text-red-700" },
};

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const formatDate = (value) => {
  if (!value) return "-";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

const normalizeProblems = (problems) =>
  defaultProblems.map((defaultProblem) => {
    const existing = Array.isArray(problems)
      ? problems.find((problem) => problem.label === defaultProblem.label)
      : null;
    return existing || defaultProblem;
  });

const activeProblems = (notebook) =>
  Array.isArray(notebook.problems)
    ? notebook.problems.filter((problem) => problem.checked)
    : [];

export default function Notebooks() {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
  const [cartFilter, setCartFilter] = useState("todos");
  const [responsibleFilter, setResponsibleFilter] = useState("todos");
  const [form, setForm] = useState(emptyForm);
  const [presence, setPresence] = useState(emptyPresence);

  const fetchNotebooks = async () => {
    const data = await NotebooksDB.list("model", 2000);
    setNotebooks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const locations = useMemo(
    () => [...new Set(notebooks.map((notebook) => notebook.current_location).filter(Boolean))].sort(),
    [notebooks],
  );

  const responsibles = useMemo(
    () => [...new Set(notebooks.map((notebook) => notebook.responsible).filter(Boolean))].sort(),
    [notebooks],
  );

  const carts = useMemo(
    () => [...new Set([
      ...defaultCartOptions,
      ...notebooks.map((notebook) => notebook.cart).filter(Boolean),
    ])].sort(),
    [notebooks],
  );

  const filtered = useMemo(() => {
    const term = normalize(search);

    return notebooks.filter((notebook) => {
      const matchesSearch = !term || [
        notebook.name,
        notebook.model,
        notebook.serial_number,
        notebook.asset_tag,
        notebook.cart,
        notebook.current_location,
        notebook.responsible,
      ].some((value) => normalize(value).includes(term));
      const matchesStatus = statusFilter === "todos" || notebook.status === statusFilter;
      const matchesLocation = locationFilter === "todos" || notebook.current_location === locationFilter;
      const matchesCart = cartFilter === "todos" || notebook.cart === cartFilter;
      const matchesResponsible = responsibleFilter === "todos" || notebook.responsible === responsibleFilter;

      return matchesSearch && matchesStatus && matchesLocation && matchesCart && matchesResponsible;
    });
  }, [notebooks, search, statusFilter, locationFilter, cartFilter, responsibleFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, problems: normalizeProblems([]), presence_checklists: [] });
    setPresence({ ...emptyPresence, date: getTodayDate() });
    setOpen(true);
  };

  const openEdit = (notebook) => {
    setEditing(notebook);
    setForm({
      ...emptyForm,
      ...notebook,
      problems: normalizeProblems(notebook.problems),
      presence_checklists: Array.isArray(notebook.presence_checklists)
        ? notebook.presence_checklists
        : [],
    });
    setPresence({ ...emptyPresence, date: getTodayDate() });
    setOpen(true);
  };

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleProblem = (index) => {
    setForm((current) => ({
      ...current,
      problems: current.problems.map((problem, problemIndex) => {
        if (problemIndex !== index) return problem;
        const checked = !problem.checked;
        return {
          ...problem,
          checked,
          marked_at: checked ? problem.marked_at || getTodayDate() : null,
        };
      }),
    }));
  };

  const addPresenceChecklist = () => {
    setForm((current) => ({
      ...current,
      presence_checklists: [
        {
          ...presence,
          created_at: new Date().toISOString(),
        },
        ...current.presence_checklists,
      ],
    }));
    setPresence({ ...emptyPresence, date: getTodayDate() });
  };

  const latestPresence = (notebook) => {
    const checks = Array.isArray(notebook.presence_checklists)
      ? notebook.presence_checklists
      : [];
    return [...checks].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.model.trim() || !form.serial_number.trim()) {
      toast.error("Modelo e serial number sao obrigatorios.");
      return;
    }

    setSaving(true);
    if (editing) {
      await NotebooksDB.update(editing.id, form);
      toast.success("Notebook atualizado e estoque sincronizado.");
    } else {
      await NotebooksDB.create(form);
      toast.success("Notebook cadastrado e enviado para o estoque.");
    }
    setSaving(false);
    setOpen(false);
    fetchNotebooks();
  };

  const handleDelete = async (notebook) => {
    if (!confirm(`Excluir o notebook ${notebook.name || notebook.model}?`)) return;
    await NotebooksDB.delete(notebook.id);
    toast.success("Notebook removido do controle e do estoque.");
    fetchNotebooks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Laptop className="h-6 w-6 text-primary" />
            Controle de Notebooks
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {notebooks.length} notebook(s) cadastrados com sincronizacao no estoque
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <CsvImportButton
            label="Importar notebooks"
            transformRows={mapNotebooksCsv}
            onImport={(records) => NotebooksDB.createMany(records)}
            onImported={fetchNotebooks}
            className="h-11"
          />
          <Button onClick={openCreate} className="gap-2 rounded-xl h-11 shadow-lg shadow-primary/20">
            <PlusCircle className="h-4 w-4" />
            Adicionar Notebook
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,1fr)_160px_160px_160px_160px] gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, modelo, serial, patrimonio, carrinho, local ou responsavel"
            className="h-11 rounded-xl pl-10 bg-card"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            {Object.entries(statusConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos locais</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cartFilter} onValueChange={setCartFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Carrinhos</SelectItem>
            {carts.map((cart) => (
              <SelectItem key={cart} value={cart}>{cart}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Responsaveis</SelectItem>
            {responsibles.map((responsible) => (
              <SelectItem key={responsible} value={responsible}>{responsible}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left text-xs font-semibold uppercase text-muted-foreground px-4 py-3 w-[260px]">Notebook</th>
                <th className="text-left text-xs font-semibold uppercase text-muted-foreground px-4 py-3 w-[170px]">Identificacao</th>
                <th className="text-left text-xs font-semibold uppercase text-muted-foreground px-4 py-3 w-[210px]">Organizacao</th>
                <th className="text-left text-xs font-semibold uppercase text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold uppercase text-muted-foreground px-4 py-3 w-[220px]">Diagnostico</th>
                <th className="text-left text-xs font-semibold uppercase text-muted-foreground px-4 py-3 w-[130px]">Checklist</th>
                <th className="text-right text-xs font-semibold uppercase text-muted-foreground px-4 py-3 w-[100px]">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((notebook) => {
                const status = statusConfig[notebook.status] || statusConfig.disponivel;
                const latest = latestPresence(notebook);
                const problems = activeProblems(notebook);
                return (
                  <tr key={notebook.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm align-top">
                      <div className="font-semibold">{notebook.name || "Sem nome"}</div>
                      <div className="text-xs text-muted-foreground leading-snug break-words">
                        {notebook.model}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm align-top">
                      <div className="font-mono text-xs">{notebook.serial_number}</div>
                      <div className="text-xs text-muted-foreground">
                        Patrimonio: {notebook.asset_tag || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm align-top">
                      <div className="font-medium">{notebook.cart || "Sem carrinho"}</div>
                      <div className="text-xs text-muted-foreground">
                        Local: {notebook.current_location || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Resp.: {notebook.responsible || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={status.className}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm align-top">
                      {problems.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {problems.slice(0, 2).map((problem) => (
                            <Badge key={problem.label} className="bg-red-50 text-red-700 border border-red-100 font-normal">
                              {problem.label}
                            </Badge>
                          ))}
                          {problems.length > 2 && (
                            <Badge className="bg-muted text-muted-foreground font-normal">
                              +{problems.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <AlertTriangle className="h-4 w-4" />
                          Sem problemas
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm align-top">
                      {latest ? formatDate(latest.date) : "-"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(notebook)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(notebook)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">Nenhum notebook encontrado.</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Notebook" : "Adicionar Notebook"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="NOT.40" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Modelo *</Label>
                <Input value={form.model} onChange={(event) => set("model", event.target.value)} placeholder="Dell Latitude 3450" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Serial Number *</Label>
                <Input value={form.serial_number} onChange={(event) => set("serial_number", event.target.value)} placeholder="C5JHCD4" className="rounded-xl font-mono" />
              </div>
              <div className="space-y-1">
                <Label>Patrimonio</Label>
                <Input value={form.asset_tag} onChange={(event) => set("asset_tag", event.target.value)} placeholder="30087119" className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label>Carrinho</Label>
                <Input
                  list="notebook-cart-options"
                  value={form.cart}
                  onChange={(event) => set("cart", event.target.value)}
                  placeholder="Carrinho 01"
                  className="rounded-xl"
                />
                <datalist id="notebook-cart-options">
                  {carts.map((cart) => (
                    <option key={cart} value={cart} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => set("status", value)}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Local Atual</Label>
                <Input value={form.current_location} onChange={(event) => set("current_location", event.target.value)} placeholder="Laboratorio 1" className="rounded-xl" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Responsavel</Label>
                <Input value={form.responsible} onChange={(event) => set("responsible", event.target.value)} placeholder="Nome do responsavel" className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Diagnostico - possiveis problemas</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-border p-3">
                {form.problems.map((problem, index) => (
                  <label key={`${problem.label}-${index}`} className="flex items-start gap-2 text-sm">
                    <Checkbox checked={problem.checked} onCheckedChange={() => toggleProblem(index)} />
                    <span>
                      <span className="block">{problem.label}</span>
                      {problem.checked && problem.marked_at && (
                        <span className="block text-xs text-muted-foreground">
                          Marcado em {formatDate(problem.marked_at)}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Checklist de presenca na unidade</Label>
              <div className="rounded-xl border border-border p-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-[150px_160px_1fr] gap-3">
                  <Input type="date" value={presence.date} onChange={(event) => setPresence((current) => ({ ...current, date: event.target.value }))} className="rounded-xl" />
                  <Select value={presence.in_unit ? "sim" : "nao"} onValueChange={(value) => setPresence((current) => ({ ...current, in_unit: value === "sim" }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sim">Na unidade</SelectItem>
                      <SelectItem value="nao">Fora da unidade</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={presence.checked_by || "nao_informado"} onValueChange={(value) => setPresence((current) => ({ ...current, checked_by: value === "nao_informado" ? "" : value }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao_informado">Responsavel</SelectItem>
                      {peopleOptions.map((person) => (
                        <SelectItem key={person} value={person}>{person}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea value={presence.notes} onChange={(event) => setPresence((current) => ({ ...current, notes: event.target.value }))} placeholder="Observacoes do checklist" className="rounded-xl resize-none" rows={2} />
                <Button type="button" variant="outline" onClick={addPresenceChecklist} className="gap-2 rounded-xl">
                  <ClipboardCheck className="h-4 w-4" />
                  Registrar checklist
                </Button>
                {form.presence_checklists.length > 0 && (
                  <div className="divide-y divide-border rounded-xl border border-border">
                    {form.presence_checklists.map((check, index) => (
                      <div key={`${check.date}-${index}`} className="p-2 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span>
                          {formatDate(check.date)} - {check.in_unit ? "Na unidade" : "Fora da unidade"}
                          {check.checked_by ? ` - ${check.checked_by}` : ""}
                        </span>
                        {check.notes && <span className="text-muted-foreground">{check.notes}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Observacoes gerais</Label>
              <Textarea value={form.notes} onChange={(event) => set("notes", event.target.value)} placeholder="Notas de manutencao, avarias ou contexto de uso" className="rounded-xl resize-none" rows={2} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button type="submit" disabled={saving} className="rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
