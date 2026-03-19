'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { forgotPassword } from '@/services/auth-service'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  EMAIL_LENGTH_ERROR,
  MAX_EMAIL_LENGTH,
  trimToMaxLength,
  validateAuthEmail,
} from '@/lib/auth-validation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const value = trimToMaxLength(rawValue, MAX_EMAIL_LENGTH)
    const exceededLimit = rawValue.length > MAX_EMAIL_LENGTH
    setEmail(value)
    if (exceededLimit) {
      setTouched(true)
    }
    const emailError = exceededLimit
      ? EMAIL_LENGTH_ERROR
      : touched
        ? validateAuthEmail(value)
        : null
    setError(emailError)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    // Validate email
    const emailError = validateAuthEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const result = await forgotPassword(email)

      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted">
        <div className="w-full max-w-md flex flex-col items-center mt-auto mb-auto">
          {/* Logo */}
          <div className="mb-6">
            <Image
              src="logo.svg"
              alt="HDFC Bank Logo"
              width={240}
              height={80}
              className="object-contain"
            />
          </div>

          <h1 className="text-2xl md:text-3xl text-foreground mb-6">
            Welcome to NetBanking
          </h1>

          <div className="w-full bg-white border border-border rounded-md shadow-sm p-6 md:p-8 max-w-[420px]">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-bold text-center mb-4">
              Check your email
            </h2>
            <p className="text-foreground text-center mb-8">
              We&apos;ve sent a password reset link to <strong className="break-words">{email}</strong>
            </p>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next steps:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal space-y-1">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the reset link in the email</li>
                <li>The link expires in 15 minutes</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setSubmitted(false)
                  setEmail('')
                  setTouched(false)
                }}
                variant="outline"
                className="w-full h-11 rounded-md"
              >
                Send another email
              </Button>

              <Link href="/login" className="block w-full">
                <Button
                  variant="ghost"
                  className="w-full h-11 rounded-md"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pb-4 text-xs text-center text-foreground w-full">
          <span className="text-primary hover:underline cursor-pointer">Secure Login</span> | © HDFC Bank Ltd.
        </div>
      </div>
    )
  }

  // Request form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted">
      <div className="w-full max-w-md flex flex-col items-center mt-auto mb-auto">
        <div className="w-full bg-white border border-border rounded-md shadow-sm p-6 md:p-8 max-w-[420px]">
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
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-3">
            Forgot your password?
          </h2>
          <p className="text-foreground text-center text-sm mb-6">
            No worries! Enter your email and we&apos;ll send you a reset link.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-semibold text-foreground text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setTouched(true)}
                className={`h-11 rounded-md border-border ${error && touched ? 'border-destructive/20 focus-visible:ring-red-500/20' : ''
                  }`}
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md text-base bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending link...
                </span>
              ) : (
                'Send reset link'
              )}
            </Button>

            {/* Back to Login */}
            <div className="pt-2">
              <Link href="/login" className="block w-full">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 rounded-md text-foreground hover:text-blue-600 hover:underline"
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
      <div className="mt-8 pb-4 text-xs text-center text-foreground w-full">
        Secure Login | © HDFC Bank Ltd.
      </div>
    </div>
  )
}
