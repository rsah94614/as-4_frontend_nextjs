'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ResetPasswordSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-3xl shadow-lg">
          <CardContent className="p-8 md:p-12 text-center">
            <Image src="/images/Logo.png" alt="Logo" width={80} height={80} />

            <div className="my-6 flex justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold mb-4">
              Password reset successful
            </h2>

            <p className="text-gray-600 mb-6">
              Redirecting to login…
            </p>

            <Link href="/login">
              <Button className="w-full">Go to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}