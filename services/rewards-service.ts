// services/rewards-service.ts
// All requests routed through Next.js proxy — no direct microservice URLs in browser.

import { extractErrorMessage } from "@/lib/error-utils";
import { rewardsClient, walletClient } from "@/services/api-clients";
import type {
    CategoryInfo,
    WalletData,
    RedemptionResponse,
    PaginatedCatalogResponse,
} from "@/types/redeem-types";
import type {
    Category,
    RewardItem,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "@/types/reward-types";



// ── User-facing catalog ───────────────────────────────────────────────────────

export async function fetchCatalog(page = 1, size = 20): Promise<PaginatedCatalogResponse> {
    try {
        // Fetch with active_only=false to bypass stale backend cache,
        // then filter active items client-side for accurate results.
        const res = await rewardsClient.get<PaginatedCatalogResponse>(
            `/catalog?active_only=false&page=1&size=100`
        );
        const raw = res.data;

        // Client-side active filter
        const activeItems = raw.data.filter((item: any) => item.is_active === true);
        const total = activeItems.length;
        const totalPages = Math.ceil(total / size) || 1;
        const start = (page - 1) * size;
        const pageItems = activeItems.slice(start, start + size);

        return {
            data: pageItems,
            pagination: {
                current_page: page,
                per_page: size,
                total,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_previous: page > 1,
            },
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to load catalog"));
    }
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
    try {
        const res = await rewardsClient.get<CategoryInfo[]>(`/categories?active_only=true`);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to load categories"));
    }
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export async function fetchWallet(employeeId: string): Promise<WalletData> {
    try {
        const res = await walletClient.get<WalletData>(`/employees/${employeeId}`);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to load wallet"));
    }
}

export async function redeemReward(
    walletId: string,
    catalogId: string,
    points: number,
    comment?: string,
): Promise<RedemptionResponse> {
    try {
        const res = await rewardsClient.post<RedemptionResponse>(`/redeem`, {
            wallet_id: walletId,
            catalog_id: catalogId,
            points,
            comment: comment || null,
        });
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Redemption failed"));
    }
}

// ── Admin catalog management ──────────────────────────────────────────────────

export interface AdminCatalogParams {
    page?: number;
    size?: number;
    active_only?: boolean;
}

export async function fetchAdminCatalog(params: AdminCatalogParams = {}): Promise<PaginatedCatalogResponse> {
    try {
        const { page = 1, size = 12, active_only } = params;

        let url = `/catalog?page=${page}&size=${size}`;
        if (active_only !== undefined) {
            url += `&is_active=${active_only}`;
        }

        const res = await rewardsClient.get<PaginatedCatalogResponse>(url);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to load catalog"));
    }
}

export interface CreateCatalogItemPayload {
    reward_name: string;
    reward_code: string;
    description: string;
    category_id: string;
    default_points: number;
    min_points: number;
    max_points: number;
    available_stock: number;
}

export async function createCatalogItem(payload: CreateCatalogItemPayload): Promise<RewardItem> {
    try {
        const res = await rewardsClient.post<RewardItem>(`/catalog`, payload);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to create reward"));
    }
}

export interface UpdateCatalogItemPayload {
    reward_name?: string;
    description?: string;
    default_points?: number;
    min_points?: number;
    max_points?: number;
    is_active?: boolean;
}

export async function updateCatalogItem(catalogId: string, payload: UpdateCatalogItemPayload): Promise<RewardItem> {
    try {
        const res = await rewardsClient.patch<RewardItem>(`/catalog/${catalogId}`, payload);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to update reward"));
    }
}

export async function restockCatalogItem(catalogId: string, amount: number): Promise<RewardItem> {
    try {
        const res = await rewardsClient.patch<RewardItem>(`/catalog/${catalogId}/stock`, { amount });
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to restock reward"));
    }
}

// ── Admin category management ─────────────────────────────────────────────────

export async function fetchAdminCategories(): Promise<Category[]> {
    try {
        const res = await rewardsClient.get<Category[]>(`/categories`);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to load categories"));
    }
}

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
    try {
        const res = await rewardsClient.post<Category>(`/categories`, payload);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to create category"));
    }
}

export async function updateCategory(categoryId: string, payload: UpdateCategoryPayload): Promise<Category> {
    try {
        const res = await rewardsClient.patch<Category>(`/categories/${categoryId}`, payload);
        return res.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, "Failed to update category"));
    }
}
