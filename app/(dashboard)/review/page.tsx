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

import {
  teamMembers,
  teamLeader,
  loggedInUser,
} from "./data"

export default function ReviewPage() {
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState<string[]>([
    "Teamwork",
    "Collaboration",
  ])
  const [newTag, setNewTag] = useState("")

  const addTag = () => {
    if (newTag.trim() !== "" && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <div className="flex-1 bg-[#f3f4f6] min-h-screen p-10">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <Input
          placeholder="Search for your favorite collaborator..."
          className="w-[520px] rounded-full bg-white h-12 shadow-sm"
        />

        <div className="flex items-center gap-6">
          <Bell className="text-gray-600 cursor-pointer" />
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>
                {loggedInUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">
              {loggedInUser.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[#f9fafb] rounded-3xl p-10 shadow-sm border border-gray-200">

        <h2 className="text-2xl font-semibold mb-10">
          Your Team:
        </h2>

        <div className="grid grid-cols-4 gap-10">

          {teamMembers.map((member) => (
            <Dialog key={member.id}>
              <DialogTrigger asChild>
                <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition w-[240px] h-[170px] flex justify-center cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center space-y-4">

                    <Avatar className="h-16 w-16 bg-black text-white">
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

              {/* MODAL */}
              <DialogContent className="sm:max-w-2xl rounded-3xl p-8">

                <DialogTitle className="text-center text-xl font-semibold mb-6">
                  {member.name}
                </DialogTitle>

                <div className="flex flex-col space-y-6">

                  {/* Rating */}
                  <div>
                    <p className="font-medium mb-3 text-lg">
                      Rate your colleague..
                    </p>

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

                  {/* Review */}
                  <div>
                    <p className="font-medium mb-3 text-lg">
                      Write a review..
                    </p>
                    <Textarea
                      placeholder="Write a review here.."
                      className="rounded-2xl min-h-[120px]"
                    />
                  </div>

{/* Attach Section */}
<div>
  <input
    type="file"
    id="fileUpload"
    multiple
    className="hidden"
    onChange={(e) => {
      console.log(e.target.files)
    }}
  />

  <label
    htmlFor="fileUpload"
    className="border rounded-2xl p-10 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition"
  >
    <Paperclip className="w-8 h-8 mb-2" />
    <span className="text-sm">
      Attach photos and videos
    </span>
  </label>
</div>



{/* Tags */}
<div>
  <p className="font-medium mb-3 text-lg">
    Tags
  </p>

  <div className="flex flex-wrap items-center gap-3">

    {tags.map((tag) => (
      <div
        key={tag}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm"
      >
        <span className="flex items-center">
          {tag}
        </span>

        <X
          className="w-4 h-4 cursor-pointer"
          onClick={() => removeTag(tag)}
        />
      </div>
    ))}

    {/* Add Tag Input + Button */}
    <div className="flex items-center gap-2">
      <Input
        value={newTag}
        onChange={(e) =>
          setNewTag(e.target.value)
        }
        placeholder="Add tag"
        className="h-9 w-28 text-sm rounded-full"
      />

      <Button
        type="button"
        size="icon"
        onClick={addTag}
        className="h-9 w-9 rounded-full flex items-center justify-center"
      >
        +
      </Button>
    </div>

  </div>
</div>


                  {/* Submit */}
                  <div className="flex justify-end">
                    <Button className="rounded-full px-8">
                      Submit
                    </Button>
                  </div>

                </div>

              </DialogContent>
            </Dialog>
          ))}

        </div>

        {/* Team Leader */}
        <h2 className="text-2xl font-semibold mt-16 mb-8">
          Team Leader:
        </h2>

        <Card className="rounded-2xl border border-gray-200 shadow-sm w-[240px] h-[170px] flex justify-center">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Avatar className="h-16 w-16 bg-black text-white">
              <AvatarFallback className="bg-black text-white">
                {teamLeader.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <p className="font-medium text-sm text-center">
              {teamLeader.name}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
