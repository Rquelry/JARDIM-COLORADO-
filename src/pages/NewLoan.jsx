import LoanForm from "../components/LoanForm";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewLoan() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Novo Empréstimo</h2>
          <p className="text-muted-foreground text-sm">Registre a saída de um equipamento</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <LoanForm />
      </div>
    </div>
  );
}