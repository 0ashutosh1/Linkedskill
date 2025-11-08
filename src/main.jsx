import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found!')
  document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found!</div>'
} else {
  const root = createRoot(rootElement)
  try {
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('❌ Error during render:', error)
    document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: ' + error.message + '</div>'
  }
}
