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
