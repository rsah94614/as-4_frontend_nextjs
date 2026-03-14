"use client";

/**
 * Wallet page — live API calls via Next.js proxy.
 *
 * Endpoints (via /api/proxy/wallet → http://localhost:8004/v1/wallets):
 *   GET /employees/{employee_id}        → WalletResponse
 *   GET /{wallet_id}/points-summary     → PointsSummary
 *   GET /transactions?wallet_id=...     → TransactionListResponse
 */

import { useState, useEffect, useCallback } from "react";
import {
  Gift,
  Ticket,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  TrendingUp,
  Star,
  Wallet as WalletIcon,
} from "lucide-react";
import Link from "next/link";
import {
  PAGE_WRAPPER,
  PAGE_HEADER,
  PAGE_HEADER_INNER,
  PAGE_CONTENT,
  HDFC_RED,
  HDFC_BLUE,
} from "@/components/features/history/history-styles";
import { createAuthenticatedClient } from "@/lib/api-utils";
import { auth } from "@/services/auth-service";
import { extractApiError } from "@/lib/api-utils";
import { Button } from "@/components/ui/button";

// ─── Proxy client ─────────────────────────────────────────────────────────────

const walletClient = createAuthenticatedClient("/api/proxy/wallet");

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Exact API response types (mirrors backend schemas.py) ───────────────────

interface WalletData {
  wallet_id: string;
  employee_id: string;
  available_points: number;
  redeemed_points: number;
  total_earned_points: number;
  version?: number;
}

interface PointsSummary {
  wallet_id: string;
  points_this_month: number;
  points_this_year: number;
}

interface TransactionStatus {
  status_id: string;
  code: string;
  name: string;
}

interface TransactionType {
  type_id: string;
  code: string;
  name: string;
  is_credit: boolean;
}

