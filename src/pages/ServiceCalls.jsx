import { useState, useEffect } from "react";
import { ServiceCallsDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Wrench, PlusCircle, Loader2, ImagePlus, CheckCircle2, Clock, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const statusConfig = {
  aberto: { label: "Aberto", color: "text-red-600 bg-red-50", icon: AlertCircle },
  em_andamento: { label: "Em Andamento", color: "text-amber-600 bg-amber-50", icon: Clock },
  resolvido: { label: "Resolvido", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
};

const categories = ["Troca de Tonner", "Manutenção", "Reparo", "Outro"];

export default function ServiceCalls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    equipment_id: "",
    photo_url: "",
    status: "aberto",
  });

  const fetchCalls = async () => {
    const data = await ServiceCallsDB.list("-created_date", 100);
    setCalls(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 1MB for localStorage)
    if (file.size > 1024 * 1024) {
      toast.error("A imagem deve ter menos de 1MB");
      return;
    }

    setUploadingPhoto(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, photo_url: reader.result }));
        setUploadingPhoto(false);
        toast.success("Foto anexada!");
      };
      reader.onerror = () => {
        toast.error("Erro ao carregar imagem");
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Erro ao processar imagem");
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category) {
      toast.error("Título e categoria são obrigatórios");
      return;
    }
    setSaving(true);
    await ServiceCallsDB.create(form);
    toast.success("Chamado registrado!");
    setSaving(false);
    setShowForm(false);
    setForm({ title: "", category: "", description: "", equipment_id: "", photo_url: "", status: "aberto" });
    fetchCalls();
  };

  const handleStatusChange = async (call, newStatus) => {
    const update = { status: newStatus };
    if (newStatus === "resolvido") update.resolved_at = new Date().toISOString();
    await ServiceCallsDB.update(call.id, update);
    toast.success("Status atualizado!");
    fetchCalls();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Atendimento de Chamados</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {calls.filter(c => c.status !== "resolvido").length} chamado(s) abertos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl h-11 shadow-lg shadow-primary/20">
          <PlusCircle className="h-4 w-4" />
          Novo Chamado
        </Button>
      </div>

      {/* Cards */}
      {calls.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Wrench className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Nenhum chamado registrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calls.map((call) => {
            const status = statusConfig[call.status] || statusConfig.aberto;
            const StatusIcon = status.icon;
            return (
              <div
                key={call.id}
                className="bg-card rounded-2xl border border-border p-4 space-y-3 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedCall(call)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{call.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{call.category}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${status.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </div>

                {call.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{call.description}</p>
                )}

                {call.photo_url && (
                  <img
                    src={call.photo_url}
                    alt="Foto do chamado"
                    className="w-full h-36 object-cover rounded-xl border border-border"
                  />
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {moment(call.created_date).format("DD/MM/YY HH:mm")}
                    {call.equipment_id && ` · #${call.equipment_id}`}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {call.status !== "em_andamento" && call.status !== "resolvido" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => handleStatusChange(call, "em_andamento")}>
                        Em Andamento
                      </Button>
                    )}
                    {call.status !== "resolvido" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleStatusChange(call, "resolvido")}>
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Call Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Chamado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Descreva o problema brevemente"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Identificação do Equipamento</Label>
              <Input
                placeholder="Ex: NB-001, IMP-003"
                value={form.equipment_id}
                onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Descreva o problema com mais detalhes..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Foto</Label>
              {form.photo_url ? (
                <div className="relative">
                  <img src={form.photo_url} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-border" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, photo_url: "" })}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  {uploadingPhoto ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Clique para anexar foto</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                </label>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving || uploadingPhoto}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Chamado"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {selectedCall && (
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedCall.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[selectedCall.status]?.color}`}>
                  {statusConfig[selectedCall.status]?.label}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{selectedCall.category}</span>
                {selectedCall.equipment_id && (
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">#{selectedCall.equipment_id}</span>
                )}
              </div>
              {selectedCall.description && (
                <p className="text-sm text-foreground bg-muted rounded-xl p-3">{selectedCall.description}</p>
              )}
              {selectedCall.photo_url && (
                <img src={selectedCall.photo_url} alt="Foto" className="w-full rounded-xl border border-border" />
              )}
              <p className="text-xs text-muted-foreground">
                Aberto em {moment(selectedCall.created_date).format("DD/MM/YYYY HH:mm")}
                {selectedCall.resolved_at && ` · Resolvido em ${moment(selectedCall.resolved_at).format("DD/MM/YYYY HH:mm")}`}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}