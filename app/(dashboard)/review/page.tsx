"use client"

/**
 * Review Page — Employee-facing
 *
 * Thin orchestrator: all logic lives in useReviewPage,
 * all UI in the feature components under components/features/review/.
 */

import { Pencil, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useReviewPage } from "@/hooks/useReviewPage"
import ReviewStatsSection from "@/components/features/review/ReviewStatsSection"
import ReviewListSection from "@/components/features/review/ReviewListSection"
import ReviewComposeForm from "@/components/features/review/ReviewComposeForm"
import ReviewToast from "@/components/features/review/ReviewToast"

export default function ReviewPage() {
  const state = useReviewPage()

  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-[36px] px-8 md:px-10 py-10 max-w-[1200px] mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-3">
            {state.view !== "list" && (
              <button
                onClick={state.backToList}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h1 className="text-[22px] font-semibold text-gray-900">
                {state.view === "list"
                  ? "Reviews"
                  : state.view === "edit"
                    ? "Edit Review"
                    : "Write a Review"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {state.view === "list"
                  ? "Recognise colleagues · track your feedback"
                  : state.view === "edit"
                    ? "Update your review"
                    : "Give honest, constructive feedback to a teammate"}
              </p>
            </div>
          </div>

          {state.view === "list" && (
            <Button
              onClick={state.openCompose}
              className="rounded-full bg-purple-700 hover:bg-purple-800 text-white font-medium text-sm
                px-5 py-2.5 h-auto shadow-sm"
            >
              <Pencil size={14} /> Write Review
            </Button>
          )}
        </div>

        {/* ── Stats (list only) ── */}
        {state.view === "list" && (
          <ReviewStatsSection
            givenThisMonth={state.givenThisMonth}
            uniquePeopleCount={state.reviewedThisMonth.size}
            totalReviews={state.totalReviews}
            loading={state.loadingData}
          />
        )}

        {/* ── Compose / Edit Form ── */}
        {(state.view === "compose" || state.view === "edit") && (
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
          />
        )}

        {/* ── List View ── */}
        {state.view === "list" && (
          <ReviewListSection
            filteredReviews={state.filteredReviews}
            myId={state.myId}
            categories={state.categories}
            loadingData={state.loadingData}
            dataError={state.dataError}
            listTab={state.listTab}
            setListTab={state.setListTab}
            page={state.page}
            totalPages={state.totalPages}
            onCompose={state.openCompose}
            onLoadReviews={state.loadReviews}
          />
        )}
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
