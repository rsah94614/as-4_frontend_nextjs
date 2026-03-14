'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ResetPasswordSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f4f7fb]">
      <div className="w-full max-w-md flex flex-col items-center mt-auto mb-auto">
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/images/Logo.png"
            alt="HDFC Bank Logo"
            width={240}
            height={80}
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl md:text-3xl text-[#333333] mb-6">
          Welcome to NetBanking
        </h1>

        <div className="w-full bg-white border border-gray-300 rounded-md shadow-sm p-6 md:p-8 max-w-[420px] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mt-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-xl font-bold text-center mb-2">
            Password reset successful
          </h2>

          <p className="text-gray-600 text-sm mb-8">
            Redirecting to login...
          </p>

          <Link href="/login" className="w-full">
            <Button className="w-full h-11 rounded-md text-base bg-[#0b4a8b] hover:bg-[#093c71] active:scale-[0.98] transition-all duration-150 text-white font-medium">
              Go to login
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pb-4 text-xs text-center text-gray-600 w-full">
        <span className="text-[#0b4a8b] hover:underline cursor-pointer">Secure Login</span> | © HDFC Bank Ltd.
      </div>
    </div>
  )
}