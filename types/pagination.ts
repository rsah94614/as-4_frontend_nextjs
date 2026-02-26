// types/pagination.ts
//
// Shared pagination metadata type used across multiple services
// (department-service, designation-service, etc.).

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}
