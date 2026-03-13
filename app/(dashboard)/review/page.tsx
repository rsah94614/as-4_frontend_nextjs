"use client"

import { useReviewPage } from "@/hooks/useReviewPage"
import { useReviewerWeight } from "@/hooks/useReviewerWeight"
import ReviewComposeForm from "@/components/features/review/ReviewComposeForm"
import ReviewListSection from "@/components/features/review/ReviewListSection"

import ReviewToast from "@/components/features/review/ReviewToast"

export default function ReviewPage() {
  const state = useReviewPage()
  const { weight: reviewerWeight } = useReviewerWeight()

  return (
    <div className="flex-1 w-full min-h-screen bg-white">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-8 md:px-10 py-5">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight" style={{ color: '#004C8F' }}>
              Employee Recognition
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Recognise teammates · Points credited automatically
            </p>
          </div>
          {/* Aabhar wordmark — red A, blue abhar */}
          <span className="hidden md:flex items-center text-xl font-black tracking-tight select-none">
            <span style={{ color: '#E31837' }}>A</span>
            <span style={{ color: '#004C8F' }}>abhar</span>
          </span>
        </div>
      </div>

      {/* Red accent line */}
      <div className="h-0.5 shrink-0" style={{ background: '#E31837' }} />

      {/* ── Main content ── */}
      <div className="px-8 md:px-10 py-8 max-w-[1200px] mx-auto">


        <ReviewComposeForm
          view={state.view}
          allReceivers={state.allReceivers}
          receiverId={state.receiverId}
          onReceiverChange={state.setReceiverId}
          reviewedThisMonth={state.reviewedThisMonth}
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
          reviewerWeight={reviewerWeight}
        />

        <div className="my-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Recognition History</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <ReviewListSection
          filteredReviews={state.filteredReviews ?? []}
          myId={state.myId}
          categories={state.categories}
          loadingData={state.loadingData}
          dataError={state.dataError ?? null}
          listTab={state.listTab}
          setListTab={state.setListTab}
          page={state.page}
          totalPages={state.totalPages}
          onCompose={() => state.setView?.("compose")}
          onLoadReviews={state.loadReviews}
        />
      </div>

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