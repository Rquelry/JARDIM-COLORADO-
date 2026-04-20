import { Laptop, BatteryCharging, Cable, Network } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CATEGORIES = [
  { key: "Notebook", label: "Notebooks", icon: Laptop, color: "#3b82f6" },
  { key: "Fonte/Carregador", label: "Fontes", icon: BatteryCharging, color: "#f59e0b" },
  { key: "Cabo HDMI", label: "Cabos HDMI", icon: Cable, color: "#8b5cf6" },
  { key: "Cabo de Rede", label: "Cabos de Rede", icon: Network, color: "#10b981" },
];

export default function InventoryStats({ items }) {
  const chartData = CATEGORIES.map((cat) => {
    const total = items.filter((i) => i.category === cat.key).length;
    const available = items.filter((i) => i.category === cat.key && i.status === "disponivel").length;
    const inUse = items.filter((i) => i.category === cat.key && i.status === "em_uso").length;
    return { name: cat.label, Disponível: available, "Em Uso": inUse, total, color: cat.color };
  });

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const total = items.filter((i) => i.category === cat.key).length;
          const available = items.filter((i) => i.category === cat.key && i.status === "disponivel").length;
          return (
            <div key={cat.key} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{cat.label}</span>
              </div>
              <p className="text-2xl font-bold">{available}</p>
              <p className="text-xs text-muted-foreground">disponíveis de {total}</p>
            </div>
          );
        })}
      </div>

      {/* Chart - only notebooks */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold mb-4">Visão Geral do Estoque</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barSize={28}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="Disponível" stackId="a" radius={[0, 0, 0, 0]}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
            <Bar dataKey="Em Uso" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}