import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function HalamanLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [proses, setProses] = useState(false)

  // Memaksa kolom input kosong setiap kali halaman dimuat ulang
  useEffect(() => {
    setEmail('')
    setPassword('')
  }, [])

  const tanganiLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return alert('Silakan isi email dan kata sandi Anda!')

    setProses(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      alert('Login gagal: ' + error.message)
      setPassword('')
    } else {
      setEmail('')
      setPassword('')
    }
    setProses(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
        
        <div className="bg-blue-900 px-6 py-8 text-center text-white relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-800 opacity-20 rounded-full transform translate-x-8 -translate-y-8"></div>
          <h2 className="text-2xl font-bold tracking-wide">Sistem Cuti Karyawan</h2>
          <p className="text-blue-200 text-xs mt-1 uppercase tracking-wider font-medium">Maxima Laboratorium Klinik</p>
        </div>

        <form onSubmit={tanganiLogin} className="p-6 space-y-5 bg-white" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 shadow-sm focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 shadow-sm focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={proses}
              className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl active:transform active:scale-95 transition-all text-sm flex items-center justify-center"
            >
              {proses ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Masuk Ke Akun'
              )}
            </button>
          </div>
        </form>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
          <p className="text-xxs text-gray-400 font-medium tracking-wide uppercase">
            Dikembangkan oleh Ar Development Team
          </p>
        </div>

      </div>
    </div>
  )
}