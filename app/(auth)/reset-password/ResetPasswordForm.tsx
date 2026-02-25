'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, Lock } from 'lucide-react'
import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-3xl shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="flex justify-center mb-6">
              <Image src="/images/Logo.png" alt="Logo" width={80} height={80} />
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center mb-3">
              Reset your password
            </h2>

            {state.errors.general && (
              <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                {state.errors.general}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handlers.submit()
              }}
              className="space-y-6"
            >
              <div>
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={state.newPassword}
                    onChange={(e) =>
                      handlers.setNewPassword(e.target.value)
                    }
                    disabled={state.loading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showNew ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {state.errors.newPassword && (
                  <p className="text-red-500 text-sm">
                    {state.errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={state.confirmPassword}
                    onChange={(e) =>
                      handlers.setConfirmPassword(e.target.value)
                    }
                    disabled={state.loading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showConfirm ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {state.errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {state.errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={state.loading || !token}
                className="w-full"
              >
                {state.loading ? (
                  <span className="flex gap-2 items-center">
                    <Loader2 className="animate-spin" />
                    Resetting…
                  </span>
                ) : (
                  'Reset password'
                )}
              </Button>

              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to login
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}