"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Bell, Paperclip, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { teamMembers, teamLeader, loggedInUser } from "./data"

/**
 * ReviewPage Component
 * 
 * A responsive team review page that allows users to:
 * - View team members and team leader
 * - Rate colleagues (1-5 stars)
 * - Write reviews
 * - Attach files (photos/videos)
 * - Add custom tags
 * 
 * Responsive breakpoints:
 * - Mobile: < 640px (1 column)
 * - Tablet: 640px - 1024px (2 columns)
 * - Desktop: > 1024px (4 columns)
 */
export default function ReviewPage() {
  // State management
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState<string[]>(["Teamwork", "Collaboration"])
  const [newTag, setNewTag] = useState("")

  /**
   * Adds a new tag if it's not empty and doesn't already exist
   */
  const addTag = () => {
    if (newTag.trim() !== "" && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  /**
   * Removes a tag from the list
   */
  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  /**
   * Handles file upload
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      console.log("Files uploaded:", files)
      // Add your file handling logic here
    }
  }

  return (
    <div className="flex-1 bg-[#f3f4f6] min-h-screen p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Top Navigation Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        {/* Search Input */}
        <Input
          placeholder="Search for your favorite collaborator..."
          className="w-full sm:w-[400px] lg:w-[520px] rounded-full bg-white h-10 sm:h-12 shadow-sm"
          aria-label="Search collaborators"
        />

        {/* User Info and Notifications */}
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="text-gray-600 w-5 h-5 sm:w-6 sm:h-6" />
          </Button>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-xs sm:text-sm">
              {loggedInUser.name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="bg-[#f9fafb] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm border border-gray-200">
        {/* Team Members Section */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-10">
            Your Team:
          </h2>

          {/* Responsive Grid: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {teamMembers.map((member) => (
              <Dialog key={member.id}>
                <DialogTrigger asChild>
                  <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition w-full h-[160px] sm:h-[170px] flex justify-center cursor-pointer hover:scale-105 duration-200">
                    <CardContent className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 p-4">
                      <Avatar className="h-14 w-14 sm:h-16 sm:w-16 bg-black text-white">
                        <AvatarFallback className="bg-black text-white">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <p className="font-medium text-sm text-center">
                        {member.name}
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                {/* Review Modal */}
                <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                  <DialogTitle className="text-center text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                    Review: {member.name}
                  </DialogTitle>

                  <div className="flex flex-col space-y-4 sm:space-y-6">
                    {/* Rating Section */}
                    <div>
                      <p className="font-medium mb-2 sm:mb-3 text-base sm:text-lg">
                        Rate your colleague
                      </p>

                      <div className="flex gap-2 sm:gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            onClick={() => setRating(star)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 cursor-pointer transition ${
                              star <= rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-400"
                            }`}
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Text Section */}
                    <div>
                      <p className="font-medium mb-2 sm:mb-3 text-base sm:text-lg">
                        Write a review
                      </p>
                      <Textarea
                        placeholder="Write a review here..."
                        className="rounded-2xl min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                        aria-label="Review text"
                      />
                    </div>

                    {/* File Attachment Section */}
                    <div>
                      <input
                        type="file"
                        id="fileUpload"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,video/*"
                      />

                      <label
                        htmlFor="fileUpload"
                        className="border rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition"
                      >
                        <Paperclip className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
                        <span className="text-xs sm:text-sm text-center">
                          Attach photos and videos
                        </span>
                      </label>
                    </div>

                    {/* Tags Section */}
                    <div>
                      <p className="font-medium mb-2 sm:mb-3 text-base sm:text-lg">
                        Tags
                      </p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Display existing tags */}
                        {tags.map((tag) => (
                          <div
                            key={tag}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm"
                          >
                            <span>{tag}</span>
                            <X
                              className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:scale-110 transition"
                              onClick={() => removeTag(tag)}
                              aria-label={`Remove ${tag} tag`}
                            />
                          </div>
                        ))}

                        {/* Add new tag */}
                        <div className="flex items-center gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addTag()}
                            placeholder="Add tag"
                            className="h-8 sm:h-9 w-24 sm:w-28 text-xs sm:text-sm rounded-full"
                            aria-label="New tag input"
                          />

                          <Button
                            type="button"
                            size="icon"
                            onClick={addTag}
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-lg"
                            aria-label="Add tag"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2 sm:pt-4">
                      <Button className="rounded-full px-6 sm:px-8 w-full sm:w-auto">
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </section>

        {/* Team Leader Section */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
            Team Leader:
          </h2>

          <Card className="rounded-2xl border border-gray-200 shadow-sm w-full sm:w-[240px] h-[160px] sm:h-[170px] flex justify-center">
            <CardContent className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 p-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 bg-black text-white">
                <AvatarFallback className="bg-black text-white">
                  {teamLeader.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <p className="font-medium text-sm text-center">
                {teamLeader.name}
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
