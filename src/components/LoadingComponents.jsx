import React from 'react'

// Simple spinner loading component
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
)

// Page loading skeleton
export const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="w-full max-w-6xl p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/4"></div>
      <div className="h-64 bg-gray-300 rounded"></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-48 bg-gray-300 rounded"></div>
        <div className="h-48 bg-gray-300 rounded"></div>
        <div className="h-48 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
)

// Modal loading
export const ModalLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
)

export default LoadingSpinner
