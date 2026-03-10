// services/redeem-api.ts
// All requests routed through Next.js proxy — no direct microservice URLs in browser.

import { createAuthenticatedClient } from "@/lib/api-utils";
import {
    CategoryInfo,
    WalletData,
    RedemptionResponse,
    PaginatedCatalogResponse,
} from "../types/redeem-types";

// Dedicated clients — base URL must match the proxy path exactly
const rewardsClient = createAuthenticatedClient("/api/proxy/rewards");
const walletClient  = createAuthenticatedClient("/api/proxy/wallet");

const REWARDS_PROXY = "/v1/rewards";
const WALLET_PROXY  = "/v1/wallets";

export async function fetchCatalog(page = 1, size = 20): Promise<PaginatedCatalogResponse> {
    try {
        const res = await rewardsClient.get<PaginatedCatalogResponse>(
            `${REWARDS_PROXY}/catalog?active_only=true&page=${page}&size=${size}`
        );
        return res.data;
    } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        throw new Error(e.response?.data?.detail || "Failed to load catalog");
    }
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
    try {
        const res = await rewardsClient.get<CategoryInfo[]>(
            `${REWARDS_PROXY}/categories?active_only=true`
        );
        return res.data;
    } catch {
        return [];
    }
}

export async function fetchWallet(employeeId: string): Promise<WalletData> {
    try {
        const res = await walletClient.get<WalletData>(
            `${WALLET_PROXY}/employees/${employeeId}`
        );
        return res.data;
    } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        throw new Error(e.response?.data?.detail || "Failed to load wallet");
    }
}

export async function redeemReward(
    walletId:  string,
    catalogId: string,
    points:    number,
    comment?:  string
): Promise<RedemptionResponse> {
    try {
        const res = await rewardsClient.post<RedemptionResponse>(`${REWARDS_PROXY}/redeem`, {
            wallet_id:  walletId,
            catalog_id: catalogId,
            points,
            comment: comment || null,
        });
        return res.data;
    } catch (err: unknown) {
        const e = err as { response?: { data?: { detail?: string } } };
        throw new Error(e.response?.data?.detail || "Redemption failed");
    }
}