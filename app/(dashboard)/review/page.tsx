"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Bell, Paperclip, X } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { teamMembers, teamLeader, loggedInUser } from "./data"
import { createReview } from "@/lib/reviewService"

interface ReviewCardProps {
  user: { id: string; name: string }
}

function ReviewCard({ user }: ReviewCardProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const resetForm = () => {
    setRating(0)
    setComment("")
    setFiles([])
    setSubmitError(null)
    setSubmitSuccess(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setSubmitError("Please select a rating")
      return
    }

    if (comment.trim().length < 10) {
      setSubmitError("Comment must be at least 10 characters")
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      formData.append("receiver_id", user.id)
      formData.append("rating", rating.toString())
      formData.append("comment", comment.trim())

      files.forEach((file) => {
        formData.append("attachments", file)
      })

      await createReview(formData)

      setSubmitSuccess(true)

      setTimeout(() => {
        resetForm()
      }, 1500)
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.detail ||
        "Failed to submit review."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition h-[170px] flex justify-center cursor-pointer hover:scale-105 duration-200">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-4">
            <Avatar className="h-16 w-16 bg-black text-white">
              <AvatarFallback>
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="font-medium text-sm">{user.name}</p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-center text-xl font-semibold mb-6">
          Review: {user.name}
        </DialogTitle>

        <div className="flex flex-col space-y-6">

          {/* Rating */}
          <div>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 cursor-pointer transition ${
                    star <= rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-2xl min-h-[120px]"
          />

          {/* Upload Box */}
          <div>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id={`file-upload-${user.id}`}
            />

            <label
              htmlFor={`file-upload-${user.id}`}
              className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition"
            >
              <Paperclip className="w-6 h-6 mb-2" />
              <span className="text-sm">
                Attach photos or videos
              </span>
            </label>
          </div>

          {/* Selected Files with Remove Button */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 rounded-xl px-3 py-2"
                >
                  <span className="text-sm truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles(files.filter((_, i) => i !== index))
                    }
                    className="text-red-500 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {files.map((file, index) => {
                const fileURL = URL.createObjectURL(file)

                if (file.type.startsWith("image")) {
                  return (
                    <img
                      key={index}
                      src={fileURL}
                      alt="preview"
                      className="rounded-xl h-32 object-cover"
                    />
                  )
                }

                if (file.type.startsWith("video")) {
                  return (
                    <video
                      key={index}
                      src={fileURL}
                      controls
                      className="rounded-xl h-32 object-cover"
                    />
                  )
                }

                return null
              })}
            </div>
          )}

          {/* Error / Success */}
          {submitError && (
            <p className="text-red-500 text-sm text-center">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p className="text-green-600 text-sm text-center">
              ✓ Review submitted successfully
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ReviewPage() {
  return (
    <div className="flex-1 bg-gray-100 min-h-screen p-8">
      <header className="flex justify-between mb-8">
        <Input
          placeholder="Search..."
          className="w-[500px] rounded-full h-12"
        />
        <div className="flex items-center gap-6">
          <Button type="button" variant="ghost" size="icon">
            <Bell className="w-6 h-6" />
          </Button>
          <Avatar>
            <AvatarFallback>
              {loggedInUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="bg-white rounded-3xl p-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-10">
          Your Team
        </h2>

        <div className="grid grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <ReviewCard key={member.id} user={member} />
          ))}
        </div>

        <h2 className="text-2xl font-semibold mt-16 mb-8">
          Team Leader
        </h2>

        <div className="w-[240px]">
          <ReviewCard user={teamLeader} />
        </div>
      </main>
    </div>
  )
}
