import React, { useState } from 'react'

const categories = {
  'Frontend Development': ['React', 'Vue', 'Angular', 'HTML/CSS', 'JavaScript'],
  'Backend Development': ['Node.js', 'Python', 'Java', 'PHP', 'Database'],
  'Design': ['UI Design', 'UX Design', 'Graphic Design', 'Figma', 'Adobe XD'],
  'Data Science': ['Machine Learning', 'Data Analysis', 'Python', 'R', 'Statistics'],
  'Mobile Development': ['React Native', 'Flutter', 'iOS', 'Android', 'Kotlin']
}

export default function AddClassModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: '',
    subcategory: ''
  })

  const [subcategories, setSubcategories] = useState([])

  if (!isOpen) return null

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value
    setFormData({ ...formData, category: selectedCategory, subcategory: '' })
    setSubcategories(categories[selectedCategory] || [])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Class submitted:', formData)
    // Here you would typically send the data to your backend
    alert('Class added successfully!')
    onClose()
    // Reset form
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      category: '',
      subcategory: ''
    })
    setSubcategories([])
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
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={handleCategoryChange}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white"
            >
              <option value="">Select a category</option>
              {Object.keys(categories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={!formData.category}
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all duration-300 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a subcategory</option>
              {subcategories.map((subcat) => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
            {!formData.category && (
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
