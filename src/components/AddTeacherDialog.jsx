import { useState } from "react";
import { TeachersDB } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddTeacherDialog({ open, onClose, onAdded }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", discipline: "", institution: "" });

  const handleSave = async () => {
    if (!form.name || !form.institution) {
      toast.error("Nome e instituição são obrigatórios");
      return;
    }
    setLoading(true);
    const teacher = await TeachersDB.create(form);
    toast.success("Professor cadastrado!");
    setLoading(false);
    setForm({ name: "", discipline: "", institution: "" });
    onAdded(teacher);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Professor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              placeholder="Nome do professor"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Disciplina/Curso</Label>
            <Input
              placeholder="Ex: ADS, Matemática..."
              value={form.discipline}
              onChange={(e) => setForm({ ...form, discipline: e.target.value })}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Instituição *</Label>
            <Select value={form.institution} onValueChange={(v) => setForm({ ...form, institution: v })}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEDUC">SEDUC</SelectItem>
                <SelectItem value="SESI">SESI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}