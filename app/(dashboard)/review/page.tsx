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
import { Star, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function RecognitionsPage() {
  const [rating, setRating] = useState(0)

  const teamMembers = [
    "Bikash Barman",
    "Rajesh Prasad",
    "Dipam Nath",
    "Bikash Barman",
  ]

  return (
    <div className="flex-1 p-6 md:p-10 bg-gray-100 min-h-screen">

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <Input
          placeholder="Search for your favorite collaborator..."
          className="w-full md:w-1/2 rounded-full bg-white h-11"
        />

        <div className="flex items-center gap-6">
          <Bell className="text-gray-600 cursor-pointer" />
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>GH</AvatarFallback>
            </Avatar>
            <span className="font-medium">Gautam Hazarika</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 rounded-3xl p-6 md:p-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-8">Your Team:</h2>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

          {teamMembers.map((member, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer rounded-2xl shadow-sm hover:shadow-lg transition duration-300">
                  <CardContent className="flex flex-col items-center p-8 space-y-4">

                    {/* Bigger Avatar */}
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-lg">
                        {member.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <p className="font-medium text-lg text-center">
                      {member}
                    </p>

                  </CardContent>
                </Card>
              </DialogTrigger>

              {/* Modal */}
              <DialogContent className="w-[95%] sm:max-w-2xl rounded-3xl p-8">

                <DialogTitle className="text-center text-xl font-semibold mb-6">
                  Write a Review
                </DialogTitle>

                <div className="flex flex-col items-center space-y-6">

                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-xl">
                      {member.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-xl font-semibold">
                    {member}
                  </h3>

                  {/* Rating */}
                  <div className="w-full">
                    <p className="font-medium mb-3 text-lg">
                      Rate your colleague
                    </p>

                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-8 h-8 cursor-pointer transition ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review */}
                  <div className="w-full">
                    <p className="font-medium mb-3 text-lg">
                      Write a review
                    </p>

                    <Textarea
                      placeholder="Write a review here..."
                      className="rounded-2xl min-h-[120px]"
                    />
                  </div>

                  {/* Tags + Submit */}
                  <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full">
                        Teamwork
                      </span>
                      <span className="text-sm bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full">
                        Collaboration
                      </span>
                    </div>

                    <Button className="rounded-full px-8 py-2 text-base">
                      Submit
                    </Button>
                  </div>

                </div>

              </DialogContent>
            </Dialog>
          ))}

        </div>
      </div>
    </div>
  )
}
