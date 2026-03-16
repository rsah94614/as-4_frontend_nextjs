"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { createAuthenticatedClient } from "@/lib/api-utils"
import { uploadToStorage } from "@/lib/s3"
import { getTeamMembersForUI, type TeamMember } from "@/services/employee-service"
import { requireAuthenticatedUserId } from "@/lib/api-utils"
import { extractErrorMessage } from "@/lib/error-utils"
import type { Review, ReviewCategory, ViewMode, ToastState, SubmittedReviewData } from "@/types/review-types"

const recognitionClient = createAuthenticatedClient("/api/proxy/recognition")

const ITEMS_PER_PAGE = 6

export interface ReviewPageState {
    myId: string
    reviews: Review[]
    categories: ReviewCategory[]
    teamMembers: TeamMember[]
    teamLeader: TeamMember | null
    totalReviews: number
    page: number
    totalPages: number
    loadingData: boolean
    dataError: string | null
    view: ViewMode
    editingReview: Review | null
    receiverId: string
    setReceiverId: (id: string) => void
    categoryIds: string[]
    setCategoryIds: React.Dispatch<React.SetStateAction<string[]>>
    comment: string
    setComment: (c: string) => void
    files: File[]
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
    fileRef: React.RefObject<HTMLInputElement | null>
    submitting: boolean
    toast: ToastState | null
    setToast: (t: ToastState | null) => void
    listTab: "all" | "given" | "received"
    setListTab: (tab: "all" | "given" | "received") => void
    givenThisMonth: number
    reviewedThisMonth: Set<string>
    filteredReviews: Review[]
    filteredPage: number
    filteredTotalPages: number
    setFilteredPage: (pg: number) => void
    allReceivers: (TeamMember & { isManager: boolean })[]
    openCompose: () => void
    openEdit: (r: Review) => void
    backToList: () => void
    handleSubmit: (e: React.FormEvent) => Promise<void>
    loadReviews: (pg?: number) => Promise<void>
    submittedData: SubmittedReviewData | null
    startNewReview: () => void
}

