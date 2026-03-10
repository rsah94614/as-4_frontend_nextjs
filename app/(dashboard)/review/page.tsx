"use client"

/**
 * Review Page — Employee-facing
 *
 * Thin orchestrator: all logic lives in useReviewPage,
 * all UI in the feature components under components/features/review/.
 */

import { useReviewPage } from "@/hooks/useReviewPage"
import ReviewComposeForm from "@/components/features/review/ReviewComposeForm"
import ReviewToast from "@/components/features/review/ReviewToast"

export default function ReviewPage() {
  const state = useReviewPage()

  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-[36px] px-8 md:px-10 py-10 max-w-[1200px] mx-auto">

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-gray-900">
            {state.view === "submitted" ? "Review Submitted" : "Write a Review"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {state.view === "submitted"
              ? "Your feedback has been recorded and points credited"
              : "Give honest, constructive feedback to a teammate"}
          </p>
        </div>

        {/* ── Compose Form (always visible) ── */}
        <ReviewComposeForm
          view={state.view}
          allReceivers={state.allReceivers}
          receiverId={state.receiverId}
          onReceiverChange={state.setReceiverId}
          reviewedThisMonth={state.reviewedThisMonth}
          rating={state.rating}
          onRatingChange={state.setRating}
          categories={state.categories}
          categoryIds={state.categoryIds}
          onCategoryIdsChange={state.setCategoryIds}
          comment={state.comment}
          onCommentChange={state.setComment}
          files={state.files}
          onFilesChange={state.setFiles}
          fileRef={state.fileRef}
          submitting={state.submitting}
          onSubmit={state.handleSubmit}
          givenThisMonth={state.givenThisMonth}
          uniquePeopleCount={state.reviewedThisMonth.size}
          totalReviews={state.totalReviews}
          loadingStats={state.loadingData}
          reviews={state.reviews}
          myId={state.myId}
          submittedData={state.submittedData}
          onStartNew={state.startNewReview}
        />
      </div>

      {/* Toast notification */}
      {state.toast && (
        <ReviewToast
          msg={state.toast.msg}
          kind={state.toast.kind}
          onClose={() => state.setToast(null)}
        />
      )}
    </div>
  )
}
