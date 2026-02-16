'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<{
    newPassword?: string
    confirmPassword?: string
    general?: string
  }>({})
  const [touched, setTouched] = useState<{
    newPassword?: boolean
    confirmPassword?: boolean
  }>({})

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setErrors({ general: 'Invalid reset link. Please request a new password reset.' })
    }
  }, [token])

  // Password validation
  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'Password is required'
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }

    // Optional: Add more password requirements
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return 'Password must contain uppercase, lowercase, and numbers'
    }

    return null
  }

  // Confirm password validation
  const validateConfirmPassword = (confirmPwd: string, newPwd: string): string | null => {
    if (!confirmPwd) {
      return 'Please confirm your password'
    }

    if (confirmPwd !== newPwd) {
      return 'Passwords do not match'
    }

    return null
  }

  const handleBlur = (field: 'newPassword' | 'confirmPassword') => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPassword(value)
    if (touched.newPassword) {
      const error = validatePassword(value)
      setErrors(prev => ({ ...prev, newPassword: error || undefined, general: undefined }))
    }
    // Re-validate confirm password if it's been touched
    if (touched.confirmPassword && confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword, value)
      setErrors(prev => ({ ...prev, confirmPassword: confirmError || undefined }))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (touched.confirmPassword) {
      const error = validateConfirmPassword(value, newPassword)
      setErrors(prev => ({ ...prev, confirmPassword: error || undefined, general: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ newPassword: true, confirmPassword: true })

    // Validate all fields
    const newPasswordError = validatePassword(newPassword)
    const confirmPasswordError = validateConfirmPassword(confirmPassword, newPassword)

    if (newPasswordError || confirmPasswordError) {
      setErrors({
        newPassword: newPasswordError || undefined,
        confirmPassword: confirmPasswordError || undefined,
      })
      return
    }

    if (!token) {
      setErrors({ general: 'Invalid reset token. Please request a new password reset.' })
      return
    }

    // Clear errors
    setErrors({})
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8001/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        // Handle error responses
        if (data.error?.message) {
          setErrors({ general: data.error.message })
        } else if (data.detail) {
          setErrors({ general: data.detail })
        } else {
          setErrors({ general: 'Failed to reset password. Please try again.' })
        }
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setErrors({ general: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (success) {
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
                Password reset successful!
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Your password has been successfully reset. You can now log in with your new password.
              </p>

              {/* Auto-redirect notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-blue-800">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>

              {/* Manual redirect button */}
              <Link href="/login">
                <Button className="w-full h-12 rounded-full bg-primary hover:bg-primary/90">
                  Go to login now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Reset form
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
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-3">
              Reset your password
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Enter your new password below
            </p>

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    onBlur={() => handleBlur('newPassword')}
                    className={`h-12 rounded-full pr-12 ${errors.newPassword && touched.newPassword
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : ''
                      }`}
                    disabled={loading || !token}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword && touched.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                )}
                {/* Password requirements hint */}
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`h-12 rounded-full pr-12 ${errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : ''
                      }`}
                    disabled={loading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full h-12 rounded-full text-base bg-primary hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Resetting password...
                  </span>
                ) : (
                  'Reset password'
                )}
              </Button>

              {/* Back to Login */}
              <Link href="/login">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-12 rounded-full"
                  disabled={loading}
                >
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