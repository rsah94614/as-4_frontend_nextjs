// ─── Entity Types ─────────────────────────────────────────────────────────────

export const ENTITY_TYPES = ["EMPLOYEE", "REVIEW", "TRANSACTION", "REWARD"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

// ─── Status ───────────────────────────────────────────────────────────────────

export interface Status {
    status_id: string;
    status_code: string;
    status_name: string;
    description?: string;
    entity_type: string;
    created_at: string;
    updated_at?: string;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

export interface EntityMeta {
    label: string;
    description: string;
    pill: string;
    header: string;
    dot: string;
    ring: string;
}

export const ENTITY_META: Record<EntityType, EntityMeta> = {
    EMPLOYEE: {
        label: "Employee",
        description: "Statuses that describe an employee's current state (e.g. Active, On Leave, Terminated).",
        pill: "bg-blue-50 text-blue-700 border-blue-200",
        header: "bg-blue-50/50 border-blue-100",
        dot: "bg-blue-400",
        ring: "ring-blue-200",
    },
    REVIEW: {
        label: "Review",
        description: "Statuses assigned to peer reviews (e.g. Pending, Approved, Flagged).",
        pill: "bg-amber-50 text-amber-700 border-amber-200",
        header: "bg-amber-50/50 border-amber-100",
        dot: "bg-amber-400",
        ring: "ring-amber-200",

    },
    TRANSACTION: {
        label: "Transaction",
        description: "Statuses for point transactions and transfers (e.g. Completed, Reversed).",
        pill: "bg-[#EBF2FA] text-[#1E3A5F] border-[#B8CCE0]",
        header: "bg-[#F2F7FC] border-[#C8DCF0]",
        dot: "bg-[#1E3A5F]",
        ring: "ring-[#1E3A5F]/30",
    },
    REWARD: {
        label: "Reward",
        description: "Statuses for redeemable rewards (e.g. Available, Out of Stock, Discontinued).",
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
        header: "bg-emerald-50/50 border-emerald-100",
        dot: "bg-emerald-400",
        ring: "ring-emerald-200",
    },
};
