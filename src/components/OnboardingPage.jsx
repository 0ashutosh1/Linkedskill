import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:4000'

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    roleId: '',
    interests: [],
    hobbies: [],
    education: '',
    designation: '',
    occupation: '',
    age: '',
    gender: '',
    customInterest: '',
    customHobby: ''
  })
  const [errors, setErrors] = useState({})

  // Pre-defined hobby options
  const hobbyOptions = [
    'Reading', 'Writing', 'Photography', 'Gaming', 'Cooking',
    'Traveling', 'Sports', 'Music', 'Art', 'Dancing',
    'Gardening', 'Fitness', 'Coding', 'Design', 'Meditation'
  ]

  // Fetch categories and roles
  useEffect(() => {
    fetchCategories()
    fetchRoles()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`)
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`)
      const data = await response.json()
      setRoles(data.roles || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const toggleHobby = (hobby) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }))
  }

  const addCustomInterest = () => {
    if (formData.customInterest.trim() && !formData.interests.includes(formData.customInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, prev.customInterest.trim()],
        customInterest: ''
      }))
    }
  }

  const addCustomHobby = () => {
    if (formData.customHobby.trim() && !formData.hobbies.includes(formData.customHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, prev.customHobby.trim()],
        customHobby: ''
      }))
    }
  }

  const removeInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const removeHobby = (hobby) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }))
  }

  const validateStep = () => {
    const newErrors = {}

    if (step === 1 && !formData.roleId) {
      newErrors.roleId = 'Please select your role (Student or Expert)'
    }

    if (step === 2 && formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one area of interest'
    }

    if (step === 3 && formData.hobbies.length === 0) {
      newErrors.hobbies = 'Please select at least one hobby'
    }

    if (step === 4) {
      if (!formData.age || formData.age < 13 || formData.age > 120) {
        newErrors.age = 'Please enter a valid age (13-120)'
      }
      if (!formData.gender) {
        newErrors.gender = 'Please select your gender'
      }
    }

    if (step === 5) {
      if (!formData.education.trim()) {
        newErrors.education = 'Please enter your education'
      }
      // Designation is now optional - no validation needed
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 5) {
        setStep(step + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setErrors({})
    }
  }

  const handleSkip = () => {
    if (step === 1) {
      // Cannot skip role selection
      return
    }
    if (step < 5) {
      setStep(step + 1)
      setErrors({})
    } else {
      // Skip and complete onboarding with minimal data
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)
    setErrors({})

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // First, update user's role
      if (formData.roleId) {
        const roleResponse = await fetch(`${API_URL}/profile/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ roleId: formData.roleId })
        })

        if (!roleResponse.ok) {
          throw new Error('Failed to update role')
        }

        // Update localStorage with new role
        const selectedRole = roles.find(r => r._id === formData.roleId)
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        user.role = selectedRole
        user.roleId = formData.roleId
        localStorage.setItem('user', JSON.stringify(user))
      }

      // Combine interests and hobbies for areasOfInterest
      const allInterests = [...new Set([...formData.interests, ...formData.hobbies])]

      const profileData = {
        education: formData.education,
        designation: formData.designation,
        occupation: formData.occupation || formData.designation,
        areasOfInterest: allInterests,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }

      // Mark onboarding as complete
      localStorage.setItem('onboardingComplete', 'true')
      
      // Call the completion callback
      onComplete()
    } catch (error) {
      console.error('Error saving profile:', error)
      setErrors({ api: error.message })
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
              s === step
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110'
                : s < step
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {s < step ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            ) : (
              s
            )}
          </div>
          {s < 5 && (
            <div
              className={`w-16 h-1 transition-all duration-300 ${
                s < step ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Choose Your Role</h2>
        <p className="text-gray-600">Select whether you're joining as a Student or an Expert.</p>
      </div>

      {errors.roleId && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errors.roleId}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {roles.map((role) => (
          <button
            key={role._id}
            type="button"
            onClick={() => setFormData({ ...formData, roleId: role._id })}
            className={`p-8 rounded-2xl border-3 font-medium transition-all duration-300 group ${
              formData.roleId === role._id
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-600 scale-105 shadow-2xl'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:shadow-xl'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                formData.roleId === role._id
                  ? 'bg-white/20'
                  : 'bg-purple-100 group-hover:bg-purple-200'
              }`}>
                {role.name === 'student' ? (
                  <svg className={`w-10 h-10 ${formData.roleId === role._id ? 'text-white' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                ) : (
                  <svg className={`w-10 h-10 ${formData.roleId === role._id ? 'text-white' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                )}
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold">
                {role.displayName || role.name.charAt(0).toUpperCase() + role.name.slice(1)}
              </h3>
              
              {/* Description */}
              <p className={`text-sm ${formData.roleId === role._id ? 'text-white/90' : 'text-gray-600'}`}>
                {role.name === 'student' 
                  ? 'Learn from experts, join classes, and grow your skills'
                  : 'Share your knowledge, teach classes, and help others learn'
                }
              </p>

              {/* Checkmark */}
              {formData.roleId === role._id && (
                <div className="mt-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">What are you interested in?</h2>
        <p className="text-gray-600">Select areas that interest you. This helps us personalize your learning experience.</p>
      </div>

      {errors.interests && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errors.interests}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() => toggleInterest(category.name)}
            className={`p-4 rounded-xl border-2 font-medium transition-all duration-300 ${
              formData.interests.includes(category.name)
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 scale-105 shadow-lg'
                : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow-md'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Custom Interest Input */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Add Custom Interest
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.customInterest}
            onChange={(e) => setFormData({ ...formData, customInterest: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
            placeholder="Type and press Enter or click Add"
            className="flex-1 px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300"
          />
          <button
            type="button"
            onClick={addCustomInterest}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected Interests */}
      {formData.interests.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Selected Interests ({formData.interests.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">What are your hobbies?</h2>
        <p className="text-gray-600">Share your hobbies to connect with like-minded learners.</p>
      </div>

      {errors.hobbies && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errors.hobbies}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {hobbyOptions.map((hobby) => (
          <button
            key={hobby}
            type="button"
            onClick={() => toggleHobby(hobby)}
            className={`p-4 rounded-xl border-2 font-medium transition-all duration-300 ${
              formData.hobbies.includes(hobby)
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 scale-105 shadow-lg'
                : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow-md'
            }`}
          >
            {hobby}
          </button>
        ))}
      </div>

      {/* Custom Hobby Input */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Add Custom Hobby
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.customHobby}
            onChange={(e) => setFormData({ ...formData, customHobby: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomHobby())}
            placeholder="Type and press Enter or click Add"
            className="flex-1 px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300"
          />
          <button
            type="button"
            onClick={addCustomHobby}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected Hobbies */}
      {formData.hobbies.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Selected Hobbies ({formData.hobbies.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {formData.hobbies.map((hobby) => (
              <span
                key={hobby}
                className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium"
              >
                {hobby}
                <button
                  type="button"
                  onClick={() => removeHobby(hobby)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Personal Information</h2>
        <p className="text-gray-600">Help us personalize your experience better.</p>
      </div>

      {/* Age Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Age <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="13"
          max="120"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          placeholder="Enter your age"
          className={`w-full px-4 py-3 text-gray-900 bg-white border-2 ${
            errors.age ? 'border-red-500' : 'border-gray-200'
          } rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300`}
        />
        {errors.age && (
          <p className="text-red-500 text-xs mt-1">{errors.age}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">You must be at least 13 years old to use this platform</p>
      </div>

      {/* Gender Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Gender <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Male', 'Female', 'Other', 'Prefer not to say'].map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => setFormData({ ...formData, gender })}
              className={`p-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                formData.gender === gender
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 scale-105 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Privacy Note</p>
            <p className="text-blue-700">This information helps us provide age-appropriate content and better recommendations. Your data is secure and private.</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Tell us about yourself</h2>
        <p className="text-gray-600">Help us understand your professional background.</p>
      </div>

      {errors.api && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errors.api}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Education <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.education}
          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
          placeholder="e.g., Bachelor's in Computer Science"
          className={`w-full px-4 py-3 text-gray-900 bg-white border-2 ${
            errors.education ? 'border-red-500' : 'border-gray-200'
          } rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300`}
        />
        {errors.education && (
          <p className="text-red-500 text-xs mt-1">{errors.education}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Designation/Title (Optional)
        </label>
        <input
          type="text"
          value={formData.designation}
          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          placeholder="e.g., Software Engineer, Student, etc."
          className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Occupation (Optional)
        </label>
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
          placeholder="e.g., Full-time Student, Working Professional"
          className="w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all duration-300"
        />
      </div>

      {/* Summary */}
      <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Profile Summary</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Interests:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.interests.length > 0 ? (
                formData.interests.map(int => (
                  <span key={int} className="bg-purple-200 text-purple-700 px-2 py-1 rounded-full text-xs">
                    {int}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">None selected</span>
              )}
            </div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Hobbies:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.hobbies.length > 0 ? (
                formData.hobbies.map(hobby => (
                  <span key={hobby} className="bg-pink-200 text-pink-700 px-2 py-1 rounded-full text-xs">
                    {hobby}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">None selected</span>
              )}
            </div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Age:</span>
            <span className="text-gray-600 ml-2">{formData.age || 'Not provided'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Gender:</span>
            <span className="text-gray-600 ml-2">{formData.gender || 'Not provided'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Education:</span>
            <span className="text-gray-600 ml-2">{formData.education || 'Not provided'}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Designation:</span>
            <span className="text-gray-600 ml-2">{formData.designation || 'Not provided'}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Progress Indicator */}
          {renderStepIndicator()}

          {/* Form Steps */}
          <div className="min-h-[400px]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                step === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-300"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </span>
              ) : step === 3 ? (
                'Complete'
              ) : (
                'Next'
              )}
            </button>
          </div>

          {/* Step Labels */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Step {step} of 4:{' '}
              <span className="font-semibold">
                {step === 1 ? 'Role' : step === 2 ? 'Interests' : step === 3 ? 'Hobbies' : step === 4 ? 'Personal Info' : 'Professional Info'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
