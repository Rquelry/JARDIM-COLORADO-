import { useState, useEffect } from "react";
import { LoansDB } from "@/lib/db";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Laptop, BatteryCharging, Cable, CheckCircle2, Clock } from "lucide-react";
import moment from "moment";

const equipmentIcons = {
  Notebook: Laptop,
  Carregador: BatteryCharging,
  "Cabo HDMI": Cable,
};

const equipmentColors = {
  Notebook: "bg-blue-100 text-blue-600",
  Carregador: "bg-amber-100 text-amber-600",
  "Cabo HDMI": "bg-purple-100 text-purple-600",
};

export default function History() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterEquipment, setFilterEquipment] = useState("todos");

  useEffect(() => {
    const fetchLoans = async () => {
      const data = await LoansDB.list("-checkout_time", 200);
      setLoans(data);
      setLoading(false);
    };
    fetchLoans();
  }, []);

  const filtered = loans.filter((loan) => {
    const matchSearch =
      loan.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      loan.grade?.toLowerCase().includes(search.toLowerCase()) ||
      loan.equipment_id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "todos" || loan.status === filterStatus;
    const matchEquipment =
      filterEquipment === "todos" || loan.equipment_type === filterEquipment;
    return matchSearch && matchStatus && matchEquipment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Histórico</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {loans.length} registro{loans.length !== 1 ? "s" : ""} no total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno, turma ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="emprestado">Emprestados</SelectItem>
            <SelectItem value="devolvido">Devolvidos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterEquipment} onValueChange={setFilterEquipment}>
          <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Notebook">Notebook</SelectItem>
            <SelectItem value="Carregador">Carregador</SelectItem>
            <SelectItem value="Cabo HDMI">Cabo HDMI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Equipamento
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Aluno
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Série
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Retirada
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Devolução
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((loan) => {
                const Icon = equipmentIcons[loan.equipment_type] || Laptop;
                const color = equipmentColors[loan.equipment_type] || "bg-gray-100 text-gray-600";
                return (
                  <tr key={loan.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-medium text-sm">{loan.equipment_type}</span>
                          {loan.equipment_id && (
                            <p className="text-xs text-muted-foreground">#{loan.equipment_id}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium">{loan.student_name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{loan.grade}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {moment(loan.checkout_time).format("DD/MM/YY HH:mm")}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {loan.return_time
                        ? moment(loan.return_time).format("DD/MM/YY HH:mm")
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {loan.status === "devolvido" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          Devolvido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          <Clock className="h-3 w-3" />
                          Emprestado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map((loan) => {
            const Icon = equipmentIcons[loan.equipment_type] || Laptop;
            const color = equipmentColors[loan.equipment_type] || "bg-gray-100 text-gray-600";
            return (
              <div key={loan.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{loan.student_name}</p>
                      <p className="text-xs text-muted-foreground">{loan.grade}</p>
                    </div>
                  </div>
                  {loan.status === "devolvido" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Devolvido
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3" />
                      Emprestado
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{loan.equipment_type}</span>
                  {loan.equipment_id && <span>#{loan.equipment_id}</span>}
                  <span>Saída: {moment(loan.checkout_time).format("DD/MM HH:mm")}</span>
                  {loan.return_time && (
                    <span>Devolução: {moment(loan.return_time).format("DD/MM HH:mm")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-muted-foreground font-medium">Nenhum registro encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}