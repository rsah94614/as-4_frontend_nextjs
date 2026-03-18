export interface WalletData {
    wallet_id: string;
    employee_id: string;
    available_points: number;
    redeemed_points: number;
    total_earned_points: number;
    version?: number;
}

export interface PointsSummary {
    wallet_id: string;
    points_this_month: number;
    points_this_year: number;
}

export interface TransactionStatus {
    status_id: string;
    code: string;
    name: string;
}

export interface TransactionType {
    type_id: string;
    code: string;
    name: string;
    is_credit: boolean;
}

export interface Transaction {
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

export interface TransactionListResponse {
    page: number;
    limit: number;
    total: number;
    transactions: Transaction[];
}
