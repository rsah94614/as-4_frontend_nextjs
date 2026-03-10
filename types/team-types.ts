export interface Employee {
    employee_id: string;
    username: string;
    email: string;
    designation_id?: string;
    designation_name?: string;
    department_id?: string;
    department_name?: string;
    manager_id?: string;
    is_active: boolean;
    date_of_joining: string;
}

export interface Review {
    review_id: string;
    reviewer_id: string;
    receiver_id: string;
    rating: number;
    comment: string;
    review_at: string;
}

export interface MemberStats {
    avg_rating: number;
    review_count: number;
}

export interface BulkRowResult {
    row: number;
    username?: string;
    email?: string;
    status: "success" | "error";
    error?: string;
    employee_id?: string;
}

export interface BulkImportResult {
    total: number;
    succeeded: number;
    failed: number;
    results: BulkRowResult[];
}