export function useReviewPage(): ReviewPageState {
    const [myId] = useState<string>(() => {
        try { return requireAuthenticatedUserId() } catch { return "" }
    })

    const [reviews, setReviews] = useState<Review[]>([])
    const [categories, setCategories] = useState<ReviewCategory[]>([])
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [teamLeader, setTeamLeader] = useState<TeamMember | null>(null)
    const [totalReviews, setTotalReviews] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loadingData, setLoadingData] = useState(true)
    const [dataError, setDataError] = useState<string | null>(null)

    const [view, setView] = useState<ViewMode>("compose")
    const [editingReview, setEditingReview] = useState<Review | null>(null)

    const [receiverId, setReceiverId] = useState("")
    const [categoryIds, setCategoryIds] = useState<string[]>([])
    const [comment, setComment] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const fileRef = useRef<HTMLInputElement>(null)

    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState<ToastState | null>(null)
    const [listTab, setListTabRaw] = useState<"all" | "given" | "received">("all")
    const [submittedData, setSubmittedData] = useState<SubmittedReviewData | null>(null)
    const [filteredPage, setFilteredPage] = useState(1)

    // Reset filtered page when tab changes
    const setListTab = useCallback((tab: "all" | "given" | "received") => {
        setListTabRaw(tab)
        setFilteredPage(1)
    }, [])

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const givenThisMonth = reviews.filter(
        (r) => r.reviewer_id === myId && new Date(r.review_at) >= monthStart
    ).length

    const reviewedThisMonth = new Set(
        reviews
            .filter((r) => r.reviewer_id === myId && new Date(r.review_at) >= monthStart)
            .map((r) => r.receiver_id)
    )

    const loadReviews = useCallback(async (pg = 1) => {
        try {
            const res = await recognitionClient.get<{
                data: Review[]
                pagination: { total: number; total_pages: number }
            }>(`/reviews?page=${pg}&page_size=20`)
            setReviews(res.data.data)
            setTotalReviews(res.data.pagination.total)
            setTotalPages(res.data.pagination.total_pages)
            setPage(pg)
            setFilteredPage(1)
        } catch (err) {
            setDataError(extractErrorMessage(err, "Failed to load reviews. Check your connection."))
        }
    }, [])

    useEffect(() => {
        async function init() {
            setLoadingData(true)
            try {
                const [catRes, teamRes] = await Promise.allSettled([
                    recognitionClient.get<{ data: ReviewCategory[] }>(
                        `/review-categories?page=1&page_size=100&active_only=true`
                    ),
                    getTeamMembersForUI(),
                ])
                if (catRes.status === "fulfilled") setCategories(catRes.value.data.data ?? [])
                if (teamRes.status === "fulfilled") {
                    setTeamMembers(teamRes.value.teamMembers)
                    setTeamLeader(teamRes.value.teamLeader)
                }
                await loadReviews(1)
            } finally {
                setLoadingData(false)
            }
        }
        init()
    }, [loadReviews])

    function openCompose() {
        setReceiverId("")
        setCategoryIds([])
        setComment("")
        setFiles([])
        setEditingReview(null)
        setSubmittedData(null)
        setView("compose")
    }

    function startNewReview() {
        openCompose()
    }

    function openEdit(r: Review) {
        setReceiverId(r.receiver_id)
        setCategoryIds(r.category_ids ?? (r.category_id ? [r.category_id] : []))
        setComment(r.comment)
        setFiles([])
        setEditingReview(r)
        setView("edit")
    }

    function backToList() {
        setView("list")
        setEditingReview(null)
    }

    const allReceivers = [
        ...(teamLeader ? [{ ...teamLeader, isManager: true as const }] : []),
        ...teamMembers.map((m) => ({ ...m, isManager: false as const })),
    ]

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (view === "compose" && !receiverId) {
            setToast({ msg: "Select who to review.", kind: "error" })
            return
        }
        if (categoryIds.length === 0) {
            setToast({ msg: "Select at least one recognition category.", kind: "error" })
            return
        }
        if (comment.trim().length < 10) {
            setToast({ msg: "Comment needs at least 10 characters.", kind: "error" })
            return
        }

        setSubmitting(true)
        try {
            let imageUrl: string | undefined, videoUrl: string | undefined
            for (const f of files) {
                const { url } = await uploadToStorage(f)
                if (f.type.startsWith("image") && !imageUrl) imageUrl = url
                if (f.type.startsWith("video") && !videoUrl) videoUrl = url
            }

            if (view === "edit" && editingReview) {
                const patch: Record<string, unknown> = {}
                if (
                    categoryIds.sort().join() !==
                    (editingReview.category_ids ?? [editingReview.category_id])
                        .filter(Boolean)
                        .sort()
                        .join()
                ) patch.category_ids = categoryIds
                if (comment.trim() !== editingReview.comment) patch.comment = comment.trim()
                if (imageUrl) patch.image_url = imageUrl
                if (videoUrl) patch.video_url = videoUrl

                if (Object.keys(patch).length === 0) {
                    setToast({ msg: "No changes to save.", kind: "warning" })
                    setSubmitting(false)
                    return
                }
                await recognitionClient.put(`/reviews/${editingReview.review_id}`, patch)
                setToast({ msg: "Review updated. Points recalculated automatically.", kind: "success" })
            } else {
                await recognitionClient.post(`/reviews`, {
                    receiver_id: receiverId,
                    category_ids: categoryIds,
                    comment: comment.trim(),
                    ...(imageUrl && { image_url: imageUrl }),
                    ...(videoUrl && { video_url: videoUrl }),
                })

                const receiverName = allReceivers.find((r) => r.id === receiverId)?.name ?? "Team Member"
                const selectedCatNames = categoryIds
                    .map((id) => categories.find((c) => c.category_id === id)?.category_name)
                    .filter((n): n is string => !!n)

                setSubmittedData({
                    receiverName,
                    categoryNames: selectedCatNames,
                    comment: comment.trim(),
                    submittedAt: new Date().toISOString(),
                })
                setToast({ msg: "Review submitted! Points credited to their wallet. 🎉", kind: "success" })
            }

            await loadReviews(1)
            if (view === "compose") {
                setView("submitted")
            } else {
                backToList()
            }
        } catch (err) {
            const detail = extractErrorMessage(err, "Submission failed.");
            setToast({ msg: detail, kind: "error" })
        } finally {
            setSubmitting(false)
        }
    }

    // Filter reviews by tab
    const allFilteredReviews = useMemo(() => {
        return reviews.filter((r) => {
            if (listTab === "given") return r.reviewer_id === myId
            if (listTab === "received") return r.receiver_id === myId
            return true
        })
    }, [reviews, listTab, myId])

    // Client-side pagination of filtered results
    const filteredTotalPages = Math.max(1, Math.ceil(allFilteredReviews.length / ITEMS_PER_PAGE))
    const safePage = Math.min(filteredPage, filteredTotalPages)
    const filteredReviews = allFilteredReviews.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    )

    return {
        myId,
        reviews,
        categories,
        teamMembers,
        teamLeader,
        totalReviews,
        page,
        totalPages,
        loadingData,
        dataError,
        view,
        editingReview,
        receiverId,
        setReceiverId,
        categoryIds,
        setCategoryIds,
        comment,
        setComment,
        files,
        setFiles,
        fileRef,
        submitting,
        toast,
        setToast,
        listTab,
        setListTab,
        givenThisMonth,
        reviewedThisMonth,
        filteredReviews,
        filteredPage: safePage,
        filteredTotalPages,
        setFilteredPage,
        allReceivers,
        openCompose,
        openEdit,
        backToList,
        handleSubmit,
        loadReviews,
        submittedData,
        startNewReview,
    }
}