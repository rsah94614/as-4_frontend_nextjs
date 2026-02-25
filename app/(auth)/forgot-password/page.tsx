'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  // Email validation
  const validateEmail = (email: string): string | null => {
    if (!email) {
      return 'Email address is required'
    }

    const strictSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!strictSyntax.test(email)) {
      return 'Please enter a valid email address'
    }

    return null
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touched) {
      const emailError = validateEmail(value)
      setError(emailError)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    // Validate email
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8001/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
      } else {
        // Handle error response
        if (data.error?.message) {
          setError(data.error.message)
        } else {
          setError('Failed to send reset email. Please try again.')
        }
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="rounded-3xl shadow-lg">
            <CardContent className="p-8 md:p-12">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/Logo.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="rounded-2xl"
                />
              </div>

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
              <p className="text-gray-600 text-center mb-8">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
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
                  className="w-full h-12 rounded-full"
                >
                  Send another email
                </Button>

                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Request form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="rounded-3xl shadow-lg">
          <CardContent className="p-8 md:p-12">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/Logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="rounded-2xl"
              />
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-3">
              Forgot your password?
            </h2>
            <p className="text-gray-600 text-center mb-8">
              No worries! Enter your email and we&apos;ll send you a reset link.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setTouched(true)}
                  className={`h-12 rounded-full ${error && touched ? 'border-red-500 focus-visible:ring-red-500/20' : ''
                    }`}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full text-base bg-primary hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending reset link...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </Button>

              {/* Back to Login */}
              <Link href="/login">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-12 rounded-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
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