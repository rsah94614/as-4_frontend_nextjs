"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TicketPercent } from "lucide-react";
import RewardDialog from "@/components/features/rewards/RewardDialog";
import { RewardItem } from "@/app/(dashboard)/redeem/models";
import { rewardItems } from "@/app/(dashboard)/redeem/data";

export default function ViewAllPage() {
  /* ================= DIALOG STATE ================= */

  const [selectedItem, setSelectedItem] = useState<RewardItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = (item: RewardItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  /* ================= FILTER STATE ================= */

  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const filteredItems = useMemo(() => {
    return rewardItems.filter((item) => {
      if (!item.is_active) return false;
      if (!selectedFilter) return true;
      if (selectedFilter === "coupon") return item.type === "coupon";
      return item.category_ids.includes(selectedFilter);
    });
  }, [selectedFilter]);

  const availableItems = filteredItems.filter((i) => !i.is_out_of_stock);
  const outOfStockItems = filteredItems.filter((i) => i.is_out_of_stock);

  const filters = [
    { label: "All", value: "" },
    { label: "Coupon", value: "coupon" },
    { label: "Electronics", value: "ELEC" },
    { label: "Fashion", value: "FASH" },
    { label: "Food", value: "FOOD" },
  ];

  return (
    <>
      <div className="flex-1 w-full">
        <div className="bg-white rounded-[36px] px-10 py-12 max-w-[1200px] mx-auto">
          {/* Filter Pills */}
          <div className="flex gap-4 mb-10 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-5 py-2 rounded-full border text-sm transition ${selectedFilter === filter.value
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Available */}
          <h2 className="text-[22px] font-semibold mb-6">Available</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {availableItems.map((item) => (
              <RewardCard
                key={item.id}
                item={item}
                onClick={() => handleOpen(item)}
              />
            ))}
          </div>

          {/* Out Of Stock */}
          {outOfStockItems.length > 0 && (
            <>
              <h2 className="text-[22px] font-semibold mt-16 mb-6 text-gray-500">
                Out of Stock
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 opacity-60">
                {outOfStockItems.map((item) => (
                  <RewardCard
                    key={item.id}
                    item={item}
                    onClick={() => handleOpen(item)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dialog */}
      <RewardDialog
        open={dialogOpen}
        onOpenChange={handleClose}
        item={selectedItem}
      />
    </>
  );
}

/* ================= REWARD CARD ================= */

function RewardCard({
  item,
  onClick,
}: {
  item: RewardItem;
  onClick: () => void;
}) {
  if (item.type === "coupon") {
    return (
      <Card
        onClick={onClick}
        className="cursor-pointer hover:scale-[1.02] transition h-[215px] rounded-[28px]"
        style={{ backgroundColor: item.bgColor }}
      >
        <CardContent className="h-full flex flex-col items-center justify-center text-center gap-4">
          <TicketPercent size={48} />
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="text-xs text-gray-700">
              {item.points_required.toLocaleString()} points
            </p>
          </div>
          <p className="text-xs font-medium">
            ₹{item.monetary_value.toLocaleString()} each
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:scale-[1.02] transition h-[215px] rounded-[28px] border shadow-sm"
    >
      <CardContent className="h-full flex flex-col items-center justify-center text-center gap-4">
        <img
          src={item.image}
          alt={item.title}
          className="w-20 object-contain"
        />
        <div>
          <p className="font-semibold">{item.title}</p>
          <p className="text-xs text-gray-600">
            {item.points_required.toLocaleString()} points
          </p>
        </div>
        <p className="text-xs font-medium">
          Worth ₹{item.monetary_value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
