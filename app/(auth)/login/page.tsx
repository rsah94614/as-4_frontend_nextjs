'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Mail, LockKeyhole, ThumbsUp, Gift, Award, LineChart } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'

import { Input } from '@/components/ui/input'
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
    <div className="min-h-screen w-full flex justify-center bg-[#f5f7fb]">
      <div className="w-full max-w-[1920px] flex shadow-[0_0_40px_rgba(0,0,0,0.05)] bg-white relative">

        {/* Left Column - 55% */}
        <div className="hidden lg:flex flex-col items-center justify-center w-[55%] relative overflow-hidden bg-gradient-to-br from-[#fdfdff] to-[#e4ebf5] p-12 lg:p-20">

          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#004C8F 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d9a05b]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[#004C8F]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-2xl flex flex-col mb-20">
            {/* Header containing HDFC Logo and Aabhar Text */}
            <div className="flex items-center mb-16 bg-white/60 p-4 rounded-xl shadow-sm self-start backdrop-blur-sm">
              <div className="flex items-center gap-5">
                <Image
                  src="logo.svg"
                  alt="HDFC Bank Logo"
                  width={180}
                  height={40}
                  className="object-contain"
                />
                <div className="h-10 w-px bg-gray-300"></div>
                <span className="text-[#E31837] text-2xl font-black tracking-widest uppercase">A</span>
              </div>
              <span className="text-[#004C8F] text-2xl font-black tracking-widest">abhar</span>
            </div>

            {/* Typography */}
            <div className="mt-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-[#b8860b] mb-4 leading-tight">
                CELEBRATING SUCCESS, TOGETHER.
              </h1>
              <h2 className="text-2xl xl:text-3xl font-medium text-[#1c2c5b] mb-12 uppercase tracking-wide">
                Aabhar: Recognizing Your Impact.
              </h2>

              {/* Grid of features mimicking the graphic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 mt-12 relative">
                {/* Feature 1 */}
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#1c2c5b] to-[#2d468e] rounded-full shadow-md text-white group-hover:scale-110 transition-transform duration-300">
                    <ThumbsUp className="w-7 h-7" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-gray-900 text-lg">Peer Recognition</h3>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#1c2c5b] to-[#2d468e] rounded-full shadow-md text-white group-hover:scale-110 transition-transform duration-300 mt-8 sm:mt-0">
                    <Gift className="w-7 h-7" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-gray-900 text-lg">Points to Rewards</h3>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#1c2c5b] to-[#2d468e] rounded-full shadow-md text-white group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-7 h-7" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-gray-900 text-lg">Achievement Badges</h3>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#1c2c5b] to-[#2d468e] rounded-full shadow-md text-white group-hover:scale-110 transition-transform duration-300 mt-8 sm:mt-0">
                    <LineChart className="w-7 h-7" />
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-gray-900 text-lg">R&R Dashboard</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 justify-center opacity-50 text-sm text-gray-600 font-medium lg:pl-8">
            Empowering our workforce through continuous recognition
          </div>
        </div>

        {/* Right Column - 45% */}
        <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-4 bg-[#f4f6f9] relative border-l border-gray-200">

          {/* Background Pattern for right side */}
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zM27.83 0l.83.83-1.66 1.66-.83-.83.83-.83zM1.033 0l.83.83-1.66 1.66-.83-.83.83-.83zM0 60l54.627-54.627.83.83L.83 60H0zm0-26.797l27.83-27.83.83.83L.83 34.033H0zm0-26.797L1.033 5.373l.83.83L.83 7.23H0zM26.797 60H60V26.797L26.797 60zM60 0v26.797L33.203 0H60zM0 0h26.797L0 26.797V0z\' fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>

          <div className="w-full max-w-md mt-auto mb-auto z-10">

            {/* Form Card */}
            <div className="w-full bg-white border border-gray-200 rounded-xl shadow-xl p-8 max-w-[420px] mx-auto mt-10">

              {/* Logo inside card (for mobile or generic view) */}
              <div className="mb-6 flex flex-col items-center justify-center">
                <Image
                  src="logo.svg"
                  alt="HDFC Bank Logo"
                  width={270}
                  height={60}
                  className="object-contain mb-4 lg:hidden"
                />
                <h1 className="flex items-center text-3xl font-black tracking-tight select-none justify-center mb-4">
                  <span style={{ color: '#E31837' }}>A</span>
                  <span style={{ color: '#004C8F' }}>abhar</span>
                </h1>
                <h2 className="text-xl md:text-2xl text-gray-800 font-bold text-center">
                  Welcome back!
                </h2>
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
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
                      className={`h-11 rounded-md border-gray-300 pl-10 focus-visible:ring-[#004C8F]/20 focus-visible:border-[#004C8F] ${errors.email && touched.email ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
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
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <LockKeyhole className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter Password"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => handleBlur('password')}
                      className={`h-11 rounded-md border-gray-300 pl-10 focus-visible:ring-[#004C8F]/20 focus-visible:border-[#004C8F] ${errors.password && touched.password ? 'border-red-500 focus-visible:ring-red-500/20' : ''}`}
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

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-md text-base bg-[#1c2c5b] hover:bg-[#131d3d] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 cursor-pointer text-white font-medium mt-4 shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    'LOGIN'
                  )}
                </Button>

                {/* Forgot Password */}
                <div className="text-right pt-2">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-[#555] hover:text-[#1c2c5b] hover:underline transition-all duration-200 cursor-pointer"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pb-4 text-xs text-center text-gray-500 w-full z-10">
            Secure Login | © HDFC Bank Ltd.
          </div>
        </div>

      </div>
    </div>
  )
}
