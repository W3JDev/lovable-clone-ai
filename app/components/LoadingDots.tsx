'use client'

import React from 'react'

export function LoadingDots() {
  return (
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse shadow-lg shadow-purple-400/50" style={{ animationDelay: '0.3s' }}></div>
      <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-cyan-500 rounded-full animate-pulse shadow-lg shadow-pink-400/50" style={{ animationDelay: '0.6s' }}></div>
    </div>
  )
}