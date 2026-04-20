import { useEffect, useState } from "react";
import { InventoryDB } from "@/lib/db";
import { Link } from "react-router-dom";
import { Laptop, BatteryCharging, Cable, Network, Package } from "lucide-react";

const CATS = [
  { key: "Notebook", label: "Notebooks", icon: Laptop, color: "bg-blue-100 text-blue-600" },
  { key: "Fonte/Carregador", label: "Fontes", icon: BatteryCharging, color: "bg-amber-100 text-amber-600" },
  { key: "Cabo HDMI", label: "Cabos HDMI", icon: Cable, color: "bg-purple-100 text-purple-600" },
  { key: "Cabo de Rede", label: "Cabos de Rede", icon: Network, color: "bg-green-100 text-green-600" },
];

export default function InventorySnapshot() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    InventoryDB.list().then(setItems);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Estoque
        </h3>
        <Link to="/estoque" className="text-sm text-primary font-medium hover:underline">Ver tudo →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATS.map((cat) => {
          const Icon = cat.icon;
          const total = items.filter((i) => i.category === cat.key).length;
          const available = items.filter((i) => i.category === cat.key && i.status === "disponivel").length;
          return (
            <div key={cat.key} className="bg-card rounded-2xl border border-border p-4">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${cat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold">{available}</p>
              <p className="text-xs text-muted-foreground leading-tight">{cat.label}<br />disponíveis de {total}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}