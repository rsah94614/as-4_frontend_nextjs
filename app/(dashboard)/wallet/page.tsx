"use client";

/**
 * Wallet page — live API calls via Next.js proxy.
 *
 * Endpoints (via /api/proxy/wallet → http://localhost:8004/v1/wallets):
 *   GET /employees/{employee_id}        → WalletResponse
 *   GET /{wallet_id}/points-summary     → PointsSummary
 *   GET /transactions?wallet_id=...     → TransactionListResponse
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Gift,
  Ticket,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  TrendingUp,
  Star,
} from "lucide-react";
import Link from "next/link";
import {
  PAGE_WRAPPER,
  PAGE_HEADER,
  PAGE_HEADER_INNER,
  PAGE_CONTENT,
  HDFC_RED,
  HDFC_BLUE,
} from "@/components/features/dashboard/history/history-styles";
import { createAuthenticatedClient } from "@/lib/api-utils";
import { auth } from "@/services/auth-service";
import { extractErrorMessage } from "@/lib/error-utils";
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

/** Animated count-up from 0/previous value to target value (same feel as Redeem). */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;

    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + diff * eased));

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    prevTarget.current = target;
  }, [target, duration]);

  return value;
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
    throw new Error(extractErrorMessage(error, "Failed to load wallet"));
  }
}

