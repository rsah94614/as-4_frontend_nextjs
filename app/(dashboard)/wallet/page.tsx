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
import { RefreshCw, ChevronLeft, ChevronRight, ArrowDownCircle } from "lucide-react";
import { auth, fetchWithAuth } from "@/services/auth-service";
import { Button } from "@/components/ui/button";

import { WalletData, PointsSummary, TransactionListResponse } from "@/components/features/wallet/types";
import { StatCard, MonthYearCard } from "@/components/features/wallet/WalletStats";
import { TransactionRow } from "@/components/features/wallet/TransactionRow";

// ─── Env ──────────────────────────────────────────────────────────────────────

const WALLET_API =
  process.env.NEXT_PUBLIC_WALLET_API_URL || "http://localhost:8004";

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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (wallet?.wallet_id) {
                loadTransactions(wallet.wallet_id, txnPage);
              }
            }}
            disabled={loadingTxns || !wallet}
            className="text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100 hover:text-indigo-700 shadow-sm transition-all"
          >
            <RefreshCw
              size={14}
              className={`mr-2 ${loadingTxns ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
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
          <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-100 gap-4">
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
              Page {txnPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(-1)}
                disabled={txnPage === 1}
                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={txnPage >= totalPages}
                className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}