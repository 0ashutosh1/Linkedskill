import React, { useState } from 'react'

const API_URL = 'http://localhost:4000'

export default function LoginPage({ onLogin, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token in localStorage
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setSuccessMessage('Login successful!')
      
      // Call parent callback if provided
      if (onLogin) {
        onLogin(data.user)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 
                    flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 
                      grid grid-cols-1 lg:grid-cols-2 
                      bg-white rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl 
                      shadow-lg sm:shadow-xl md:shadow-2xl overflow-hidden 
                      animate-fadeIn min-h-[600px] lg:min-h-[700px]">
        {/* Enhanced responsive left side - Branding */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 
                        p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16
                        flex flex-col justify-center text-white relative overflow-hidden 
                        order-2 lg:order-1 min-h-[300px] lg:min-h-0">
          
          {/* Enhanced background decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 
                          bg-white/10 rounded-full -translate-y-16 sm:-translate-y-24 md:-translate-y-32 
                          translate-x-16 sm:translate-x-24 md:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 
                          bg-white/10 rounded-full translate-y-24 sm:translate-y-32
                          -translate-x-24 sm:-translate-x-32"></div>
          
          <div className="relative z-10">
            {/* Enhanced responsive header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8 
                           justify-center lg:justify-start">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 
                             bg-white rounded-lg sm:rounded-xl flex items-center justify-center
                             shadow-lg hover:shadow-xl transition-shadow duration-300">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-600" 
                     fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                LinkedSkill
              </h1>
            </div>
            
            {/* Enhanced responsive welcome text */}
            <div className="text-center lg:text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 
                             font-bold mb-2 sm:mb-3 md:mb-4 leading-tight">
                Welcome Back!
              </h2>
              <p className="text-purple-100 text-sm sm:text-base md:text-lg lg:text-xl 
                           mb-4 sm:mb-6 md:mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
                Continue your learning journey and achieve your goals with our expert-led courses.
              </p>
            </div>
            
            {/* Enhanced responsive features list */}
            <div className="space-y-3 sm:space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 sm:gap-3 
                             bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3
                             hover:bg-white/20 transition-all duration-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full 
                               flex items-center justify-center flex-shrink-0
                               hover:bg-white/30 transition-colors duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-medium">Access to 1000+ courses</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 
                             bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3
                             hover:bg-white/20 transition-all duration-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full 
                               flex items-center justify-center flex-shrink-0
                               hover:bg-white/30 transition-colors duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-medium">Expert instructors</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 
                             bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3
                             hover:bg-white/20 transition-all duration-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full 
                               flex items-center justify-center flex-shrink-0
                               hover:bg-white/30 transition-colors duration-300">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-medium">Lifetime access to materials</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced responsive right side - Login Form */}
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 
                        flex flex-col justify-center order-1 lg:order-2">
          
          {/* Enhanced responsive form header */}
          <div className="mb-4 sm:mb-6 md:mb-8 text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl 
                           font-bold text-gray-800 mb-1 sm:mb-2 leading-tight">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Enhanced responsive form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
            
            {/* Enhanced responsive error message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 
                             px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl 
                             text-xs sm:text-sm animate-shake
                             flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Enhanced responsive success message */}
            {successMessage && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 
                             px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl 
                             text-xs sm:text-sm animate-fadeIn
                             flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Enhanced responsive email field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 
                               mb-1 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 
                           text-sm md:text-base border-2 border-gray-200 
                           rounded-lg sm:rounded-xl 
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                           focus:outline-none transition-all duration-300
                           hover:border-gray-300 touch-manipulation
                           placeholder:text-gray-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced responsive password field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 
                               mb-1 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 
                           text-sm md:text-base border-2 border-gray-200 
                           rounded-lg sm:rounded-xl 
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-200
                           focus:outline-none transition-all duration-300
                           hover:border-gray-300 touch-manipulation
                           placeholder:text-gray-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced responsive remember me & forgot password */}
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer 
                               hover:bg-purple-50 rounded-lg p-1 transition-colors duration-300
                               touch-manipulation">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 border-gray-300 
                           rounded focus:ring-purple-500 focus:ring-2 
                           transition-colors duration-300"
                />
                <span className="text-xs sm:text-sm text-gray-700 select-none">
                  Remember me
                </span>
              </label>
              <a href="#" 
                 className="text-xs sm:text-sm font-semibold text-purple-600 
                          hover:text-purple-700 active:text-purple-800
                          hover:bg-purple-50 rounded-lg px-2 py-1 
                          transition-all duration-300 touch-manipulation">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 md:py-3 text-sm md:text-base rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="relative my-5 md:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs md:text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-xs md:text-sm font-semibold text-gray-700">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs md:text-sm font-semibold text-gray-700">Facebook</span>
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="font-semibold text-purple-600 hover:text-purple-700"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
