"use client"

import { useReviewPage } from "@/hooks/useReviewPage"
import { useReviewerWeight } from "@/hooks/useReviewerWeight"
import ReviewComposeForm from "@/components/features/review/ReviewComposeForm"
import ReviewListSection from "@/components/features/review/ReviewListSection"
import ReviewToast from "@/components/features/review/ReviewToast"
import ReviewPageSkeleton from "@/components/features/review/ReviewPageSkeleton"

export default function ReviewPage() {
  const state = useReviewPage()
  const { weight: reviewerWeight } = useReviewerWeight()

  return (
    <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0_10px_50px_rgba(0,0,0,0.04)] overflow-hidden min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] transition-all">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 md:px-10 py-6 sm:py-7">
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-[26px] font-extrabold leading-tight tracking-tight px-0.5" style={{ color: '#004C8F' }}>
              Employee Recognition
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium px-0.5">
              Recognise teammates · Points credited automatically
            </p>
          </div>
          <span className="hidden md:flex items-center text-2xl font-black tracking-tighter select-none opacity-90">
            <span style={{ color: '#E31837' }}>A</span>
            <span style={{ color: '#004C8F' }}>abhar</span>
          </span>
        </div>
      </div>




      {/* ── Main content ── */}
      <div className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 w-full">

        {state.loadingData && state.categories.length === 0 ? (
          <ReviewPageSkeleton />
        ) : (
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
            submittedData={state.submittedData}
            onStartNew={state.startNewReview}
            reviewerWeight={reviewerWeight}
            onToast={state.setToast}
          />
        )}

        <div className="my-8 sm:my-10 flex items-center gap-4">
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
          page={state.filteredPage}
          totalPages={state.filteredTotalPages}
          onCompose={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          onLoadReviews={state.setFilteredPage}
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
