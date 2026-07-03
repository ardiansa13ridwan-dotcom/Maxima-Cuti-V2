import React, { useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function HalamanLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const tanganiLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      alert('Gagal masuk: ' + error.message)
    } else {
      alert('Kamu berhasil masuk ke sistem!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        <div className="bg-white p-6 flex justify-center items-center border-b border-gray-100">
          <img 
            src="logo-maxima.png" 
            alt="Logo Maxima" 
            className="h-20 object-contain"
          />
        </div>

        <form onSubmit={tanganiLogin} className="p-6 space-y-4" autoComplete="off">
          <div className="text-center pb-2">
            <h2 className="text-lg font-bold text-blue-900 uppercase tracking-wider">Sistem Informasi Cuti</h2>
            <p className="text-xs text-gray-400 mt-0.5">Silakan masuk menggunakan akun resmi milikmu</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Resmi</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" 
              required 
              placeholder="nama@maximalab.co.id"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Kata Sandi</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" 
              required 
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md mt-2 disabled:bg-gray-400"
          >
            {loading ? 'Memproses Akses...' : 'Masuk Aplikasi'}
          </button>
        </form>

      </div>
    </div>
  )
}