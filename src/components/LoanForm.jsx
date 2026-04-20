import { useState, useEffect } from "react";
import { LoansDB, TeachersDB } from "@/lib/db";
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
import { Laptop, BatteryCharging, Cable, Loader2, CheckCircle2, GraduationCap, UserRound, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AddTeacherDialog from "./AddTeacherDialog";

const equipmentTypes = [
  { value: "Notebook", label: "Notebook", icon: Laptop, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { value: "Carregador", label: "Carregador", icon: BatteryCharging, color: "bg-amber-100 text-amber-600 border-amber-200" },
  { value: "Cabo HDMI", label: "Cabo HDMI", icon: Cable, color: "bg-purple-100 text-purple-600 border-purple-200" },
];

export default function LoanForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [borrowerType, setBorrowerType] = useState("aluno");
  const [teachers, setTeachers] = useState([]);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [form, setForm] = useState({
    student_name: "",
    grade: "",
    institution: "",
    equipment_type: "",
    equipment_id: "",
    notes: "",
  });

  useEffect(() => {
    TeachersDB.list("name", 100).then(setTeachers);
  }, []);

  const handleTeacherSelect = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (teacher) {
      setForm({ 
        ...form, 
        student_name: teacher.name, // Usamos student_name para manter consistência no DB
        institution: teacher.institution 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (borrowerType === "aluno" && !form.student_name.trim()) {
      toast.error("Digite o nome do aluno");
      return;
    }
    if (borrowerType === "professor" && !form.student_name.trim()) {
      toast.error("Selecione um professor");
      return;
    }
    if (!form.equipment_type) {
      toast.error("Selecione o tipo de equipamento");
      return;
    }

    setLoading(true);
    await LoansDB.create({
      ...form,
      borrower_type: borrowerType,
      checkout_time: new Date().toISOString(),
      status: "emprestado",
    });
    toast.success("Empréstimo registrado com sucesso!");
    setLoading(false);
    navigate("/");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Borrower Type Toggle */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Quem está retirando? *</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "aluno", label: "Aluno", icon: GraduationCap },
              { value: "professor", label: "Professor", icon: UserRound },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = borrowerType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setBorrowerType(opt.value); setForm({ ...form, student_name: "", grade: "", institution: "" }); }}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 font-semibold text-sm ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipment Type */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Tipo de Equipamento *</Label>
          <div className="grid grid-cols-3 gap-3">
            {equipmentTypes.map((eq) => {
              const Icon = eq.icon;
              const isSelected = form.equipment_type === eq.value;
              return (
                <button
                  key={eq.value}
                  type="button"
                  onClick={() => setForm({ ...form, equipment_type: eq.value })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `${eq.color} border-current shadow-sm`
                      : "bg-card border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? "" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-semibold ${isSelected ? "" : "text-muted-foreground"}`}>
                    {eq.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Student name (only for aluno) */}
        {borrowerType === "aluno" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_name" className="text-sm font-semibold">Nome do Aluno *</Label>
              <Input
                id="student_name"
                placeholder="Digite o nome do aluno..."
                value={form.student_name}
                onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                className="h-12 rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-semibold">Série / Turma</Label>
              <Input
                id="grade"
                placeholder="Ex: 1º A, 3º B..."
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="h-12 rounded-xl bg-background"
              />
            </div>
          </div>
        )}

        {/* Professor selector */}
        {borrowerType === "professor" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Professor *</Label>
              <button
                type="button"
                onClick={() => setShowAddTeacher(true)}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Adicionar professor
              </button>
            </div>
            <Select onValueChange={handleTeacherSelect}>
              <SelectTrigger className="h-12 rounded-xl bg-background">
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} {t.discipline ? `— ${t.discipline}` : ""} ({t.institution})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Institution (only for professors) */}
        {borrowerType === "professor" && form.institution && (
          <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">
            Instituição: <span className="font-semibold text-foreground">{form.institution}</span>
          </div>
        )}

        {/* Equipment ID */}
        <div className="space-y-2">
          <Label htmlFor="equipment_id" className="text-sm font-semibold">Identificação do Equipamento</Label>
          <Input
            id="equipment_id"
            placeholder="Ex: NB-001, CARR-003"
            value={form.equipment_id}
            onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}
            className="h-12 rounded-xl bg-background"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-semibold">Observações</Label>
          <Textarea
            id="notes"
            placeholder="Alguma observação sobre o empréstimo..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="rounded-xl bg-background resize-none"
            rows={3}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Registrar Empréstimo
            </>
          )}
        </Button>
      </form>

      <AddTeacherDialog
        open={showAddTeacher}
        onClose={() => setShowAddTeacher(false)}
        onAdded={(teacher) => {
          setTeachers((prev) => [...prev, teacher]);
        }}
      />
    </>
  );
}