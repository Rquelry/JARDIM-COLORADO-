import { useMemo, useState } from "react";
import { Laptop, BatteryCharging, Cable, Network } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

const CATEGORIES = [
  { key: "Notebook", label: "Notebooks", icon: Laptop, color: "#2563eb" },
  { key: "Fonte/Carregador", label: "Fontes", icon: BatteryCharging, color: "#d97706" },
  { key: "Cabo HDMI", label: "Cabos HDMI", icon: Cable, color: "#7c3aed" },
  { key: "Cabo de Rede", label: "Cabos de Rede", icon: Network, color: "#059669" },
];

const STATUS = [
  { key: "disponivel", label: "Disponivel", color: "#16a34a" },
  { key: "em_uso", label: "Em uso", color: "#2563eb" },
  { key: "manutencao", label: "Manutencao", color: "#d97706" },
  { key: "inativo", label: "Inativo", color: "#64748b" },
  { key: "nao_encontrado", label: "Nao encontrado", color: "#dc2626" },
];

const groupLabels = {
  category: "Categoria",
  model: "Modelo",
  location: "Local",
  cart: "Carrinho",
};

const getGroupValue = (item, groupBy) => {
  if (groupBy === "model") return item.brand || "Sem modelo";
  if (groupBy === "location") return item.location || "Sem local";
  if (groupBy === "cart") return item.cart || "Sem carrinho";
  return item.category || "Sem categoria";
};

export default function InventoryStats({ items }) {
  const [groupBy, setGroupBy] = useState("category");

  const chartData = useMemo(() => {
    const groups = new Map();

    items.forEach((item) => {
      const group = getGroupValue(item, groupBy);
      const current = groups.get(group) || {
        name: group,
        total: 0,
        disponivel: 0,
        em_uso: 0,
        manutencao: 0,
        inativo: 0,
        nao_encontrado: 0,
      };

      current.total += 1;
      current[item.status] = (current[item.status] || 0) + 1;
      groups.set(group, current);
    });

    return [...groups.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  }, [items, groupBy]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const total = items.filter((i) => i.category === cat.key).length;
          const available = items.filter((i) => i.category === cat.key && i.status === "disponivel").length;
          return (
            <div key={cat.key} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{cat.label}</span>
              </div>
              <p className="text-2xl font-bold">{available}</p>
              <p className="text-xs text-muted-foreground">disponiveis de {total}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold">Visao Geral do Estoque</h3>
            <p className="text-xs text-muted-foreground">
              {items.length} item(ns) nos filtros atuais
            </p>
          </div>
          <select
            value={groupBy}
            onChange={(event) => setGroupBy(event.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring sm:w-44"
          >
            <option value="category">Por categoria</option>
            <option value="model">Por modelo</option>
            <option value="location">Por local</option>
            <option value="cart">Por carrinho</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={28} margin={{ top: 24, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={chartData.length > 5 ? -20 : 0}
              textAnchor={chartData.length > 5 ? "end" : "middle"}
              height={chartData.length > 5 ? 64 : 32}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              labelFormatter={(label) => `${groupLabels[groupBy]}: ${label}`}
              formatter={(value, name) => [value, STATUS.find((status) => status.key === name)?.label || name]}
            />
            {STATUS.map((status, index) => (
              <Bar key={status.key} dataKey={status.key} stackId="status" fill={status.color}>
                {index === STATUS.length - 1 && (
                  <LabelList
                    dataKey="total"
                    position="top"
                    className="fill-foreground text-xs font-semibold"
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
