"use client";

/**
 * Wallet page — replaces mock data with live API calls.
 *
 * Endpoints used (wallet service at NEXT_PUBLIC_WALLET_API_URL = http://localhost:8004):
 *   GET /v1/wallets/employees/{employee_id}   → WalletResponse
 *   GET /v1/wallets/{wallet_id}/points-summary → { points_this_month, points_this_year }
 *   GET /v1/transactions?wallet_id=&page=&limit= → TransactionListResponse
 *
 * Auth token is read from localStorage via auth.getAccessToken().
 * No backend files were modified.
 */

import { useState, useEffect, useCallback } from "react";
import { Gift, Ticket, RefreshCw, ChevronLeft, ChevronRight, ArrowDownCircle } from "lucide-react";
import { auth, fetchWithAuth } from "@/services/auth-service";

// ─── Env ──────────────────────────────────────────────────────────────────────

const WALLET_API =
  process.env.NEXT_PUBLIC_WALLET_API_URL || "http://localhost:8004";

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

// ─── Fetchers ─────────────────────────────────────────────────────────────────

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

async function fetchPointsSummary(walletId: string): Promise<PointsSummary> {
  const res = await fetchWithAuth(
    `${WALLET_API}/v1/wallets/${walletId}/points-summary`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load points summary");
  }
  return res.json();
}

async function fetchTransactions(
  walletId: string,
  page: number,
  limit: number
): Promise<TransactionListResponse> {
  const params = new URLSearchParams({
    wallet_id: walletId,
    page: String(page),
    limit: String(limit),
  });
  const res = await fetchWithAuth(
    `${WALLET_API}/v1/transactions?${params.toString()}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load transactions");
  }
  return res.json();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  subValue,
  variant = "white",
}: {
  label: string;
  value: string | number;
  sub?: string;
  subValue?: string | number;
  variant?: "white" | "green" | "indigo";
}) {
  const bg = {
    white: "bg-white border border-gray-100 shadow-sm",
    green: "bg-green-200/60 border border-green-200/40",
    indigo: "bg-indigo-200/60 border border-indigo-200/40",
  }[variant];

  return (
    <div className={`rounded-2xl p-6 ${bg}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="text-3xl font-semibold mt-2 text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h2>
      {sub && (
        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <span>{sub}</span>
          <span>
            {typeof subValue === "number"
              ? subValue.toLocaleString()
              : subValue}
          </span>
        </div>
      )}
    </div>
  );
}

function MonthYearCard({
  monthPoints,
  yearPoints,
}: {
  monthPoints: number;
  yearPoints: number;
}) {
  return (
    <div className="rounded-2xl p-6 bg-indigo-200/60 border border-indigo-200/40">
      <div className="flex flex-col gap-4 text-sm text-gray-700">
        <div>
          <p>This month</p>
          <p className="text-xl font-semibold text-gray-900">
            {monthPoints.toLocaleString()}
          </p>
        </div>
        <div>
          <p>This year</p>
          <p className="text-xl font-semibold text-gray-900">
            {yearPoints.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ txn }: { txn: Transaction }) {
  const isCredit = txn.transaction_type.is_credit;

  return (
    <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 group hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${isCredit ? "bg-green-100" : "bg-red-50"}`}
        >
          {isCredit ? (
            <Gift size={15} className="text-green-600" />
          ) : (
            <Ticket size={15} className="text-red-500" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-gray-800 truncate">
            {txn.description || txn.transaction_type.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(txn.transaction_at)} · {formatTime(txn.transaction_at)}
            {txn.reference_number && (
              <span className="ml-2 font-mono opacity-60">
                #{txn.reference_number.slice(0, 16)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end flex-shrink-0 ml-4">
        <p
          className={`text-sm font-semibold ${isCredit ? "text-green-600" : "text-red-500"
            }`}
        >
          {isCredit ? "+" : "-"}
          {txn.amount.toLocaleString()}
        </p>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full mt-1 font-medium
            ${txn.status.code === "SUCCESS"
              ? "bg-green-100 text-green-700"
              : txn.status.code === "FAILED"
                ? "bg-red-100 text-red-600"
                : "bg-amber-100 text-amber-700"
            }`}
        >
          {txn.status.name}
        </span>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-xl ${className}`}
    />
  );
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

      // Fetch points summary in parallel now we have wallet_id
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
    // scroll transactions section into view smoothly
    document
      .getElementById("txn-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* ── Top Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Lifetime / Total earned */}
        {loadingWallet ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </>
        ) : walletError ? (
          <div className="col-span-3">
            <ErrorBanner message={walletError} onRetry={loadWallet} />
          </div>
        ) : wallet ? (
          <>
            <StatCard
              label="Lifetime Points"
              value={wallet.total_earned_points}
              sub="Redeemed"
              subValue={wallet.redeemed_points}
              variant="white"
            />

            <StatCard
              label="Redeemable"
              value={wallet.available_points}
              variant="green"
            />

            <MonthYearCard
              monthPoints={summary?.points_this_month ?? 0}
              yearPoints={summary?.points_this_year ?? 0}
            />
          </>
        ) : null}

      </div>

      {/* ── Recent Transactions ───────────────────────────────────────────── */}
      <div
        id="txn-section"
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Transactions
            </h3>
            {txnData && (
              <p className="text-xs text-gray-400 mt-0.5">
                {txnData.total.toLocaleString()} total
              </p>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              if (wallet?.wallet_id) {
                loadTransactions(wallet.wallet_id, txnPage);
              }
            }}
            disabled={loadingTxns || !wallet}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={13}
              className={loadingTxns ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Transaction error */}
        {txnError && (
          <div className="mb-4">
            <ErrorBanner
              message={txnError}
              onRetry={() =>
                wallet && loadTransactions(wallet.wallet_id, txnPage)
              }
            />
          </div>
        )}

        {/* Transaction list */}
        <div className="flex flex-col gap-4">
          {loadingTxns ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))
          ) : txnData?.transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-gray-400">
              <ArrowDownCircle size={32} strokeWidth={1.2} />
              <p className="text-sm">No transactions yet.</p>
            </div>
          ) : (
            txnData?.transactions.map((txn) => (
              <TransactionRow key={txn.transaction_id} txn={txn} />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loadingTxns && txnData && txnData.total > TXN_PAGE_SIZE && (
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
            <button
              onClick={() => handlePageChange(-1)}
              disabled={txnPage === 1}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800
                disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="text-sm text-gray-400">
              Page{" "}
              <b className="text-gray-700">{txnPage}</b>{" "}
              of{" "}
              <b className="text-gray-700">{totalPages}</b>
            </span>

            <button
              onClick={() => handlePageChange(1)}
              disabled={txnPage >= totalPages}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800
                disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}