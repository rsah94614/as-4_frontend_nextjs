'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your login logic here
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Illustration */}
        <div className="hidden md:flex items-center justify-center shadow-2xl">
          <img src="images/Gift.png" alt="" />
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl p-8 md:p-12 w-full h-full">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <img className='w-28 h-28 bg-linear-to-br rounded-2xl flex items-center justify-center mb-2 mx-auto' src="/images/Logo.png" alt="" />
            </div>
          </div>

          {/* Welcome Text */}
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Welcome back!
          </h2>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter you email address.."
                className="w-full px-6 py-4 border-2 border-black rounded-full focus:outline-none focus:border-purple-500 transition-colors text-gray-700 placeholder:text-gray-400"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter you password.."
                className="w-full px-6 py-4 border-2 border-black rounded-full focus:outline-none focus:border-purple-500 transition-colors text-gray-700 placeholder:text-gray-400"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a 
                href="ForgotPassword" 
                className="text-sm font-semibold text-gray-800 hover:text-purple-700 transition-colors underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-black text-white font-semibold py-4 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
            >
              Login
            </button>

            {/* Create Account Link */}
            <div className="text-center pt-4">
              <span className="text-gray-600">Don't have an account? </span>
              <a 
                href="/create-account" 
                className="font-bold text-gray-800 hover:text-purple-700 transition-colors underline"
              >
                Create an Account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}