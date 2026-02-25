"use client";

/**
 * Review page — Redesigned to match the premium design language
 * used across dashboard, wallet, and redeem pages.
 *
 * Two-column layout on desktop:
 *   Left:  Submit form
 *   Right: Monthly quota card + points reference + past reviews
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  Send,
  MessageSquare,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Image as ImageIcon,
  Video,
  Award,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  submitReview,
  getPointsForRating,
  fetchMonthlyReviewState,
  RATING_LABELS,
  RATING_POINTS_MAP,
  MAX_REVIEWS_PER_MONTH,
  listReviews,
  type SubmitReviewResult,
} from "@/services/review-orchestrator";
import {
  getTeamMembersForUI,
  type TeamMember,
} from "@/services/employee-service";
import type { ReviewResponse } from "@/types/review";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  disabled,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  size?: number;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-1.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => !disabled && setHovered(star)}
          onClick={() => !disabled && onChange(star)}
          className={`transition-all duration-200 select-none
            ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:scale-125"}
          `}
          aria-label={`Rate ${star}`}
        >
          <Star
            size={size}
            className={`transition-all duration-200 ${display >= star
                ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                : "text-slate-200 fill-slate-200"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── PointsBadge ──────────────────────────────────────────────────────────────

function PointsBadge({ rating }: { rating: number }) {
  const pts = getPointsForRating(rating);
  if (rating === 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-200
        ${pts > 0
          ? "bg-violet-500 text-white"
          : "bg-slate-100 text-slate-500"
        }`}
    >
      <Award size={12} />
      {pts > 0 ? `+${pts} pts` : "No points"}
    </span>
  );
}

// ─── TeamMemberSelector ───────────────────────────────────────────────────────

function TeamMemberSelector({
  value,
  onChange,
  teamMembers,
  teamLeader,
  reviewedSet,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  teamMembers: TeamMember[];
  teamLeader: TeamMember | null;
  reviewedSet: Set<string>;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allMembers = [
    ...(teamLeader ? [{ ...teamLeader, isManager: true }] : []),
    ...teamMembers.map((m) => ({ ...m, isManager: false })),
  ];

  const selectedMember = allMembers.find((m) => m.id === value);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full flex items-center gap-3 rounded-2xl border bg-slate-50 px-4 py-3 text-left
          transition-all duration-200 group
          ${open ? "ring-2 ring-indigo-300 border-transparent" : "border-slate-200 hover:border-slate-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {selectedMember ? (
          <>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
              ${selectedMember.isManager ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"}`}>
              {getInitials(selectedMember.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{selectedMember.name}</p>
              <p className="text-xs text-slate-400 truncate">
                {selectedMember.designation || (selectedMember.isManager ? "Manager" : "Team Member")}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-slate-400" />
            </div>
            <span className="text-sm text-slate-400">Select a team member…</span>
          </>
        )}
        <ChevronDown
          size={16}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200
            ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[300px] overflow-y-auto">
          {teamLeader && (
            <>
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
                My Manager
              </div>
              <MemberOption
                member={teamLeader}
                isManager
                reviewed={reviewedSet.has(teamLeader.id)}
                selected={value === teamLeader.id}
                onSelect={() => {
                  if (!reviewedSet.has(teamLeader.id)) {
                    onChange(teamLeader.id);
                    setOpen(false);
                  }
                }}
                getInitials={getInitials}
              />
            </>
          )}
          {teamMembers.length > 0 && (
            <>
              <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
                My Team
              </div>
              {teamMembers.map((m) => (
                <MemberOption
                  key={m.id}
                  member={m}
                  isManager={false}
                  reviewed={reviewedSet.has(m.id)}
                  selected={value === m.id}
                  onSelect={() => {
                    if (!reviewedSet.has(m.id)) {
                      onChange(m.id);
                      setOpen(false);
                    }
                  }}
                  getInitials={getInitials}
                />
              ))}
            </>
          )}
          {allMembers.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">No team members found.</div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberOption({
  member,
  isManager,
  reviewed,
  selected,
  onSelect,
  getInitials,
}: {
  member: TeamMember;
  isManager: boolean;
  reviewed: boolean;
  selected: boolean;
  onSelect: () => void;
  getInitials: (name: string) => string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={reviewed}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
        ${reviewed ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-indigo-50 cursor-pointer"}
        ${selected ? "bg-indigo-50" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0
          ${isManager ? "bg-orange-100 text-orange-600" : "bg-indigo-100 text-indigo-600"}`}
      >
        {getInitials(member.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
        <p className="text-xs text-slate-400 truncate">
          {member.designation || (isManager ? "Manager" : "Team Member")}
        </p>
      </div>
      {reviewed && (
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
          Reviewed
        </span>
      )}
      {isManager && !reviewed && (
        <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex-shrink-0">
          Manager
        </span>
      )}
    </button>
  );
}

// ─── FileChip ─────────────────────────────────────────────────────────────────

function FileChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isVideo = file.type.startsWith("video/");
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${isVideo ? "bg-purple-50" : "bg-blue-50"}`}>
        {isVideo ? (
          <Video size={14} className="text-purple-500" />
        ) : (
          <ImageIcon size={14} className="text-blue-500" />
        )}
      </div>
      <span className="truncate max-w-[120px] text-slate-600 text-xs font-medium">{file.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto text-slate-300 hover:text-red-500 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastKind = "success" | "error" | "warning";
interface ToastState {
  kind: ToastKind;
  title: string;
  body?: string;
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const config: Record<ToastKind, { bg: string; icon: React.ReactNode }> = {
    success: {
      bg: "bg-emerald-600",
      icon: <CheckCircle2 size={20} className="text-white" />,
    },
    error: {
      bg: "bg-red-600",
      icon: <AlertTriangle size={20} className="text-white" />,
    },
    warning: {
      bg: "bg-amber-500",
      icon: <AlertTriangle size={20} className="text-white" />,
    },
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-2xl text-white px-5 py-4 shadow-2xl max-w-sm
        animate-[slideUp_0.3s_ease-out] ${config[toast.kind].bg}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0">{config[toast.kind].icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{toast.title}</p>
          {toast.body && (
            <p className="text-xs opacity-80 mt-0.5">{toast.body}</p>
          )}
        </div>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewResponse }) {
  const pts = getPointsForRating(review.rating);
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment.length > 120;

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Gradient top band */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-violet-500" />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={
                  s <= review.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-200 fill-slate-200"
                }
              />
            ))}
            <span className="text-xs text-slate-400 ml-2">
              {RATING_LABELS[review.rating]}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar size={11} />
            {new Date(review.review_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <p className={`text-sm text-slate-600 leading-relaxed ${!expanded && isLong ? "line-clamp-2" : ""}`}>
          {review.comment}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-500 font-medium mt-1 hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        <div className="flex items-center gap-2 mt-3">
          {pts > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-violet-500 rounded-full px-2.5 py-0.5">
              <Award size={10} />+{pts} pts
            </span>
          )}
          {review.image_url && (
            <a
              href={review.image_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:underline"
            >
              <ImageIcon size={10} /> Image
            </a>
          )}
          {review.video_url && (
            <a
              href={review.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:underline"
            >
              <Video size={10} /> Video
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Success Card ─────────────────────────────────────────────────────────────

function SuccessCard({
  result,
  onDismiss,
}: {
  result: SubmitReviewResult;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={28} className="text-emerald-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Review Submitted!</h3>
      <p className="text-sm text-slate-500 mb-4">Your recognition has been recorded.</p>

      <div className="rounded-xl bg-white border border-slate-100 p-4 mb-4 text-left">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Points credited</span>
          <span className="font-bold text-slate-800">
            {result.walletCreditSuccess ? `+${result.pointsCredited}` : "—"}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Reviews remaining</span>
          <span className="font-bold text-slate-800">{result.reviewsRemaining}</span>
        </div>
        {!result.walletCreditSuccess && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Wallet credit pending — {result.walletCreditError}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white
          hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        Done
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [loggedInUser, setLoggedInUser] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLeader, setTeamLeader] = useState<TeamMember | null>(null);
  const [pastReviews, setPastReviews] = useState<ReviewResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [receiverId, setReceiverId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Submission state ────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<SubmitReviewResult | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Monthly quota ───────────────────────────────────────────────────────────
  const [reviewsUsed, setReviewsUsed] = useState(0);
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());
  const [quotaLoading, setQuotaLoading] = useState(true);

  const refreshMonthlyState = useCallback(async () => {
    setQuotaLoading(true);
    try {
      const state = await fetchMonthlyReviewState();
      setReviewsUsed(state.reviewsUsed);
      setReviewedSet(state.reviewedReceiverIds);
    } catch {
      // Non-fatal
    } finally {
      setQuotaLoading(false);
    }
  }, []);

  // ── Load initial data ───────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoadingData(true);
      setDataError(null);
      try {
        const [teamData, reviewsData] = await Promise.allSettled([
          getTeamMembersForUI(),
          listReviews(1, 20),
        ]);

        if (teamData.status === "fulfilled") {
          setLoggedInUser(teamData.value.loggedInUser);
          setTeamMembers(teamData.value.teamMembers);
          setTeamLeader(teamData.value.teamLeader);
        } else {
          setDataError("Failed to load team data. Please refresh.");
        }

        if (reviewsData.status === "fulfilled") {
          setPastReviews(reviewsData.value.data);
        }

        await refreshMonthlyState();
      } catch {
        setDataError("Something went wrong loading the page.");
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [refreshMonthlyState]);

  // ── File handling ───────────────────────────────────────────────────────────
  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const filtered = selected.filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    setFiles((prev) => [...prev, ...filtered].slice(0, 4));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const freshState = await fetchMonthlyReviewState().catch(() => null);

    if (!freshState?.canSubmit) {
      setToast({
        kind: "warning",
        title: "Monthly limit reached",
        body: `You can submit up to ${MAX_REVIEWS_PER_MONTH} reviews per month. Resets on the 1st.`,
      });
      if (freshState) {
        setReviewsUsed(freshState.reviewsUsed);
        setReviewedSet(freshState.reviewedReceiverIds);
      }
      return;
    }

    if (!receiverId) {
      setToast({ kind: "error", title: "Please select a team member to review." });
      return;
    }

    if (freshState.reviewedReceiverIds.has(receiverId)) {
      setToast({
        kind: "warning",
        title: "Already reviewed",
        body: "You've already reviewed this person this month.",
      });
      setReviewedSet(freshState.reviewedReceiverIds);
      return;
    }

    if (rating === 0) {
      setToast({ kind: "error", title: "Please select a star rating." });
      return;
    }
    if (comment.trim().length < 10) {
      setToast({ kind: "error", title: "Comment must be at least 10 characters." });
      return;
    }

    setSubmitting(true);
    setLastResult(null);

    try {
      const result = await submitReview({ receiverId, rating, comment, files });
      setLastResult(result);
      await refreshMonthlyState();
      setPastReviews((prev) => [result.review, ...prev]);

      setRating(0);
      setComment("");
      setFiles([]);
      setReceiverId("");

      setToast({
        kind: result.walletCreditSuccess ? "success" : "warning",
        title: result.walletCreditSuccess
          ? "Review submitted!"
          : "Review saved, but wallet credit failed.",
        body: result.walletCreditSuccess
          ? result.pointsCredited > 0
            ? `+${result.pointsCredited} points credited to their wallet.`
            : "Review saved. No points for this rating."
          : result.walletCreditError ?? "Please contact support.",
      });
    } catch (err) {
      setToast({
        kind: "error",
        title: "Submission failed",
        body: err instanceof Error ? err.message : "Unexpected error.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Derived ───────────────────────────────────────────────────────────────
  const limitReached = !quotaLoading && reviewsUsed >= MAX_REVIEWS_PER_MONTH;
  const selectedAlreadyReviewed = !!receiverId && reviewedSet.has(receiverId);
  const reviewsRemaining = MAX_REVIEWS_PER_MONTH - reviewsUsed;
  const quotaPct = (reviewsUsed / MAX_REVIEWS_PER_MONTH) * 100;

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="bg-white rounded-2xl md:rounded-[36px] min-h-[80vh] shadow-sm">
        <div className="p-6 md:p-10">
          <Skeleton className="h-8 w-60 mb-2" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <Skeleton className="h-[420px] rounded-2xl" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (dataError) {
    return (
      <div className="bg-white rounded-2xl md:rounded-[36px] min-h-[60vh] flex items-center justify-center shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <p className="text-slate-700 font-medium">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl md:rounded-[36px] min-h-[80vh] shadow-sm">
      <div className="p-6 md:p-10">
        {/* Toast */}
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Sparkles size={20} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Recognise a Teammate</h1>
              <p className="text-sm text-slate-400">
                Submit a review to reward your colleagues with points.
              </p>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── LEFT: Submit Form ─────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {/* Success result */}
            {lastResult && (
              <div className="mb-6">
                <SuccessCard result={lastResult} onDismiss={() => setLastResult(null)} />
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className={`rounded-3xl bg-white border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col gap-6
                ${limitReached ? "opacity-60 pointer-events-none select-none" : ""}`}
            >
              {limitReached && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 font-medium flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Monthly limit reached</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      You&apos;ve used all {MAX_REVIEWS_PER_MONTH} reviews. Quota resets on the 1st.
                    </p>
                  </div>
                </div>
              )}

              {/* Team member selector */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Who are you reviewing?
                </label>
                <TeamMemberSelector
                  value={receiverId}
                  onChange={setReceiverId}
                  teamMembers={teamMembers}
                  teamLeader={teamLeader}
                  reviewedSet={reviewedSet}
                  disabled={submitting || quotaLoading}
                />
                {selectedAlreadyReviewed && (
                  <p className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
                    <AlertTriangle size={12} /> You&apos;ve already reviewed this person this month.
                  </p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-3">
                  Rating
                </label>
                <div className="flex items-center gap-4 flex-wrap">
                  <StarRating value={rating} onChange={setRating} disabled={submitting} />
                  {rating > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-500">{RATING_LABELS[rating]}</span>
                      <PointsBadge rating={rating} />
                    </div>
                  )}
                </div>
                {rating > 0 && getPointsForRating(rating) === 0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    Ratings below 3 stars award no points.
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Comment</label>
                  <span className="text-xs text-slate-400">
                    {comment.trim().length}/2000
                  </span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={submitting}
                  placeholder="Share specific feedback about this person's work… (min 10 chars)"
                  rows={4}
                  maxLength={2000}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
                    text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2
                    focus:ring-indigo-300 focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* File attachments */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Attachments
                  <span className="text-slate-400 font-normal ml-1">(optional)</span>
                </label>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {files.map((f, i) => (
                      <FileChip key={i} file={f} onRemove={() => removeFile(i)} />
                    ))}
                  </div>
                )}
                {files.length < 4 && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileAdd}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                      className="flex items-center gap-2 text-sm text-indigo-600 font-medium border border-dashed border-indigo-200 rounded-xl
                        px-4 py-2.5 hover:bg-indigo-50 transition-colors"
                    >
                      <Upload size={14} />
                      Add image or video
                    </button>
                  </>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || limitReached || selectedAlreadyReviewed || quotaLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3.5 text-sm
                  hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting…
                  </>
                ) : quotaLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Checking quota…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Quota + Points Ref + Past Reviews ──────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Monthly quota card */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <MessageSquare size={16} className="text-indigo-600" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Monthly Reviews</p>
              </div>

              {quotaLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ) : (
                <>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <p className="text-3xl font-bold text-slate-800">
                        {reviewsUsed}
                        <span className="text-sm font-normal text-slate-400 ml-1">
                          / {MAX_REVIEWS_PER_MONTH}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">used this month</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full
                        ${reviewsRemaining === 0
                          ? "bg-red-100 text-red-600"
                          : "bg-emerald-100 text-emerald-700"
                        }`}
                    >
                      {reviewsRemaining === 0 ? "Limit reached" : `${reviewsRemaining} left`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700
                        ${quotaPct >= 100 ? "bg-red-400" : quotaPct >= 80 ? "bg-amber-400" : "bg-indigo-500"}`}
                      style={{ width: `${Math.min(quotaPct, 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Points reference */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Award size={16} className="text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Points per Rating</p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div
                    key={star}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 transition-all
                      ${rating === star ? "bg-indigo-50 border border-indigo-200" : "bg-white border border-slate-100"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={
                            s <= star
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-200 fill-slate-200"
                          }
                        />
                      ))}
                      <span className="text-xs text-slate-400 ml-1">{RATING_LABELS[star]}</span>
                    </div>
                    <span
                      className={`text-xs font-bold ${RATING_POINTS_MAP[star] > 0 ? "text-emerald-600" : "text-slate-400"
                        }`}
                    >
                      {RATING_POINTS_MAP[star] > 0 ? `+${RATING_POINTS_MAP[star]} pts` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Past reviews */}
            {pastReviews.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <MessageSquare size={16} className="text-slate-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Recent Reviews</p>
                  <span className="text-xs text-slate-400 ml-auto">{pastReviews.length} total</span>
                </div>
                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {pastReviews.map((r) => (
                    <ReviewCard key={r.review_id} review={r} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for reviews */}
            {pastReviews.length === 0 && !loadingData && (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare size={20} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-slate-400 font-medium">No reviews yet</p>
                <p className="text-xs text-slate-400 mt-1">Your submitted reviews will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}