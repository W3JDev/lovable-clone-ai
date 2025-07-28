'use client'

import React from 'react'

export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  )
}