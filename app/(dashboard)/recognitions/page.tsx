"use client"

import { Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ReviewPage() {
  const teamMembers = [
    {
      name: "Bikash Barman",
      recognition: "Top Performer - Q1",
    },
    {
      name: "Rajesh Prasad",
      recognition: "Excellent Collaboration",
    },
    {
      name: "Dipam Nath",
      recognition: "Innovation Award",
    },
    {
      name: "Bikash Barman",
      recognition: "Customer Champion",
    },
  ]

  return (
    <div className="flex-1 p-8 bg-gray-100 min-h-screen">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <Input
          placeholder="Search for your favorite collaborator..."
          className="w-1/2 rounded-full bg-white"
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

      {/* Main Content Box */}
      <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">

        {/* Team Section */}
        <h2 className="text-xl font-semibold mb-6">Your Team:</h2>

        <div className="grid grid-cols-4 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="rounded-xl shadow-sm hover:shadow-md transition"
            >
              <CardContent className="flex flex-col items-center p-6 space-y-3">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <p className="font-medium text-center">
                  {member.name}
                </p>

                {/* Recognition Badge */}
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {member.recognition}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Leader */}
        <h2 className="text-xl font-semibold mb-6">Team Leader:</h2>

        <Card className="w-64 rounded-xl shadow-sm">
          <CardContent className="flex flex-col items-center p-6 space-y-3">
            <Avatar className="h-16 w-16">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            <p className="font-medium">John Doe</p>

            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Leadership Excellence Award
            </span>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
