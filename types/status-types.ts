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
    textColor: string;
    header: string;
    dot: string;
    ring: string;
}

export const ENTITY_META: Record<EntityType, EntityMeta> = {
    EMPLOYEE: {
        label: "Employee",
        description: "Statuses that describe an employee's current state (e.g. Active, On Leave, Terminated).",
        textColor: "text-black-700",
        header: "bg-blue-50/50 border-blue-100",
        ring: "ring-blue-200",
        dot: "bg-blue-500",
    },
    REVIEW: {
        label: "Review",
        description: "Statuses assigned to peer reviews (e.g. Pending, Approved, Flagged).",
        textColor: "text-black-700",
        header: "bg-blue-50/50 border-blue-100",
        ring: "ring-blue-200",
        dot: "bg-blue-500",
    },
    TRANSACTION: {
        label: "Transaction",
        description: "Statuses for point transactions and transfers (e.g. Completed, Reversed).",
        textColor: "text-black-700",
        header: "bg-blue-50/50 border-blue-100",
        ring: "ring-blue-200",
        dot: "bg-blue-500",
    },
    REWARD: {
        label: "Reward",
        description: "Statuses for redeemable rewards (e.g. Available, Out of Stock, Discontinued).",
        textColor: "text-black-700",
        header: "bg-blue-50/50 border-blue-100",
        ring: "ring-blue-200",
        dot: "bg-blue-500",
    },
};
