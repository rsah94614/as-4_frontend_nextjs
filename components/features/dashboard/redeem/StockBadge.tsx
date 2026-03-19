"use client";

export default function StockBadge({ status }: { status: string }) {
  const cfg = {
    "In Stock": {
      cls: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    },
    "Limited Stock": {
      cls: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
    },
    "Out of Stock": {
      cls: "bg-red-100 text-red-600",
      dot: "bg-red-500",
    },
  }[status] ?? {
    cls: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
