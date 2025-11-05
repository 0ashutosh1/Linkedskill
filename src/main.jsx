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
  document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found!</div>'
} else {
  const root = createRoot(rootElement)
  console.log('✅ Creating React root and rendering App...')
  try {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )
    console.log('✅ React rendering completed')
  } catch (error) {
    console.error('❌ Error during render:', error)
    document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: ' + error.message + '</div>'
  }
}
