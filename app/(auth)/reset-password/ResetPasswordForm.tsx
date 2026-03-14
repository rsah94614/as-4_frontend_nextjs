'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, Lock, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ResetPasswordFormProps {
  token: string | null;
  state: {
    newPassword: string;
    confirmPassword: string;
    loading: boolean;
    errors: { general?: string; newPassword?: string; confirmPassword?: string };
  };
  handlers: {
    setNewPassword: (v: string) => void;
    setConfirmPassword: (v: string) => void;
    submit: () => void;
  };
}

export default function ResetPasswordForm({
  token,
  state,
  handlers,
}: ResetPasswordFormProps) {
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f4f7fb]">
      <div className="w-full bg-white border border-gray-300 rounded-md shadow-sm p-6 md:p-8 max-w-[420px]">
        <div className="w-full max-w-md items-center mt-auto mb-auto">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center">
            <Image
              src="logo.svg"
              alt="HDFC Bank Logo"
              width={240}
              height={80}
              className="object-contain"
            />
          </div>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#0b4a8b]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-6">
            Reset your password
          </h2>

          {state.errors.general && (
            <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{state.errors.general}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handlers.submit()
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-sm">New Password</Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter your New Password"
                  value={state.newPassword}
                  onChange={(e) =>
                    handlers.setNewPassword(e.target.value)
                  }
                  className={`h-11 rounded-md border-gray-300 pr-12 ${state.errors.newPassword ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  disabled={state.loading || !token}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {state.errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {state.errors.newPassword}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-sm">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your Password"
                  value={state.confirmPassword}
                  onChange={(e) =>
                    handlers.setConfirmPassword(e.target.value)
                  }
                  className={`h-11 rounded-md border-gray-300 pr-12 ${state.errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  disabled={state.loading || !token}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {state.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {state.errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={state.loading || !token}
              className="w-full h-11 rounded-md text-base bg-[#0b4a8b] hover:bg-[#093c71] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 cursor-pointer text-white font-medium mt-2"
            >
              {state.loading ? (
                <span className="flex gap-2 items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resetting...
                </span>
              ) : (
                'Reset password'
              )}
            </Button>

            <div className="pt-2">
              <Link href="/login" className="block w-full">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 rounded-md text-gray-600 hover:text-blue-600 hover:underline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pb-4 text-xs text-center text-gray-600 w-full absolute bottom-0">
        Secure Login | © HDFC Bank Ltd.
      </div>
    </div>
  )
}