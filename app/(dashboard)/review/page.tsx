"use client"

import { useReviewPage } from "@/hooks/useReviewPage"
import { useReviewerWeight } from "@/hooks/useReviewerWeight"
import ReviewComposeForm from "@/components/features/dashboard/review/ReviewComposeForm"
import ReviewListSection from "@/components/features/dashboard/review/ReviewListSection"
import ReviewToast from "@/components/features/dashboard/review/ReviewToast"
import ReviewPageSkeleton from "@/components/features/dashboard/review/ReviewPageSkeleton"

export default function ReviewPage() {
  const state = useReviewPage()
  const { weight: reviewerWeight } = useReviewerWeight()

  return (
    <div className="flex-1 w-full bg-white overflow-hidden min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] transition-all">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-border px-8 md:px-10 py-5">
        <div className="mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-primary leading-tight">
              Employee Recognition
            </h1>
            <p className="text-[14px] text-muted-foreground mt-0.5">
              Recognise teammates · Points credited automatically
            </p>
          </div>
          <span className="hidden lg:flex items-center text-xl font-black tracking-tight select-none shrink-0">
            <span className="text-destructive">A</span>
            <span className="text-primary">abhar</span>
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
          <div className="flex-1 h-px bg-secondary" />
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Recognition History</span>
          <div className="flex-1 h-px bg-secondary" />
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
