'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Mail, LockKeyhole } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const { loginUser, isAuthenticated, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  // Email validation function
  const validateEmail = (email: string): string | null => {
    if (!email) {
      return 'Email address is required'
    }

    // Reject nonsense like just "@" or "a@b"
    const strictSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!strictSyntax.test(email)) {
      return 'Please enter a valid email address'
    }

    return null
  }

  // Password validation function
  const validatePassword = (password: string) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'At least 8 characters required'
    if (!/[A-Z]/.test(password)) return 'Must include uppercase letter'
    if (!/[a-z]/.test(password)) return 'Must include lowercase letter'
    if (!/[0-9]/.test(password)) return 'Must include a number'
    return null
  }

  // Handle field blur to mark as touched
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touched.email) {
      const error = validateEmail(value)
      setErrors(prev => ({ ...prev, email: error || undefined, general: undefined }))
    }
  }

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (touched.password) {
      const error = validatePassword(value)
      setErrors(prev => ({ ...prev, password: error || undefined, general: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ email: true, password: true })

    // Validate all fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined
      })
      return
    }

    // Clear errors
    setErrors({})

    // Start loading
    setLoading(true)

    try {
      const error = await loginUser(email, password)

      if (error) {
        setErrors({ general: error })
      } else {
        // Redirect to dashboard on success
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Don't render the login form while auth state is loading or user is already authenticated
  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#004A8F]">
      <div className="w-full max-w-md mt-auto mb-auto">

        {/* Form Card */}
        <div className="w-full bg-white border border-gray-300 rounded-md mt-10 shadow-sm p-6 md:p-8 max-w-[420px]">
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

          {/* Welcome Text */}
          <h1 className="text-2xl md:text-3xl text-[#333333] text-center">
            Welcome Back To
          </h1>
          <h1 className="flex items-center text-2xl md:text-3xl font-black tracking-tight select-none justify-center mb-6">
            <span style={{ color: '#E31837' }}>A</span>
            <span style={{ color: '#004C8F' }}>abhar</span>
          </h1>
          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-semibold text-gray-700 text-sm">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  className={`h-11 rounded-md border-gray-300 pl-10 ${errors.email && touched.email ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-semibold text-gray-700 text-sm">Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  className={`h-11 rounded-md border-gray-300 pl-10 ${errors.password && touched.password ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-center pt-2">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#11508D] hover:text-[#0b3b6c] hover:underline transition-all duration-200 cursor-pointer"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md text-base bg-[#0b4a8b] hover:bg-[#093c71] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 cursor-pointer text-white font-medium mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pb-4 text-xs text-center text-white w-full">
        Secure Login | © HDFC Bank Ltd.
      </div>
    </div>
  )
}