async function fetchPointsSummary(walletId: string): Promise<PointsSummary> {
  try {
    const res = await walletClient.get<PointsSummary>(
      `/${walletId}/points-summary`
    );
    return res.data;
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to load points summary"));
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
    throw new Error(extractErrorMessage(error, "Failed to load transactions"));
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/20 rounded-xl ${className}`} />
  );
}

function SkeletonLight({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-5 py-4 flex items-center justify-between">
      <p className="text-sm text-destructive">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-sm text-destructive font-medium hover:underline ml-4"
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
    <div className="flex items-center gap-3 py-3 border-b border-[#d9e4f2] last:border-0 group hover:bg-[#f6faff] px-3 rounded-xl transition-colors">
      {/* Icon circle */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? "bg-[#e9f2ff]" : "bg-[#fdecef]"
          }`}
      >
        {isCredit ? (
          <TrendingUp size={16} className="text-[#0b5b9f]" />
        ) : (
          <Ticket size={16} className="text-destructive" />
        )}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-bold text-[#1f2630] truncate transition-colors">
          {txn.description || txn.transaction_type.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isCredit
            ? `Received ${txn.amount.toLocaleString()} Points`
            : `Redeemed ${txn.amount.toLocaleString()} Points`}
        </p>
      </div>

      {/* Date + status */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xs text-[#6a7684]">
          {formatDate(txn.transaction_at)}
        </p>
        <p className={`mt-0.5 text-xs font-bold ${isCredit ? "text-[#167e3f]" : "text-destructive"}`}>
          {isCredit ? "SUCCESS" : "REDEEMED"}
        </p>
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
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [txnError, setTxnError] = useState<string | null>(null);
  const displayBalance = useCountUp(wallet?.available_points ?? 0);

  // ── Load wallet + summary ─────────────────────────────────────────────────
  const loadWallet = useCallback(async () => {
    const user = auth.getUser();
    if (!user?.employee_id) {
      setWalletError("Not authenticated. Please log in.");
      setLoadingWallet(false);
      setLoadingSummary(false);
      return;
    }

    setLoadingWallet(true);
    setLoadingSummary(true);
    setWalletError(null);

    try {
      const walletData = await fetchWallet(user.employee_id);
      setWallet(walletData);
      setLoadingWallet(false);

      try {
        const sumData = await fetchPointsSummary(walletData.wallet_id);
        setSummary(sumData);
      } finally {
        setLoadingSummary(false);
      }
    } catch (e) {
      setWalletError(extractErrorMessage(e, "Failed to load wallet data."));
      setLoadingSummary(false);
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
        setTxnError(extractErrorMessage(e, "Failed to load transactions."));
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
            <h1 className="text-xl sm:text-2xl font-bold leading-tight" style={{ color: HDFC_BLUE }}>
              Wallet
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage your points balance and transactions
            </p>
          </div>
          <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
            <span style={{ color: HDFC_RED }}>A</span>
            <span style={{ color: HDFC_BLUE }}>abhar</span>
          </span>
        </div>
      </div>



      {/* ── Main content ── */}
      <div className={PAGE_CONTENT}>
        <div className="flex flex-col gap-5">

          {/* ── Hero Balance Banner ─────────────────────────────────────────────── */}
          <div
            className="rounded-2xl border border-[#0a5b9c] overflow-hidden shadow-sm relative px-5 py-5 lg:px-6 lg:py-6"
            style={{
              background: "linear-gradient(130deg, #0d5f9f 0%, #0a4f89 52%, #083f73 100%)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <p className="text-xs sm:text-sm text-white/80 font-bold uppercase tracking-[0.2em]">Points Balance</p>
                {loadingWallet ? (
                  <SkeletonLight className="h-10 w-44 mt-2" />
                ) : (
                  <p className="text-lg sm:text-xl font-bold text-white leading-tight mt-1.5">
                    {displayBalance.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="justify-self-start lg:justify-self-end">
                <Link href="/redeem">
                  <button
                    className="px-7 py-2.5 rounded-xl font-bold text-white text-sm leading-none shadow-md transition-all duration-200 active:scale-95 hover:brightness-95"
                    style={{
                      background: "linear-gradient(180deg, #ef2445 0%, #d71130 100%)",
                      boxShadow: "0 10px 18px rgba(227,24,55,0.35)",
                    }}
                  >
                    Redeem Reward
                  </button>
                </Link>
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
                },
                {
                  label: "Points Redeemed",
                  value: wallet.redeemed_points,
                  icon: Ticket,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 border shadow-sm flex items-center gap-3 transition-all"
                  style={{
                    borderColor: "#b7cde6",
                    background: "linear-gradient(130deg, #ffffff 0%, #f4f8fd 100%)",
                    boxShadow: "inset 0 0 0 1px rgba(10,76,143,0.06)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border"
                    style={{ background: "#eaf2fb", borderColor: "#c8dbef" }}
                  >
                    <Icon size={18} className="text-[#0a4f89]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#0a4f89]">{label}</p>
                    <p className="text-base sm:text-lg font-bold text-[#13365a] leading-tight mt-0.5">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Left: Recent Wallet Activity ─────────────────────────────────── */}
            <div
              id="txn-section"
              className="lg:col-span-2 rounded-2xl shadow-sm border border-[#b7cde6] overflow-hidden"
              style={{ background: "linear-gradient(130deg, #ffffff 0%, #f4f8fd 100%)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#d9e4f2]" style={{ borderLeft: "3px solid #E31837" }}>
                <div>
                  <h3 className="text-sm sm:text-base font-bold leading-tight" style={{ color: HDFC_BLUE }}>
                    Recent Wallet Activity
                  </h3>
                  {txnData && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
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
                  className="text-destructive bg-[#fff0f3] border border-[#f6c2cc] hover:bg-[#ffe5ea] hover:text-[#bf122e] shadow-none transition-all text-xs sm:text-sm font-bold"
                >
                  <RefreshCw
                    size={13}
                    className={`mr-1.5 ${loadingTxns ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              {/* Transaction list */}
              <div className="px-3 py-2">
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
                  <div className="flex flex-col items-center py-14 gap-3 text-muted-foreground">
                    <ArrowDownCircle size={32} strokeWidth={1.2} />
                    <p className="text-xs sm:text-sm">No transactions yet.</p>
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
                <div className="flex items-center justify-between px-6 py-3 border-t border-[#d9e4f2]">
                  <span className="text-xs text-muted-foreground">
                    Page <b className="text-foreground">{txnPage}</b> of{" "}
                    <b className="text-foreground">{totalPages}</b>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(-1)}
                      disabled={txnPage === 1}
                      className="bg-white hover:bg-muted text-foreground border-border shadow-none"
                    >
                      <ChevronLeft size={14} className="mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={txnPage >= totalPages}
                      className="bg-white hover:bg-muted text-foreground border-border shadow-none"
                    >
                      Next
                      <ChevronRight size={14} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* View All Activity link */}
              <div className="px-5 py-2.5 border-t border-[#d9e4f2] flex justify-center">
                <Link
                  href="/history"
                  className="text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: HDFC_RED }}
                >
                  View All Activity
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* ── Right: Period Summary Panel ───────────────────────────── */}
            <div className="flex flex-col gap-4">
              <div
                className="rounded-2xl shadow-sm p-4"
                style={{
                  background: "linear-gradient(130deg, #ffffff 0%, #f4f8fd 100%)",
                  border: "1px solid #b7cde6",
                  borderTop: "3px solid #E31837",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "#fdecef" }}
                  >
                    <Star size={14} className="text-destructive" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold leading-tight" style={{ color: HDFC_BLUE }}>Period Summary</h4>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
                    style={{ background: "#fbfdff", borderColor: "#d9e4f2" }}>
                    <span className="text-xs sm:text-sm font-bold text-muted-foreground">This Month</span>
                    {loadingSummary ? (
                      <Skeleton className="h-5 w-16" />
                    ) : (
                      <span className="text-sm sm:text-base font-bold leading-tight" style={{ color: HDFC_BLUE }}>
                        {(summary?.points_this_month ?? 0).toLocaleString()}
                        <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">pts</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
                    style={{ background: "#fbfdff", borderColor: "#d9e4f2" }}>
                    <span className="text-xs sm:text-sm font-bold text-muted-foreground">This Year</span>
                    {loadingSummary ? (
                      <Skeleton className="h-5 w-16" />
                    ) : (
                      <span className="text-sm sm:text-base font-bold leading-tight" style={{ color: HDFC_BLUE }}>
                        {(summary?.points_this_year ?? 0).toLocaleString()}
                        <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">pts</span>
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
