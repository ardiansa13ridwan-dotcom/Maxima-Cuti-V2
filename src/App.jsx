import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabaseClient'
import HalamanLogin from './pages/HalamanLogin'
import HalamanCuti from './pages/HalamanCuti'
import HalamanMaster from './pages/HalamanMaster'
import HalamanRekapan from './pages/HalamanRekapan'
import HalamanDashboard from './pages/HalamanDashboard'
import HalamanRiwayat from './pages/HalamanRiwayat'
import TataLetak from './components/TataLetak'

export default function App() {
  const [session, setSession] = useState(null)
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [halamanAktif, setHalamanAktif] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        muatProfilKaryawan(session.user.email)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        muatProfilKaryawan(session.user.email)
      } else {
        setProfil(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const muatProfilKaryawan = async (email) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profil_karyawan_v2')
        .select('*')
        .eq('email', email)
        .single()

      if (!error && data) {
        setProfil(data)
      } else {
        setProfil(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-3 font-medium">Memverifikasi hak akses kamu...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <HalamanLogin />
  }

  const renderHalamanSesuaiHakAkses = () => {
    if (!profil) {
      return (
        <div className="p-6 max-w-md mx-auto mt-10 text-center bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <p className="text-sm text-red-600 font-bold">Data profil milikmu belum siap</p>
          <p className="text-xs text-red-500 mt-1">Sistem sedang memproses pembuatan akun baru. Silakan muat ulang halaman ini secara berkala.</p>
        </div>
      )
    }

    const posisiKaryawan = profil.jabatan ? profil.jabatan.toUpperCase() : ''
    const statusValidBM = posisiKaryawan === 'BM' || posisiKaryawan === 'BRANCH MANAGER'

    if (halamanAktif === 'dashboard') {
      return statusValidBM ? <HalamanDashboard profil={profil} /> : <HalamanCuti profil={profil} />
    }

    if (halamanAktif === 'master') {
      return statusValidBM ? <HalamanMaster profil={profil} /> : <HalamanCuti profil={profil} />
    }

    if (halamanAktif === 'rekapan') {
      return statusValidBM ? <HalamanRekapan profil={profil} /> : <HalamanCuti profil={profil} />
    }

    if (halamanAktif === 'riwayat') {
      return <HalamanRiwayat />
    }

    return <HalamanCuti profil={profil} />
  }

  return (
    <TataLetak profil={profil} setHalamanAktif={setHalamanAktif} halamanAktif={halamanAktif}>
      {renderHalamanSesuaiHakAkses()}
    </TataLetak>
  )
}