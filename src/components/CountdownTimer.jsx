import React, { useState, useEffect } from 'react'

export default function CountdownTimer({ startTime, onCanStart, onTimeUp, className = "" }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [canStart, setCanStart] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const startTimeMs = new Date(startTime).getTime()
      const tenMinutesBefore = startTimeMs - (10 * 60 * 1000) // 10 minutes before start time

      const difference = startTimeMs - now

      if (difference <= 0) {
        // Class time has passed
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsExpired(true)
        setCanStart(false)
        onTimeUp && onTimeUp()
        return
      }

      // Check if we're within 10 minutes of start time
      const canStartNow = now >= tenMinutesBefore
      setCanStart(canStartNow)
      onCanStart && onCanStart(canStartNow)

      // Calculate time remaining
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [startTime, onCanStart, onTimeUp])

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 text-red-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="text-sm font-medium">Class Time Passed</span>
        </div>
      </div>
    )
  }

  const formatTime = (time) => time.toString().padStart(2, '0')

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Countdown Display */}
      <div className="flex items-center gap-1 text-blue-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div className="flex items-center gap-1 text-sm font-mono">
          {timeLeft.days > 0 && (
            <>
              <span className="bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-semibold">
                {formatTime(timeLeft.days)}d
              </span>
              <span className="text-gray-400">:</span>
            </>
          )}
          
          {(timeLeft.days > 0 || timeLeft.hours > 0) && (
            <>
              <span className="bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-semibold">
                {formatTime(timeLeft.hours)}h
              </span>
              <span className="text-gray-400">:</span>
            </>
          )}
          
          <span className="bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-semibold">
            {formatTime(timeLeft.minutes)}m
          </span>
          <span className="text-gray-400">:</span>
          <span className="bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-semibold">
            {formatTime(timeLeft.seconds)}s
          </span>
        </div>
      </div>

      {/* Start Available Indicator */}
      {canStart && (
        <div className="flex items-center gap-1 text-green-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">Ready to Start</span>
        </div>
      )}
    </div>
  )
}

// Compact version for small spaces
export function CompactCountdownTimer({ startTime, onCanStart, className = "" }) {
  const [timeLeft, setTimeLeft] = useState("")
  const [canStart, setCanStart] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const startTimeMs = new Date(startTime).getTime()
      const tenMinutesBefore = startTimeMs - (10 * 60 * 1000)

      const difference = startTimeMs - now

      if (difference <= 0) {
        setTimeLeft("Expired")
        setIsExpired(true)
        setCanStart(false)
        return
      }

      const canStartNow = now >= tenMinutesBefore
      setCanStart(canStartNow)
      onCanStart && onCanStart(canStartNow)

      // Format time for compact display
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [startTime, onCanStart])

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span className={`text-xs font-mono ${isExpired ? 'text-red-400' : 'text-blue-400'}`}>
        {timeLeft}
      </span>
      {canStart && (
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  )
}