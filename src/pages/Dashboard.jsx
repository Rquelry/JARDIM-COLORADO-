import { useState, useEffect } from "react";
import { LoansDB } from "@/lib/db";
import { Link } from "react-router-dom";
import { Laptop, BatteryCharging, Cable, PlusCircle, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StatCard from "../components/StatCard";
import ActiveLoanCard from "../components/ActiveLoanCard";
import InventorySnapshot from "../components/InventorySnapshot";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnDialog, setReturnDialog] = useState(null);
  const [returning, setReturning] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLoans = async () => {
    const data = await LoansDB.filter({ status: "emprestado" }, "-checkout_time", 100);
    setLoans(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturn = async () => {
    if (!returnDialog) return;
    setReturning(true);
    await LoansDB.update(returnDialog.id, {
      status: "devolvido",
      return_time: new Date().toISOString(),
    });
    toast.success("Equipamento devolvido com sucesso!");
    setReturning(false);
    setReturnDialog(null);
    fetchLoans();
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    await LoansDB.delete(deleteDialog.id);
    toast.success("Empréstimo excluído!");
    setDeleting(false);
    setDeleteDialog(null);
    fetchLoans();
  };

  const notebooks = loans.filter((l) => l.equipment_type === "Notebook").length;
  const chargers = loans.filter((l) => l.equipment_type === "Carregador").length;
  const hdmi = loans.filter((l) => l.equipment_type === "Cabo HDMI").length;

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
          <h2 className="text-2xl font-bold tracking-tight">Painel de Controle</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {loans.length} equipamento{loans.length !== 1 ? "s" : ""} emprestado{loans.length !== 1 ? "s" : ""} agora
          </p>
        </div>
        <Link to="/novo-emprestimo">
          <Button className="gap-2 rounded-xl h-11 shadow-lg shadow-primary/20">
            <PlusCircle className="h-4 w-4" />
            Novo Empréstimo
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Laptop} label="Notebooks" value={notebooks} color="bg-blue-100 text-blue-600" />
        <StatCard icon={BatteryCharging} label="Carregadores" value={chargers} color="bg-amber-100 text-amber-600" />
        <StatCard icon={Cable} label="Cabos HDMI" value={hdmi} color="bg-purple-100 text-purple-600" />
      </div>

      {/* Inventory Snapshot */}
      <InventorySnapshot />

      {/* Active Loans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Empréstimos Ativos</h3>
        {loans.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <PackageOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum empréstimo ativo</p>
            <p className="text-sm text-muted-foreground mt-1">
              Todos os equipamentos foram devolvidos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loans.map((loan) => (
              <ActiveLoanCard
                key={loan.id}
                loan={loan}
                onReturn={setReturnDialog}
                onDelete={setDeleteDialog}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Empréstimo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o empréstimo de <strong>{deleteDialog?.student_name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Return Confirmation Dialog */}
      <AlertDialog open={!!returnDialog} onOpenChange={() => setReturnDialog(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Devolução</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmar a devolução do <strong>{returnDialog?.equipment_type}</strong> emprestado por{" "}
              <strong>{returnDialog?.student_name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={returning}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReturn}
              disabled={returning}
              className="bg-green-600 hover:bg-green-700"
            >
              {returning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Devolução"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}