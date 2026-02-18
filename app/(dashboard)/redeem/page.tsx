"use client";

/**
 * Redeem Page — fully wired to live backend APIs.
 *
 * Backend endpoints used:
 *   GET  /v1/rewards/catalog?active_only=true&page=1&size=100  → PaginatedCatalogResponse
 *   GET  /v1/rewards/categories?active_only=true               → CategoryResponse[]
 *   GET  /v1/wallets/employees/{employeeId}                    → WalletData
 *   POST /v1/rewards/redeem                                    → RedemptionResponse
 *     body: { wallet_id, catalog_id, points, comment? }
 *
 * Auth token read from localStorage via auth.getAccessToken().
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchWithAuth, auth } from "@/services/auth-service";
import {
  TicketPercent,
  Package,
  ShoppingBag,
  Coins,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";

// ─── Env ──────────────────────────────────────────────────────────────────────

const REWARDS_API = process.env.NEXT_PUBLIC_REWARDS_API_URL || "http://localhost:8006";
const WALLET_API = process.env.NEXT_PUBLIC_WALLET_API_URL || "http://localhost:8004";

// ─── Types (matching backend schemas.py exactly) ──────────────────────────────

interface CategoryInfo {
  category_id: string;
  category_name: string;
  category_code: string;
}

interface RewardItem {
  catalog_id: string;
  reward_name: string;
  reward_code: string;
  description: string | null;
  default_points: number;
  min_points: number;
  max_points: number;
  is_active: boolean;
  created_at: string;
  stock_status: string; // "In Stock" | "Limited Stock" | "Out of Stock"
  available_stock: number;
  category: CategoryInfo | null;
}

interface PaginatedCatalogResponse {
  data: RewardItem[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

interface WalletData {
  wallet_id: string;
  employee_id: string;
  available_points: number;
  redeemed_points: number;
  total_earned_points: number;
}

interface RedemptionResponse {
  history_id: string;
  points: number;
  granted_at: string;
  status: string;
  new_stock_level: number | null;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchCatalog(): Promise<RewardItem[]> {
  const res = await fetchWithAuth(
    `${REWARDS_API}/v1/rewards/catalog?active_only=true&page=1&size=100`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load catalog");
  }
  const data: PaginatedCatalogResponse = await res.json();
  return data.data;
}

async function fetchCategories(): Promise<CategoryInfo[]> {
  const res = await fetchWithAuth(
    `${REWARDS_API}/v1/rewards/categories?active_only=true`
  );
  if (!res.ok) return [];
  return res.json();
}

async function fetchWallet(employeeId: string): Promise<WalletData> {
  const res = await fetchWithAuth(
    `${WALLET_API}/v1/wallets/employees/${employeeId}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load wallet");
  }
  return res.json();
}

async function redeemReward(
  walletId: string,
  catalogId: string,
  points: number,
  comment?: string
): Promise<RedemptionResponse> {
  const res = await fetchWithAuth(`${REWARDS_API}/v1/rewards/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet_id: walletId,
      catalog_id: catalogId,
      points,
      comment: comment || null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Redemption failed");
  }
  return res.json();
}

// ─── Stock badge ──────────────────────────────────────────────────────────────

function StockBadge({ status }: { status: string }) {
  const cfg = {
    "In Stock": { cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    "Limited Stock": { cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
    "Out of Stock": { cls: "bg-red-100 text-red-600", dot: "bg-red-500" },
  }[status] ?? { cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ─── Reward Card ──────────────────────────────────────────────────────────────

function RewardCard({
  item,
  canAfford,
  onRedeem,
}: {
  item: RewardItem;
  canAfford: boolean;
  onRedeem: (item: RewardItem) => void;
}) {
  const outOfStock = item.stock_status === "Out of Stock";
  const isCoupon = item.category?.category_code?.toLowerCase().includes("coupon") ||
    item.reward_code?.toLowerCase().includes("coupon") ||
    item.reward_code?.toLowerCase().includes("voucher");

  const disabled = outOfStock || !canAfford;

  return (
    <div
      className={`group relative rounded-3xl border bg-white flex flex-col overflow-hidden transition-all duration-200
        ${disabled
          ? "opacity-60 cursor-not-allowed border-slate-100"
          : "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 border-slate-100 shadow-sm"
        }`}
    >
      {/* Top colour band */}
      <div
        className={`h-2 w-full ${isCoupon
            ? "bg-gradient-to-r from-amber-400 to-orange-400"
            : "bg-gradient-to-r from-indigo-400 to-violet-500"
          }`}
      />

      <div className="flex flex-col flex-1 p-5">
        {/* Icon + badges row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center
              ${isCoupon ? "bg-amber-50" : "bg-indigo-50"}`}
          >
            {isCoupon
              ? <TicketPercent size={22} className="text-amber-500" />
              : <Package size={22} className="text-indigo-500" />
            }
          </div>
          <StockBadge status={item.stock_status} />
        </div>

        {/* Name + description */}
        <p className="font-semibold text-slate-800 text-sm leading-snug mb-1">
          {item.reward_name}
        </p>
        {item.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* Category pill */}
        {item.category && (
          <span className="inline-block text-[10px] font-medium bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 w-fit mb-3">
            {item.category.category_name}
          </span>
        )}

        {/* Points range */}
        <div className="mt-auto pt-3 border-t border-slate-50">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-slate-400 mb-0.5">Points required</p>
              <p className="text-lg font-bold text-slate-800">
                {item.default_points.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1">pts</span>
              </p>
              {item.min_points !== item.max_points && (
                <p className="text-[10px] text-slate-400">
                  {item.min_points.toLocaleString()} – {item.max_points.toLocaleString()} range
                </p>
              )}
            </div>
            <button
              disabled={disabled}
              onClick={() => !disabled && onRedeem(item)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all
                ${disabled
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                }`}
            >
              {outOfStock ? "Sold out" : !canAfford ? "Not enough pts" : "Redeem"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

type DialogState =
  | { phase: "confirm"; item: RewardItem }
  | { phase: "loading" }
  | { phase: "success"; result: RedemptionResponse; itemName: string; pts: number }
  | { phase: "error"; message: string };

function RedeemDialog({
  state,
  availablePoints,
  walletId,
  onClose,
  onSuccess,
}: {
  state: DialogState | null;
  availablePoints: number;
  walletId: string;
  onClose: () => void;
  onSuccess: (result: RedemptionResponse, ptsSpent: number) => void;
}) {
  const [comment, setComment] = useState("");
  const [innerState, setInnerState] = useState<DialogState | null>(state);

  // Sync outer state to inner when dialog opens with a new item
  useEffect(() => {
    setInnerState(state);
    setComment("");
  }, [state]);

  if (!innerState) return null;

  async function handleConfirm() {
    if (innerState?.phase !== "confirm") return;
    const item = innerState.item;
    setInnerState({ phase: "loading" });
    try {
      const result = await redeemReward(
        walletId,
        item.catalog_id,
        item.default_points,
        comment || undefined
      );
      setInnerState({ phase: "success", result, itemName: item.reward_name, pts: item.default_points });
      onSuccess(result, item.default_points);
    } catch (e) {
      setInnerState({
        phase: "error",
        message: e instanceof Error ? e.message : "Redemption failed",
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* ── Confirm phase ── */}
        {innerState.phase === "confirm" && (
          <>
            <div className="px-7 pt-7 pb-5">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <ShoppingBag size={22} className="text-indigo-600" />
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Confirm Redemption</h3>
              <p className="text-sm text-slate-500 mb-5">
                You're about to redeem this reward from your points balance.
              </p>

              {/* Item summary card */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
                <p className="font-semibold text-slate-800 text-sm mb-1">{innerState.item.reward_name}</p>
                {innerState.item.description && (
                  <p className="text-xs text-slate-400 mb-3">{innerState.item.description}</p>
                )}
                <div className="flex justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                  <span>Cost</span>
                  <span className="font-bold text-slate-800">
                    {innerState.item.default_points.toLocaleString()} pts
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                  <span>Balance after</span>
                  <span className={`font-bold ${availablePoints - innerState.item.default_points < 0 ? "text-red-500" : "text-emerald-600"}`}>
                    {(availablePoints - innerState.item.default_points).toLocaleString()} pts
                  </span>
                </div>
              </div>

              {/* Optional comment */}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">
                  Note (optional)
                </label>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. for team lunch"
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm
                    text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2
                    focus:ring-indigo-300 focus:border-transparent"
                />
              </div>
            </div>

            <div className="px-7 pb-7 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold
                  text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold
                  text-white hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                Confirm
              </button>
            </div>
          </>
        )}

        {/* ── Loading phase ── */}
        {innerState.phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 px-7">
            <Loader2 size={36} className="text-indigo-500 animate-spin mb-4" />
            <p className="text-sm text-slate-500 font-medium">Processing redemption…</p>
          </div>
        )}

        {/* ── Success phase ── */}
        {innerState.phase === "success" && (
          <div className="flex flex-col items-center text-center px-7 py-10">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Redemption Successful!</h3>
            <p className="text-sm text-slate-500 mb-5">
              <span className="font-semibold text-slate-700">{innerState.itemName}</span> has been redeemed.
            </p>
            <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-6 text-left">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Points spent</span>
                <span className="font-bold text-slate-800">−{innerState.pts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Reference</span>
                <span className="font-mono text-slate-600 text-[10px]">
                  {innerState.result.history_id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold
                text-white hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        )}

        {/* ── Error phase ── */}
        {innerState.phase === "error" && (
          <div className="flex flex-col items-center text-center px-7 py-10">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Redemption Failed</h3>
            <p className="text-sm text-red-500 mb-6">{innerState.message}</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold
                  text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  /* re-open confirm for same item — parent will re-trigger */
                  onClose();
                }}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold
                  text-white hover:bg-indigo-700 transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RedeemPage() {
  // ── Server data ──────────────────────────────────────────────────────────
  const [items, setItems] = useState<RewardItem[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ── Load all data on mount ────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = auth.getUser();
      if (!user?.employee_id) throw new Error("Not authenticated");

      const [catalogData, catsData, walletData] = await Promise.all([
        fetchCatalog(),
        fetchCategories(),
        fetchWallet(user.employee_id),
      ]);

      setItems(catalogData);
      setCategories(catsData);
      setWallet(walletData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Filtered items ────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    if (activeCategory === "ALL") return items;
    return items.filter((i) => i.category?.category_id === activeCategory);
  }, [items, activeCategory]);

  // ── Coupon items (for the top strip) ─────────────────────────────────────
  const couponItems = useMemo(() =>
    filteredItems.filter((i) =>
      i.reward_code.toLowerCase().includes("coupon") ||
      i.reward_code.toLowerCase().includes("voucher") ||
      i.category?.category_code.toLowerCase().includes("coupon") ||
      i.category?.category_code.toLowerCase().includes("voucher")
    ), [filteredItems]);

  const productItems = useMemo(() =>
    filteredItems.filter((i) => !couponItems.includes(i)),
    [filteredItems, couponItems]);

  const availablePoints = wallet?.available_points ?? 0;

  // ── Open confirm dialog ───────────────────────────────────────────────────
  function openRedeem(item: RewardItem) {
    setDialogState({ phase: "confirm", item });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setTimeout(() => setDialogState(null), 200);
  }

  function handleSuccess(result: RedemptionResponse, ptsSpent: number) {
    // Optimistic wallet update
    setWallet((prev) =>
      prev
        ? {
          ...prev,
          available_points: prev.available_points - ptsSpent,
          redeemed_points: prev.redeemed_points + ptsSpent,
        }
        : prev
    );
    // Optimistic stock decrement
    setItems((prev) =>
      prev.map((i) => {
        if (dialogState?.phase === "confirm" && i.catalog_id === dialogState.item.catalog_id) {
          const newStock = i.available_stock - 1;
          return {
            ...i,
            available_stock: newStock,
            stock_status:
              newStock <= 0 ? "Out of Stock"
                : newStock < 10 ? "Limited Stock"
                  : "In Stock",
          };
        }
        return i;
      })
    );
  }

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
          <p className="text-sm font-medium">Loading rewards…</p>
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <p className="text-slate-700 font-medium">{error}</p>
          <button
            onClick={loadAll}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-[36px] px-8 md:px-10 py-10 max-w-[1200px] mx-auto">

        {/* ── Wallet balance banner ───────────────────────────────────────── */}
        {wallet && (
          <div className="flex items-center justify-between rounded-2xl bg-indigo-50 border border-indigo-100 px-6 py-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Coins size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-indigo-500 font-medium">Available Balance</p>
                <p className="text-2xl font-bold text-indigo-800 leading-none">
                  {availablePoints.toLocaleString()}
                  <span className="text-sm font-normal text-indigo-400 ml-1.5">pts</span>
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Total earned</p>
              <p className="text-sm font-semibold text-slate-600">
                {wallet.total_earned_points.toLocaleString()} pts
              </p>
              <p className="text-xs text-slate-400">Redeemed: {wallet.redeemed_points.toLocaleString()} pts</p>
            </div>
          </div>
        )}

        {/* ── Category filter tabs ────────────────────────────────────────── */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all
                ${activeCategory === "ALL"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setActiveCategory(cat.category_id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all
                  ${activeCategory === cat.category_id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        )}

        {/* ── Coupons / Vouchers row ──────────────────────────────────────── */}
        {couponItems.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] font-semibold text-slate-800">Coupons & Vouchers</h2>
              <span className="text-xs text-slate-400 font-medium">{couponItems.length} available</span>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide mb-12">
              {couponItems.map((coupon) => (
                <div
                  key={coupon.catalog_id}
                  onClick={() => coupon.stock_status !== "Out of Stock" && availablePoints >= coupon.default_points && openRedeem(coupon)}
                  className={`min-w-[230px] h-[200px] rounded-[28px] flex flex-col items-center justify-center gap-3
                    text-center px-6 relative overflow-hidden transition-all duration-200
                    ${coupon.stock_status === "Out of Stock" || availablePoints < coupon.default_points
                      ? "opacity-55 cursor-not-allowed"
                      : "cursor-pointer hover:scale-[1.03] hover:shadow-lg"
                    }`}
                  style={{
                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                    border: "1px solid #fcd34d",
                  }}
                >
                  {/* Dashed centre line (coupon cutout effect) */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-amber-300/60 pointer-events-none" />
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white" />

                  <TicketPercent size={36} className="text-amber-600 relative z-10" />
                  <div className="relative z-10">
                    <p className="font-bold text-amber-900 text-sm leading-snug">{coupon.reward_name}</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {coupon.default_points.toLocaleString()} pts
                    </p>
                  </div>
                  <StockBadge status={coupon.stock_status} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Products grid ───────────────────────────────────────────────── */}
        {productItems.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[22px] font-semibold text-slate-800">
                {couponItems.length > 0 ? "Products" : "Rewards"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Layers size={13} />
                {productItems.length} item{productItems.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {productItems.map((item) => (
                <RewardCard
                  key={item.catalog_id}
                  item={item}
                  canAfford={availablePoints >= item.default_points}
                  onRedeem={openRedeem}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {filteredItems.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Package size={28} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">No rewards available in this category.</p>
            <button
              onClick={() => setActiveCategory("ALL")}
              className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>

      {/* ── Confirm / Success / Error dialog ──────────────────────────────── */}
      {dialogOpen && dialogState && wallet && (
        <RedeemDialog
          state={dialogState}
          availablePoints={availablePoints}
          walletId={wallet.wallet_id}
          onClose={closeDialog}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}