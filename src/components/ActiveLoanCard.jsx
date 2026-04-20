import { Laptop, BatteryCharging, Cable, Clock, Undo2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

const equipmentConfig = {
  Notebook: { icon: Laptop, color: "bg-blue-100 text-blue-600" },
  Carregador: { icon: BatteryCharging, color: "bg-amber-100 text-amber-600" },
  "Cabo HDMI": { icon: Cable, color: "bg-purple-100 text-purple-600" },
};

export default function ActiveLoanCard({ loan, onReturn, onDelete }) {
  const config = equipmentConfig[loan.equipment_type] || equipmentConfig.Notebook;
  const Icon = config.icon;
  const checkoutTime = moment(loan.checkout_time);
  const duration = moment.duration(moment().diff(checkoutTime));
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 transition-all duration-200 hover:shadow-md group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{loan.student_name}</h3>
            <p className="text-sm text-muted-foreground">{loan.grade}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReturn(loan)}
            className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
          >
            <Undo2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Devolver</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(loan)}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{loan.equipment_type}</span>
        {loan.equipment_id && (
          <span>#{loan.equipment_id}</span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {checkoutTime.format("DD/MM/YYYY HH:mm")}
        </span>
        <span className="text-amber-600 font-medium">
          {hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`}
        </span>
      </div>

      {loan.notes && (
        <p className="mt-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5 truncate">
          {loan.notes}
        </p>
      )}
    </div>
  );
}