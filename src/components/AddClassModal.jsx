import React, { useState, useEffect } from 'react'
import { classAPI } from '../utils/classAPI'

export default function AddClassModal({ isOpen, onClose, onClassCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60, // Default 60 minutes
    categoryId: '',
    subCategoryId: ''
  })

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/categories')
      const data = await response.json()
      setCategories(data.categories || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setLoading(false)
    }
  }

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:4000/subcategories/category/${categoryId}`)
      const data = await response.json()
      setSubcategories(data.subCategories || [])
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      setSubcategories([])
    }
  }

  if (!isOpen) return null

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value
    setFormData({ ...formData, categoryId: selectedCategoryId, subCategoryId: '' })
    if (selectedCategoryId) {
      fetchSubCategories(selectedCategoryId)
    } else {
      setSubcategories([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        alert('Please login first to create a class')
        return
      }

      // Combine date and time into a single DateTime for startTime
      const startTime = new Date(`${formData.date}T${formData.time}`)

      // Prepare the data for the backend (matching new API format)
      const classData = {
        title: formData.title,
        description: formData.description,
        date: startTime.toISOString(), // Keep for backward compatibility
        startTime: startTime.toISOString(), // New required field
        duration: formData.duration, // Use form duration
        image: '', // You can add image upload later
        categoryId: formData.categoryId || undefined,
        subCategoryId: formData.subCategoryId || undefined,
        liveUrl: '' // Optional live streaming URL
      }

      console.log('Sending class data:', classData)

      // Send to backend API using the classAPI utility
      const result = await classAPI.createClass(classData)

      alert('Class created successfully! 🎉')
      console.log('Created class:', result)
      
      // Call the onClassCreated callback to refresh data
      if (onClassCreated) {
        onClassCreated()
      }
      
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        categoryId: '',
        subCategoryId: ''
      })
      setSubcategories([])
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Failed to create class. Please check console for details.')
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700/50 rounded-2xl md:rounded-3xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 md:w-10 md:h-10 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-full flex items-center justify-center text-gray-300 text-xl md:text-2xl transition-all duration-300 hover:rotate-90"
        >
          ×
        </button>

        <div className="mb-5 md:mb-6">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
            New Class
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100">Add a New Class</h2>
          <p className="text-sm md:text-base text-gray-300 mt-2">Fill in the details below to create a new class session</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Class Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to React Hooks"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-700/50 border-2 border-slate-600/50 text-gray-200 placeholder-gray-400 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn in this class..."
              rows="4"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-700/50 border-2 border-slate-600/50 text-gray-200 placeholder-gray-400 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 resize-none"
            />
          </div>

          {/* Date, Time, and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-700/50 border-2 border-slate-600/50 text-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Time <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-700/50 border-2 border-slate-600/50 text-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-700/50 border-2 border-slate-600/50 text-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={handleCategoryChange}
              disabled={loading}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-700/50 border-2 border-slate-600/50 text-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 disabled:bg-slate-700/30 disabled:cursor-not-allowed"
            >
              <option value="">Select a category (optional)</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {loading && (
              <p className="text-sm text-gray-400 mt-1">Loading categories...</p>
            )}
          </div>

          {/* Subcategory Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Subcategory
            </label>
            <select
              disabled={!formData.categoryId}
              value={formData.subCategoryId}
              onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-700/50 border-2 border-slate-600/50 text-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-300 disabled:bg-slate-700/30 disabled:cursor-not-allowed"
            >
              <option value="">Select a subcategory (optional)</option>
              {subcategories.map((subcat) => (
                <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
              ))}
            </select>
            {!formData.categoryId && (
              <p className="text-sm text-gray-400 mt-1">Please select a category first</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-3 md:pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 md:py-3 text-sm md:text-base rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
            >
              Submit Class
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:px-6 border-2 border-slate-600/50 bg-slate-700/30 text-gray-300 py-2.5 md:py-3 text-sm md:text-base rounded-xl font-semibold hover:bg-slate-600/30 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
