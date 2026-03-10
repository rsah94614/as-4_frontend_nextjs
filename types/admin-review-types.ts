import { ReviewResponse } from "./review";
import { Employee } from "./team-types";

export interface AdminReviewStats {
    totalReviews: number;
    flaggedTotal: number;
    overallAvg: number;
}

export { type Employee, type ReviewResponse as Review };
