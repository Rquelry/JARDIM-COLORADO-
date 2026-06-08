import { useState, useEffect } from "react";
import { LoansDB, TeachersDB, StudentsDB, NotebooksDB } from "@/lib/db";
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
  Laptop,
  BatteryCharging,
  Cable,
  Loader2,
  CheckCircle2,
  GraduationCap,
  UserRound,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AddTeacherDialog from "./AddTeacherDialog";
import CsvImportButton from "@/components/CsvImportButton";
import { mapStudentsCsv } from "@/lib/csv-mappers";

const equipmentTypes = [
  { value: "Notebook", label: "Notebook", icon: Laptop, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { value: "Carregador", label: "Carregador", icon: BatteryCharging, color: "bg-amber-100 text-amber-600 border-amber-200" },
  { value: "Cabo HDMI", label: "Cabo HDMI", icon: Cable, color: "bg-purple-100 text-purple-600 border-purple-200" },
];

const emptyStudentFields = {
  student_name: "",
  card_code: "",
  grade: "",
  institution: "",
};

export default function LoanForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [borrowerType, setBorrowerType] = useState("aluno");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [showNotebookSuggestions, setShowNotebookSuggestions] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [form, setForm] = useState({
    ...emptyStudentFields,
    equipment_type: "",
    equipment_id: "",
    notes: "",
  });

  useEffect(() => {
    TeachersDB.list("name", 100).then(setTeachers);
    StudentsDB.list("name", 1000).then(setStudents);
    NotebooksDB.list("model", 5000).then(setNotebooks);
  }, []);

  const normalize = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const studentSuggestions = form.student_name.trim()
    ? students
        .filter((student) =>
          normalize(student.name).includes(normalize(form.student_name)),
        )
        .slice(0, 8)
    : [];

  const notebookSuggestions =
    form.equipment_type === "Notebook" && form.equipment_id.trim()
      ? notebooks
          .filter((notebook) => {
            const term = normalize(form.equipment_id);
            return [
              notebook.name,
              notebook.model,
              notebook.serial_number,
              notebook.asset_tag,
              notebook.cart,
              notebook.current_location,
            ].some((value) => normalize(value).includes(term));
          })
          .slice(0, 8)
      : [];

  const fillStudentData = (student) => {
    setForm((current) => ({
      ...current,
      student_name: student.name || "",
      grade: student.grade || "",
      card_code: student.card_code || "",
      student_id: student.student_id || "",
    }));
    setShowStudentSuggestions(false);
  };

  const findStudentByCardCode = (cardCode) => {
    const normalizedCard = normalize(cardCode);
    return students.find(
      (student) =>
        normalize(student.card_code) === normalizedCard ||
        normalize(student.student_id) === normalizedCard,
    );
  };

  const handleCardCodeChange = (value) => {
    const student = findStudentByCardCode(value);

    if (student) {
      fillStudentData(student);
    } else {
      setForm((current) => ({ ...current, card_code: value }));
    }
  };

  const handleTeacherSelect = (teacherId) => {
    const teacher = teachers.find((item) => item.id === teacherId);
    if (teacher) {
      setForm({
        ...form,
        student_name: teacher.name,
        institution: teacher.institution,
      });
    }
  };

  const fillNotebookData = (notebook) => {
    setForm((current) => ({
      ...current,
      equipment_id: notebook.serial_number || notebook.asset_tag || notebook.name || "",
    }));
    setShowNotebookSuggestions(false);
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
    toast.success("Emprestimo registrado com sucesso!");
    setLoading(false);
    navigate("/");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Quem esta retirando? *</Label>
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
                  onClick={() => {
                    setBorrowerType(opt.value);
                    setForm({ ...form, ...emptyStudentFields });
                    setShowStudentSuggestions(false);
                  }}
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
                  onMouseDown={() => setShowNotebookSuggestions(false)}
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

        {borrowerType === "aluno" && (
          <div className="space-y-4">
            <CsvImportButton
              label="Importar alunos"
              transformRows={mapStudentsCsv}
              onImport={(records) => StudentsDB.createMany(records)}
              onImported={(records) => setStudents((current) => [...current, ...records])}
              className="w-full sm:w-auto"
            />

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] gap-4 items-start">
              <div className="space-y-2 relative">
                <Label htmlFor="student_name" className="text-sm font-semibold">Nome do Aluno *</Label>
                <Input
                  id="student_name"
                  placeholder="Digite o nome do aluno..."
                  value={form.student_name}
                  onFocus={() => setShowStudentSuggestions(true)}
                  onBlur={() => {
                    window.setTimeout(() => setShowStudentSuggestions(false), 120);
                  }}
                  onChange={(e) => {
                    setForm({ ...form, student_name: e.target.value });
                    setShowStudentSuggestions(true);
                  }}
                  className="h-12 rounded-xl bg-background"
                />
                {showStudentSuggestions && studentSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                    {studentSuggestions.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => fillStudentData(student)}
                        className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                      >
                        <span className="block text-sm font-medium">{student.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {student.grade || "Sem turma"}{student.card_code ? ` - Carteirinha ${student.card_code}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="card_code" className="text-sm font-semibold">Codigo da Carteirinha</Label>
                <Input
                  id="card_code"
                  placeholder="Leia ou digite o codigo"
                  value={form.card_code}
                  onChange={(e) => handleCardCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.preventDefault();
                  }}
                  className="h-12 rounded-xl bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-semibold">Serie / Turma</Label>
              <Input
                id="grade"
                placeholder="Ex: 1 A, 3 B..."
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="h-12 rounded-xl bg-background"
              />
            </div>
          </div>
        )}

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
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name} {teacher.discipline ? `- ${teacher.discipline}` : ""} ({teacher.institution})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {borrowerType === "professor" && form.institution && (
          <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">
            Instituicao: <span className="font-semibold text-foreground">{form.institution}</span>
          </div>
        )}

        <div className="space-y-2 relative">
          <Label htmlFor="equipment_id" className="text-sm font-semibold">
            {form.equipment_type === "Notebook" ? "Numero de Serie do Notebook" : "Identificacao do Equipamento"}
          </Label>
          <Input
            id="equipment_id"
            placeholder={form.equipment_type === "Notebook" ? "Digite nome, serie ou patrimonio..." : "Ex: NB-001, CARR-003"}
            value={form.equipment_id}
            onFocus={() => setShowNotebookSuggestions(true)}
            onBlur={() => {
              window.setTimeout(() => setShowNotebookSuggestions(false), 120);
            }}
            onChange={(e) => {
              setForm({ ...form, equipment_id: e.target.value });
              setShowNotebookSuggestions(true);
            }}
            className="h-12 rounded-xl bg-background"
          />
          {showNotebookSuggestions && notebookSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
              {notebookSuggestions.map((notebook) => (
                <button
                  key={notebook.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => fillNotebookData(notebook)}
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                >
                  <span className="block text-sm font-medium">
                    {notebook.name || notebook.model}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Serie {notebook.serial_number || "-"} · Patrimonio {notebook.asset_tag || "-"}
                    {notebook.cart ? ` · ${notebook.cart}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-semibold">Observacoes</Label>
          <Textarea
            id="notes"
            placeholder="Alguma observacao sobre o emprestimo..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="rounded-xl bg-background resize-none"
            rows={3}
          />
        </div>

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
              Registrar Emprestimo
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
