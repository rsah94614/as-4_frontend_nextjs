'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})

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

    // Check for @ symbol
    if (!email.includes('@')) {
      return 'Email must contain @ symbol'
    }

    // Reject incomplete emails like "user@"
    const parts = email.split('@')
    if (parts.length !== 2 || !parts[1]) {
      return 'Please enter a complete email address'
    }

    // Reject emails without domain like "user@gmail"
    const domain = parts[1]
    if (!domain.includes('.')) {
      return 'Email must include a domain (e.g., user@gmail.com)'
    }

    // Company lock - reject public emails (optional - can be toggled)
    const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com']
    const COMPANY_LOCK_ENABLED = false // Set to true to enable company email requirement
    if (COMPANY_LOCK_ENABLED && publicDomains.includes(domain.toLowerCase())) {
      return 'Please use your company email address'
    }

    return null
  }

  // Password validation function
  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'Password is required'
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Call login API
      const response = await fetch('http://localhost:8001/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email, // Backend accepts email as username
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - store tokens
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.employee))

        // Optional: Store token expiry
        const expiresAt = Date.now() + (data.expires_in * 1000)
        localStorage.setItem('token_expires_at', expiresAt.toString())

        console.log('Login successful:', data.employee)

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Handle error responses
        if (response.status === 401) {
          setErrors({ general: 'Invalid email or password. Please try again.' })
        } else if (data.error?.message) {
          setErrors({ general: data.error.message })
        } else if (data.detail) {
          setErrors({ general: data.detail })
        } else {
          setErrors({ general: 'Login failed. Please try again.' })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">

        {/* Left Side - Illustration */}
        <div className="hidden md:flex items-center justify-center rounded-3xl overflow-hidden">
          <Image
            src="/images/Gift.png"
            alt="Login Illustration"
            width={500}
            height={500}
            className="object-contain w-full h-auto"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="rounded-3xl h-full">
          <CardContent className="p-8 md:p-12">

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <Image
                src="/images/Logo.png"
                alt="Logo"
                width={110}
                height={110}
                className="rounded-2xl"
              />
            </div>

            {/* Welcome Text */}
            <h2 className="text-3xl font-bold text-center mb-8 pb-6">
              Welcome back!
            </h2>

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  className={`h-12 rounded-full ${errors.email && touched.email ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    className={`h-12 rounded-full pr-12 ${errors.password && touched.password ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right pb-6">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-gray-700 hover:text-primary hover:underline transition-all duration-200"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full text-base bg-primary hover:bg-primary/90 active:bg-primary/80 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </CardContent>
        </div>

      </div>
    </div>
  )
}