import React, { useState, useEffect } from 'react'

export default function AddClassModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
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

      // Combine date and time into a single DateTime
      const dateTime = new Date(`${formData.date}T${formData.time}`)

      // Prepare the data for the backend
      const classData = {
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        image: '', // You can add image upload later
        categoryId: formData.categoryId || undefined,
        subCategoryId: formData.subCategoryId || undefined
      }

      console.log('Sending class data:', classData)

      // Send to backend API
      const response = await fetch('http://localhost:4000/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(classData)
      })

      const result = await response.json()

      if (response.ok) {
        alert('Class added successfully to MongoDB!')
        console.log('Created class:', result)
        onClose()
        // Reset form
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          categoryId: '',
          subCategoryId: ''
        })
        setSubcategories([])
        // Optionally reload the page or update the class list
        window.location.reload()
      } else {
        alert(`Failed to create class: ${result.error || 'Unknown error'}`)
        console.error('Error:', result)
      }
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Failed to create class. Please check console for details.')
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl md:rounded-3xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xl md:text-2xl transition-all duration-300 hover:rotate-90"
        >
          ×
        </button>

        <div className="mb-5 md:mb-6">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
            New Class
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Add a New Class</h2>
          <p className="text-sm md:text-base text-gray-600 mt-2">Fill in the details below to create a new class session</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to React Hooks"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn in this class..."
              rows="4"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={handleCategoryChange}
              disabled={loading}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a category (optional)</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {loading && (
              <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
            )}
          </div>

          {/* Subcategory Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subcategory
            </label>
            <select
              disabled={!formData.categoryId}
              value={formData.subCategoryId}
              onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a subcategory (optional)</option>
              {subcategories.map((subcat) => (
                <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
              ))}
            </select>
            {!formData.categoryId && (
              <p className="text-sm text-gray-500 mt-1">Please select a category first</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-3 md:pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 md:py-3 text-sm md:text-base rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Submit Class
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:px-6 border-2 border-gray-300 text-gray-700 py-2.5 md:py-3 text-sm md:text-base rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
