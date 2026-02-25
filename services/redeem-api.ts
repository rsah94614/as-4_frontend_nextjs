import { fetchWithAuth } from "@/services/auth-service";
import {
  RewardItem,
  CategoryInfo,
  WalletData,
  RedemptionResponse,
  PaginatedCatalogResponse,
} from "../types/redeem-types";

const REWARDS_API =
  process.env.NEXT_PUBLIC_REWARDS_API_URL || "http://localhost:8006";

const WALLET_API =
  process.env.NEXT_PUBLIC_WALLET_API_URL || "http://localhost:8004";

export async function fetchCatalog(): Promise<RewardItem[]> {
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

export async function fetchCategories(): Promise<CategoryInfo[]> {
  const res = await fetchWithAuth(
    `${REWARDS_API}/v1/rewards/categories?active_only=true`
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchWallet(
  employeeId: string
): Promise<WalletData> {
  const res = await fetchWithAuth(
    `${WALLET_API}/v1/wallets/employees/${employeeId}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load wallet");
  }
  return res.json();
}

export async function redeemReward(
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