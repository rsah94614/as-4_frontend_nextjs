import rewardsApiClient from "./rewards-api-client";
import walletApiClient from "./wallet-api-client";
import { extractApiError } from "@/lib/api-utils";
import {
  CategoryInfo,
  WalletData,
  RedemptionResponse,
  PaginatedCatalogResponse,
} from "../types/redeem-types";

export async function fetchCatalog(page = 1, size = 20): Promise<PaginatedCatalogResponse> {
  try {
    const res = await rewardsApiClient.get(
      `/v1/rewards/catalog?active_only=true&page=${page}&size=${size}`
    );
    return res.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Failed to load catalog"));
  }
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  try {
    const res = await rewardsApiClient.get(
      `/v1/rewards/categories?active_only=true`
    );
    return res.data;
  } catch {
    return [];
  }
}

export async function fetchWallet(employeeId: string): Promise<WalletData> {
  try {
    const res = await walletApiClient.get(
      `/v1/wallets/employees/${employeeId}`
    );
    return res.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Failed to load wallet"));
  }
}

export async function redeemReward(
  walletId: string,
  catalogId: string,
  points: number,
  comment?: string
): Promise<RedemptionResponse> {
  try {
    const res = await rewardsApiClient.post(`/v1/rewards/redeem`, {
      wallet_id: walletId,
      catalog_id: catalogId,
      points,
      comment: comment || null,
    });
    return res.data;
  } catch (error) {
    throw new Error(extractApiError(error, "Redemption failed"));
  }
}