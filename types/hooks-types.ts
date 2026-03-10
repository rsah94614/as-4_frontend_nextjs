import type { Dispatch, FormEvent, RefObject, SetStateAction } from "react";
import type {
  Notification,
} from "./notification-types";
import type { Review, ReviewCategory, SubmittedReviewData, ToastState, ViewMode } from "./review-types";
import type { TeamMember } from "./employee-types";

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markOne: (id: string) => Promise<void>;
  markAll: () => Promise<void>;
  reload: () => Promise<void>;
}

export interface ReviewPageState {
  myId: string;
  reviews: Review[];
  categories: ReviewCategory[];
  teamMembers: TeamMember[];
  teamLeader: TeamMember | null;
  totalReviews: number;
  page: number;
  totalPages: number;
  loadingData: boolean;
  dataError: string | null;
  view: ViewMode;
  editingReview: Review | null;
  receiverId: string;
  setReceiverId: (id: string) => void;
  rating: number;
  setRating: (r: number) => void;
  categoryIds: string[];
  setCategoryIds: Dispatch<SetStateAction<string[]>>;
  comment: string;
  setComment: (c: string) => void;
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  fileRef: RefObject<HTMLInputElement | null>;
  submitting: boolean;
  toast: ToastState | null;
  setToast: (t: ToastState | null) => void;
  listTab: "all" | "given" | "received";
  setListTab: (tab: "all" | "given" | "received") => void;
  givenThisMonth: number;
  reviewedThisMonth: Set<string>;
  filteredReviews: Review[];
  allReceivers: (TeamMember & { isManager: boolean })[];
  openCompose: () => void;
  openEdit: (r: Review) => void;
  backToList: () => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  loadReviews: (pg?: number) => Promise<void>;
  submittedData: SubmittedReviewData | null;
  startNewReview: () => void;
}
