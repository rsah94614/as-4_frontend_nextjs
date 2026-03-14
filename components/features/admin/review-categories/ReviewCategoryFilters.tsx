"use client";

type FilterValue = boolean | null;

interface Props {
  activeOnly: FilterValue;
  onFilterChange: (val: FilterValue) => void;
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All",      value: null  },
  { label: "Active",   value: true  },
  { label: "Inactive", value: false },
];

export function ReviewCategoryFilters({ activeOnly, onFilterChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map(f => {
        const isSelected = f.value === null ? activeOnly === null : activeOnly === f.value;
        return (
          <button
            key={String(f.value)}
            onClick={() => onFilterChange(f.value)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150"
            style={
              isSelected
                ? { background: "#004C8F", color: "#fff", borderColor: "#004C8F" }
                : { background: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
            }
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}