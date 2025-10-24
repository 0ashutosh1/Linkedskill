import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

console.log('🚀 main.jsx loading...')
console.log('📦 React version:', React.version)

const rootElement = document.getElementById('root')
console.log('🎯 Root element found:', !!rootElement)
console.log('🎯 Root element:', rootElement)

if (!rootElement) {
  console.error('Root element not found!')
} else {
  const root = createRoot(rootElement)
  console.log('✅ Creating React root and rendering App...')
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
  console.log('✅ React rendering completed')
}
