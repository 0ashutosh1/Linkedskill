import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:4000'

export default function SignupPage({ onSignup, onSwitchToLogin }) {
  const [step, setStep] = useState(1) // 1: Enter email, 2: Verify OTP, 3: Complete signup
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNo: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Check for OAuth callback when component mounts
  useEffect(() => {
    
    // Check for OAuth callback with token in URL
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const oauthProvider = urlParams.get('oauth')
    const oauthError = urlParams.get('error')

    if (oauthError) {
      setErrors({ api: 'Google authentication failed. Please try again.' })
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (token && oauthProvider === 'google') {
      localStorage.setItem('authToken', token)
      
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(userData => {
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.removeItem('onboardingComplete')
          setSuccessMessage('Google signup successful!')
          
          if (onSignup) {
            onSignup({ user: userData, token })
          }
        })
        .catch(err => {
          console.error('Error fetching user data:', err)
          setErrors({ api: 'Failed to fetch user data' })
        })

      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Timer effect for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Handle sending OTP
  const handleSendOTP = async () => {
    if (!formData.email || !formData.fullName) {
      setErrors({ email: 'Please enter your name and email first' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch(`${API_URL}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setOtpSent(true)
      setStep(2)
      setResendTimer(60) // 60 seconds cooldown
      setSuccessMessage('Verification code sent to your email!')
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (error) {
      setErrors({ api: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Handle verifying OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch(`${API_URL}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      setOtpVerified(true)
      setStep(3)
      setSuccessMessage('Email verified successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (error) {
      setErrors({ otp: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Handle resending OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch(`${API_URL}/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.fullName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP')
      }

      setResendTimer(60)
      setSuccessMessage('New verification code sent!')
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (error) {
      setErrors({ api: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validation
    if (!otpVerified) {
      newErrors.api = 'Please verify your email first'
      setErrors(newErrors)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          phoneNo: parseInt(formData.phoneNo)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Store token and user data
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // IMPORTANT: Remove onboarding flag for new users
      localStorage.removeItem('onboardingComplete')
      
      // Trigger onboarding flow
      if (onSignup) {
        onSignup(data)
      }

    } catch (error) {
      setErrors({ api: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Left Side - Signup Form */}
        <div className="p-6 md:p-12 flex flex-col justify-center order-1 md:order-1
                        bg-gradient-to-br from-white to-gray-50">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {step === 1 && 'Create Account'}
              {step === 2 && 'Verify Your Email'}
              {step === 3 && 'Complete Registration'}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              {step === 1 && 'Join thousands of learners worldwide'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Almost there! Set up your password'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            </div>
          </div>

          {/* Error Message */}
          {errors.api && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {errors.api}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
              {successMessage}
            </div>
          )}

          {/* STEP 1: Enter Name and Email */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  disabled={otpSent}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  disabled={otpSent}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading || !formData.fullName || !formData.email}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm mb-4">
                📧 We've sent a 6-digit code to <strong>{formData.email}</strong>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-center text-2xl tracking-widest font-bold text-gray-900 bg-white border-2 ${errors.otp ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 placeholder:text-gray-400`}
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="text-purple-600 hover:text-purple-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setStep(1); setOtpSent(false); setOtp(''); }}
                className="w-full text-gray-600 hover:text-gray-800 text-sm font-semibold"
              >
                ← Change Email
              </button>
            </div>
          )}

          {/* STEP 3: Complete Registration */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNo}
                  onChange={(e) => setFormData({ ...formData, phoneNo: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 placeholder:text-gray-400"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-gray-900 bg-white border-2 ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 placeholder:text-gray-400`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-gray-900 bg-white border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300 placeholder:text-gray-400`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 md:py-3 text-sm md:text-base rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold text-purple-600 hover:text-purple-700"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Right Side - Branding */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-slate-800 p-6 md:p-12 flex flex-col justify-center text-white relative overflow-hidden order-2 md:order-2">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 -translate-x-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-y-32 translate-x-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                </svg>
              </div>
              <h1 className="text-xl md:text-2xl font-bold">LinkedSkill</h1>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Start Your Journey!</h2>
            <p className="text-purple-100 text-sm md:text-lg mb-6 md:mb-8">
              Join our community and unlock access to world-class courses taught by industry experts.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span>Free trial for 7 days</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span>Cancel anytime, no commitment</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span>Certificate upon completion</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span>24/7 learning support</span>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
              <p className="text-sm italic">"This platform transformed my career. The courses are practical and the instructors are amazing!"</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 bg-white/30 rounded-full"></div>
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-purple-200">Frontend Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
