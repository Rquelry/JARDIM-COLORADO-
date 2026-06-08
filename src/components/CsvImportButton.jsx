import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readCsvFile } from "@/lib/csv";
import { toast } from "sonner";

export default function CsvImportButton({
  label = "Importar CSV",
  transformRows,
  onImport,
  onImported,
  disabled = false,
  className = "",
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLoading(true);

    try {
      const rows = await readCsvFile(file);
      const records = transformRows(rows);
      const skipped = Math.max(rows.length - records.length, 0);

      if (!records.length) {
        toast.error("Nenhum registro valido encontrado no CSV.");
        return;
      }

      const imported = await onImport(records);
      const importedCount = Array.isArray(imported) ? imported.length : records.length;
      const skippedMessage = skipped ? ` ${skipped} linha(s) ignorada(s).` : "";
      toast.success(`Upload concluido: ${importedCount} registro(s) salvo(s).${skippedMessage}`);
      onImported?.(imported || records);
    } catch (error) {
      toast.error(error.message || "Erro ao importar CSV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled || loading}
        onClick={() => inputRef.current?.click()}
        className={`gap-2 rounded-xl ${className}`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
        {label}
      </Button>
    </>
  );
}