interface Transaction {
  transaction_id: string;
  wallet_id: string;
  amount: number;
  status: TransactionStatus;
  transaction_type: TransactionType;
  reference_number: string;
  description: string | null;
  transaction_at: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface TransactionListResponse {
  page: number;
  limit: number;
  total: number;
  transactions: Transaction[];
}

// ─── Fetchers — all go through /api/proxy/wallet ─────────────────────────────

async function fetchWallet(employeeId: string): Promise<WalletData> {
  try {
    const res = await walletClient.get<WalletData>(`/employees/${employeeId}`);
    return res.data;
  } catch (error: unknown) {
    throw new Error(extractApiError(error, "Failed to load wallet"));
  }
}

async function fetchPointsSummary(walletId: string): Promise<PointsSummary> {
  try {
    const res = await walletClient.get<PointsSummary>(
      `/${walletId}/points-summary`
    );
    return res.data;
  } catch (error: unknown) {
    throw new Error(extractApiError(error, "Failed to load points summary"));
  }
}

async function fetchTransactions(
  walletId: string,
  page: number,
  limit: number
): Promise<TransactionListResponse> {
  try {
    const params = new URLSearchParams({
      wallet_id: walletId,
      page: String(page),
      limit: String(limit),
    });
    const res = await walletClient.get<TransactionListResponse>(
      `/transactions?${params.toString()}`
    );
    return res.data;
  } catch (error: unknown) {
    throw new Error(extractApiError(error, "Failed to load transactions"));
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/20 rounded-xl ${className}`} />
  );
}

function SkeletonLight({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center justify-between">
      <p className="text-sm text-red-700">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-sm text-red-700 font-medium hover:underline ml-4"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    </div>
  );
}

function ActivityRow({ txn }: { txn: Transaction }) {
  const isCredit = txn.transaction_type.is_credit;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 group hover:bg-red-50/20 px-2 rounded-xl transition-colors">
      {/* Icon circle */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isCredit ? "bg-red-50" : "bg-gray-100"
          }`}
      >
        {isCredit ? (
          <TrendingUp size={16} className="text-[#E31837]" />
        ) : (
          <Ticket size={16} className="text-gray-400" />
        )}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#E31837] transition-colors">
          {txn.description || txn.transaction_type.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {isCredit
            ? `Received ${txn.amount.toLocaleString()} Points`
            : `Redeemed ${txn.amount.toLocaleString()} Points`}
        </p>
      </div>

      {/* Date + progress */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-gray-400">
          {formatDate(txn.transaction_at)}
        </p>
        {/* Mini progress indicator */}
        <div className="mt-1.5 w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (txn.amount / 500) * 100)}%`,
              background: isCredit ? "#004C8F" : "#E31837",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TXN_PAGE_SIZE = 10;

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [txnData, setTxnData] = useState<TransactionListResponse | null>(null);
  const [txnPage, setTxnPage] = useState(1);

  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [txnError, setTxnError] = useState<string | null>(null);

  // ── Load wallet + summary ─────────────────────────────────────────────────
  const loadWallet = useCallback(async () => {
    const user = auth.getUser();
    if (!user?.employee_id) {
      setWalletError("Not authenticated. Please log in.");
      setLoadingWallet(false);
      return;
    }

    setLoadingWallet(true);
    setWalletError(null);

    try {
      const walletData = await fetchWallet(user.employee_id);
      setWallet(walletData);

      const sumData = await fetchPointsSummary(walletData.wallet_id);
      setSummary(sumData);
    } catch (e) {
      setWalletError(
        e instanceof Error ? e.message : "Failed to load wallet data."
      );
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  // ── Load transactions ─────────────────────────────────────────────────────
  const loadTransactions = useCallback(
    async (walletId: string, page: number) => {
      setLoadingTxns(true);
      setTxnError(null);
      try {
        const data = await fetchTransactions(walletId, page, TXN_PAGE_SIZE);
        setTxnData(data);
      } catch (e) {
        setTxnError(
          e instanceof Error ? e.message : "Failed to load transactions."
        );
      } finally {
        setLoadingTxns(false);
      }
    },
    []
  );

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // ── Load txns whenever wallet_id or page changes ──────────────────────────
  useEffect(() => {
    if (wallet?.wallet_id) {
      loadTransactions(wallet.wallet_id, txnPage);
    }
  }, [wallet?.wallet_id, txnPage, loadTransactions]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = txnData
    ? Math.max(1, Math.ceil(txnData.total / TXN_PAGE_SIZE))
    : 1;

  function handlePageChange(dir: 1 | -1) {
    const next = txnPage + dir;
    if (next < 1 || next > totalPages) return;
    setTxnPage(next);
    document
      .getElementById("txn-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={PAGE_WRAPPER}>

      {/* ── Page Header ── */}
      <div className={PAGE_HEADER}>
        <div className={PAGE_HEADER_INNER}>
          <div>
            <h1 className="text-2xl font-bold leading-tight" style={{ color: HDFC_BLUE }}>
              Wallet
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your points balance and transactions
            </p>
          </div>
          <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
            <span style={{ color: HDFC_RED }}>A</span>
            <span style={{ color: HDFC_BLUE }}>abhar</span>
          </span>
        </div>
      </div>

      {/* Red accent line */}
      <div className="h-0.5 shrink-0" style={{ background: HDFC_RED }} />

      {/* ── Main content ── */}
      <div className={PAGE_CONTENT}>
        <div className="flex flex-col gap-6">

          {/* ── Hero Balance Banner ─────────────────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden shadow-lg relative"
            style={{
              background: "linear-gradient(135deg, #1a3a6e 0%, #004C8F 40%, #2d3a8c 75%, #4c3a9e 100%)",
            }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-5"
              style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translateY(50%)" }} />

            <div className="relative px-4 py-3 border-b border-white/20" style={{ background: "rgba(227,24,55,0.25)" }}>
              <p className="text-white font-bold text-sm tracking-widest uppercase">Wallet Balance</p>
            </div>

            <div className="relative flex flex-col lg:flex-row">
              {/* Left — Balance info */}
              <div className="flex-1 px-6 py-6 flex items-center gap-6">
                {/* Wallet illustration */}
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                  <WalletIcon size={40} className="text-yellow-300" />
                </div>

                {/* Points Balance */}
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
                    Points Balance
                  </p>
                  {loadingWallet ? (
                    <Skeleton className="h-9 w-28 mt-1" />
                  ) : (
                    <p className="text-white text-4xl font-bold mt-1">
                      {(wallet?.available_points ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Redeem button */}
                <div className="ml-auto">
                  <Link href="/redeem">
                    <button
                      className="px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all duration-200 active:scale-95"
                      style={{
                        background: "#E31837",
                        boxShadow: "0 4px 15px rgba(227,24,55,0.4)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#c41230")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#E31837")}
                    >
                      Redeem Reward
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Error if wallet failed ─────────────────────────────────────────── */}
          {walletError && (
            <ErrorBanner message={walletError} onRetry={loadWallet} />
          )}

          {/* ── Stats row ─────────────────────────────────────────────────────── */}
          {!loadingWallet && wallet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Lifetime Points Earned",
                  value: wallet.total_earned_points,
                  icon: Gift,
                  bg: "#FDEAED",
                  color: HDFC_RED,
                  border: HDFC_RED,
                },
                {
                  label: "Points Redeemed",
                  value: wallet.redeemed_points,
                  icon: Ticket,
                  bg: "#f0f4ff",
                  color: "#6366f1",
                  border: "#6366f1",
                },
              ].map(({ label, value, icon: Icon, bg, color, border }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
                  style={{ borderTop: `3px solid ${border}` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color }}>{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">
                      {value.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading skeletons for stats row */}
          {loadingWallet && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonLight key={i} className="h-24" />
              ))}
            </div>
          )}

          {/* ── Main content: Activity + Side Panel ─────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Recent Wallet Activity ─────────────────────────────────── */}
            <div
              id="txn-section"
              className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50" style={{ borderLeft: "3px solid #E31837" }}>
                <div>
                  <h3 className="text-base font-bold" style={{ color: HDFC_BLUE }}>
                    Recent Wallet Activity
                  </h3>
                  {txnData && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {txnData.total.toLocaleString()} total transactions
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (wallet?.wallet_id) {
                      loadTransactions(wallet.wallet_id, txnPage);
                    }
                  }}
                  disabled={loadingTxns || !wallet}
                  size="sm"
                  className="text-[#E31837] bg-red-50 border-red-100 hover:bg-red-100 hover:text-red-800 shadow-none transition-all"
                >
                  <RefreshCw
                    size={13}
                    className={`mr-1.5 ${loadingTxns ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              {/* Transaction list */}
              <div className="px-4 py-2">
                {txnError && (
                  <div className="mb-4 px-2">
                    <ErrorBanner
                      message={txnError}
                      onRetry={() =>
                        wallet && loadTransactions(wallet.wallet_id, txnPage)
                      }
                    />
                  </div>
                )}

                {loadingTxns ? (
                  <div className="flex flex-col gap-3 py-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonLight key={i} className="h-14" />
                    ))}
                  </div>
                ) : txnData?.transactions.length === 0 ? (
                  <div className="flex flex-col items-center py-14 gap-3 text-gray-400">
                    <ArrowDownCircle size={32} strokeWidth={1.2} />
                    <p className="text-sm">No transactions yet.</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {txnData?.transactions.map((txn) => (
                      <ActivityRow key={txn.transaction_id} txn={txn} />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination footer */}
              {!loadingTxns && txnData && txnData.total > TXN_PAGE_SIZE && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    Page <b className="text-gray-700">{txnPage}</b> of{" "}
                    <b className="text-gray-700">{totalPages}</b>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(-1)}
                      disabled={txnPage === 1}
                      className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-none"
                    >
                      <ChevronLeft size={14} className="mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={txnPage >= totalPages}
                      className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-none"
                    >
                      Next
                      <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* View All Activity link */}
              <div className="px-6 py-3 border-t border-gray-50 flex justify-center">
                <Link
                  href="/history"
                  className="text-sm font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: HDFC_RED }}
                >
                  View All Activity
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* ── Right: Period Summary Panel ───────────────────────────── */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5" style={{ borderTop: "3px solid #004C8F" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#E8F1FA" }}
                  >
                    <Star size={15} style={{ color: HDFC_BLUE }} />
                  </div>
                  <h4 className="font-bold text-sm" style={{ color: HDFC_BLUE }}>Period Summary</h4>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl">
                    <span className="text-xs font-medium text-gray-600">This Month</span>
                    {loadingWallet ? (
                      <SkeletonLight className="h-5 w-12" />
                    ) : (
                      <span className="font-bold text-gray-900 text-sm">
                        {(summary?.points_this_month ?? 0).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl">
                    <span className="text-xs font-medium text-gray-600">This Year</span>
                    {loadingWallet ? (
                      <SkeletonLight className="h-5 w-12" />
                    ) : (
                      <span className="font-bold text-gray-900 text-sm">
                        {(summary?.points_this_year ?? 0).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl">
                    <span className="text-xs font-medium text-gray-600">Lifetime Total</span>
                    {loadingWallet ? (
                      <SkeletonLight className="h-5 w-12" />
                    ) : (
                      <span className="font-bold text-gray-900 text-sm">
                        {(wallet?.total_earned_points ?? 0).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
                      </span>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}