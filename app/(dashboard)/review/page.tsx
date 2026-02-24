"use client";

/**
 * Review page.
 *
 * Aligned with review-orchestrator.ts v2:
 *  ✅  getReviewsUsed / getReviewedThisMonth / canSubmitReview / hasAlreadyReviewed
 *      are all async — they hit the backend, not localStorage.
 *  ✅  refreshMonthlyState() is async and awaited everywhere it's called.
 *  ✅  submit-time guards await the orchestrator instead of calling sync stubs.
 *  ✅  Wallet card absent — points live on the Wallet page only.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  submitReview,
  getReviewsUsed,
  getReviewsRemaining,
  canSubmitReview,
  getPointsForRating,
  getReviewedThisMonth,
  fetchMonthlyReviewState,
  RATING_LABELS,
  RATING_POINTS_MAP,
  MAX_REVIEWS_PER_MONTH,
  listReviews,
  type SubmitReviewResult,
} from "@/services/review-orchestrator";
import { getTeamMembersForUI, type TeamMember } from "@/services/employee-service";
import type { ReviewResponse } from "@/types/review";

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          className={`text-3xl leading-none transition-all duration-150 select-none
            ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:scale-110"}
            ${display >= star ? "text-amber-400 drop-shadow-sm" : "text-slate-200"}`}
          aria-label={`Rate ${star}`}
        >
          ★
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
      className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-sm font-semibold
        transition-all duration-200
        ${
          pts > 0
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-slate-100 text-slate-500 border border-slate-200"
        }`}
    >
      <span className="text-base">◆</span>
      {pts > 0 ? `+${pts} pts to receiver` : "No points"}
      {pts > 0 && (
        <span className="text-xs opacity-70">· {RATING_LABELS[rating]}</span>
      )}
    </span>
  );
}

// ─── MonthlyQuotaBar ──────────────────────────────────────────────────────────

function MonthlyQuotaBar({
  used,
  max,
  loading,
}: {
  used: number;
  max: number;
  loading: boolean;
}) {
  const remaining = max - used;
  const pct = (used / max) * 100;
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-4">
      <div className="flex-1">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-medium">Monthly reviews</span>
          {loading ? (
            <span className="text-slate-400 italic">loading…</span>
          ) : (
            <span>
              <b className={remaining === 0 ? "text-red-500" : "text-slate-700"}>
                {used}
              </b>{" "}
              / {max} used
            </span>
          )}
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500
              ${pct >= 100 ? "bg-red-400" : pct >= 80 ? "bg-amber-400" : "bg-emerald-400"}`}
            style={{ width: loading ? "0%" : `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
      {!loading && (
        <div
          className={`text-sm font-semibold whitespace-nowrap
            ${remaining === 0 ? "text-red-500" : "text-emerald-600"}`}
        >
          {remaining === 0 ? "Limit reached" : `${remaining} left`}
        </div>
      )}
    </div>
  );
}

// ─── FileChip ─────────────────────────────────────────────────────────────────

function FileChip({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isVideo = file.type.startsWith("video/");
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
      <span className="text-base">{isVideo ? "🎬" : "🖼️"}</span>
      <span className="truncate max-w-[140px] text-slate-600">{file.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
      >
        ✕
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

  const colors: Record<ToastKind, string> = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    warning: "bg-amber-500",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-xl text-white px-5 py-4 shadow-2xl max-w-sm
        ${colors[toast.kind]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">
          {toast.kind === "success" ? "✅" : toast.kind === "error" ? "❌" : "⚠️"}
        </span>
        <div>
          <p className="font-semibold">{toast.title}</p>
          {toast.body && (
            <p className="text-sm opacity-80 mt-0.5">{toast.body}</p>
          )}
        </div>
        <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewResponse }) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={s <= review.rating ? "text-amber-400" : "text-slate-200"}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {new Date(review.review_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
      <div className="mt-3 flex items-center gap-2">
        <PointsBadge rating={review.rating} />
        {review.image_url && (
          <a
            href={review.image_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-500 hover:underline"
          >
            🖼️ Image
          </a>
        )}
        {review.video_url && (
          <a
            href={review.video_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-500 hover:underline"
          >
            🎬 Video
          </a>
        )}
      </div>
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

  // ── Monthly quota + reviewed pairs — sourced from backend ───────────────────
  const [reviewsUsed, setReviewsUsed] = useState(0);
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());
  const [quotaLoading, setQuotaLoading] = useState(true);

  /**
   * Re-fetch monthly state from the backend and update local UI state.
   * Called once on mount, and again after every successful submission.
   */
  const refreshMonthlyState = useCallback(async () => {
    setQuotaLoading(true);
    try {
      const state = await fetchMonthlyReviewState();
      setReviewsUsed(state.reviewsUsed);
      setReviewedSet(state.reviewedReceiverIds);
    } catch {
      // Non-fatal — quota bar stays in its last known state
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

        // Fetch quota from backend (separate from page data load so quota
        // errors don't block the whole page)
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

    // Re-fetch quota right before submitting so we have the freshest state,
    // rather than trusting potentially-stale UI state.
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
      // Sync UI set with what the server just told us
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

      // Refresh quota bar from backend — result.reviewsRemaining comes from
      // the orchestrator's post-submit re-fetch, but we also update the Set
      // so the dropdown disables the newly-reviewed person immediately.
      await refreshMonthlyState();

      // Prepend new review to list
      setPastReviews((prev) => [result.review, ...prev]);

      // Reset form
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
  const pointsPreview = rating > 0 ? getPointsForRating(rating) : null;

  // ─── Loading / error states ────────────────────────────────────────────────

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-500 font-medium">{dataError}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-indigo-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Toast */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Submit a Review</h1>
        <p className="text-sm text-slate-500 mt-1">
          Recognise your teammates — recognition converts to points in their wallet.
        </p>
      </div>

      {/* Monthly quota bar */}
      <MonthlyQuotaBar
        used={reviewsUsed}
        max={MAX_REVIEWS_PER_MONTH}
        loading={quotaLoading}
      />

      {/* Points reference table */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Points awarded to receiver per rating
        </p>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5"
            >
              <span className="text-amber-400">{"★".repeat(star)}</span>
              <span className="text-slate-300">{"★".repeat(5 - star)}</span>
              <span className="text-xs font-semibold text-slate-600 ml-1">
                {RATING_POINTS_MAP[star] > 0
                  ? `+${RATING_POINTS_MAP[star]} pts`
                  : "No pts"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl bg-white border border-slate-100 shadow-sm p-6 flex flex-col gap-5
          ${limitReached ? "opacity-60 pointer-events-none select-none" : ""}`}
      >
        {limitReached && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
            🚫 You've used all {MAX_REVIEWS_PER_MONTH} reviews this month. Quota resets on the 1st.
          </div>
        )}

        {/* Recipient dropdown */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Who are you reviewing?
          </label>
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            disabled={submitting || quotaLoading}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm
              text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          >
            <option value="">— Select a team member —</option>

            {teamLeader && (
              <optgroup label="My Manager">
                <option
                  value={teamLeader.id}
                  disabled={reviewedSet.has(teamLeader.id)}
                >
                  {teamLeader.name}
                  {teamLeader.designation ? ` · ${teamLeader.designation}` : ""}
                  {reviewedSet.has(teamLeader.id) ? " (reviewed this month)" : ""}
                </option>
              </optgroup>
            )}

            {teamMembers.length > 0 && (
              <optgroup label="My Team">
                {teamMembers.map((m) => (
                  <option
                    key={m.id}
                    value={m.id}
                    disabled={reviewedSet.has(m.id)}
                  >
                    {m.name}
                    {m.designation ? ` · ${m.designation}` : ""}
                    {reviewedSet.has(m.id) ? " (reviewed this month)" : ""}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {selectedAlreadyReviewed && (
            <p className="mt-1.5 text-xs text-amber-600 font-medium">
              ⚠️ You've already reviewed this person this month.
            </p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Rating
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            <StarRating value={rating} onChange={setRating} disabled={submitting} />
            {rating > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{RATING_LABELS[rating]}</span>
                <PointsBadge rating={rating} />
              </div>
            )}
          </div>
          {rating > 0 && pointsPreview === 0 && (
            <p className="text-xs text-slate-400 mt-1">
              Ratings below 3 stars award no points.
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Comment{" "}
            <span className="text-slate-400 font-normal">
              ({comment.trim().length}/2000)
            </span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            placeholder="Share specific feedback about this person's work… (min 10 chars)"
            rows={4}
            maxLength={2000}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm
              text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2
              focus:ring-indigo-300 focus:border-transparent resize-none"
          />
        </div>

        {/* File attachments */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Attachments{" "}
            <span className="text-slate-400 font-normal">(optional · images & videos)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((f, i) => (
              <FileChip key={i} file={f} onRemove={() => removeFile(i)} />
            ))}
          </div>
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
                className="text-sm text-indigo-600 border border-dashed border-indigo-200 rounded-xl
                  px-4 py-2 hover:bg-indigo-50 transition-colors"
              >
                + Add file
              </button>
            </>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || limitReached || selectedAlreadyReviewed || quotaLoading}
          className="w-full rounded-xl bg-indigo-600 text-white font-semibold py-3 text-sm
            hover:bg-indigo-700 active:scale-[0.98] transition-all
            disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : quotaLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Checking quota…
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>

      {/* Last result detail */}
      {lastResult && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm">
          <p className="font-semibold text-emerald-800 mb-1">Review submitted ✓</p>
          <ul className="text-emerald-700 space-y-0.5">
            <li>
              Points credited to receiver:{" "}
              <b>
                {lastResult.walletCreditSuccess
                  ? `+${lastResult.pointsCredited}`
                  : "—"}
              </b>
            </li>
            <li>
              Reviews remaining this month: <b>{lastResult.reviewsRemaining}</b>
            </li>
            {!lastResult.walletCreditSuccess && (
              <li className="text-amber-700">
                ⚠️ Wallet credit pending — {lastResult.walletCreditError}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Past reviews */}
      {pastReviews.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            Recent Reviews
          </h2>
          <div className="flex flex-col gap-3">
            {pastReviews.map((r) => (
              <ReviewCard key={r.review_id} review={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}