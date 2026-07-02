import React from 'react'

export default function TombolAksi({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) {
  const baseStyle = 'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    primary: 'bg-blue-800 hover:bg-blue-900 text-white shadow-blue-100',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-100',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}