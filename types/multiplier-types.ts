export const QUARTERS = [1, 2, 3, 4] as const;
export type Quarter = (typeof QUARTERS)[number];

export interface Multiplier {
    seasonal_multiplier_id: string;
    quarter: Quarter;
    label: string;
    multiplier: string;
    effective_from?: string;
    effective_to?: string;
    created_at: string;
}

export type MultiplierStatus = "active" | "upcoming" | "past" | "undated";

export interface MultiplierFormState {
    quarter: Quarter;
    label: string;
    multiplier: string;
    effective_from: string;
    effective_to: string;
}

export interface MultiplierUpdateState {
    label: string;
    multiplier: string;
    effective_from: string;
    effective_to: string;
}
