export default function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}