'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
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
            className="object-contain w-full h-"
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-full"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-full"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right pb-6">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium underline hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-full text-base"
              >
                Login
              </Button>

            </form>
          </CardContent>
        </div>

      </div>
    </div>
  )
}
