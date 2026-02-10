export function StatsCard({
  title,
  value,
  icon: Icon,
  color = "slate",
  subtitle,
}) {
  const colorClasses = {
    slate: "bg-slate-200 text-slate-700 border-slate-400",
    zinc: "bg-zinc-200 text-zinc-700 border-zinc-400",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && <Icon className="w-12 h-12 opacity-50" />}
      </div>
    </div>
  );
}
