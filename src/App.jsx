import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabaseClient'
import TataLetak from './components/TataLetak'
import HalamanDashboard from './pages/HalamanDashboard'
import HalamanMaster from './pages/HalamanMaster'
import HalamanRekapan from './pages/HalamanRekapan'
import HalamanCuti from './pages/HalamanCuti'
import HalamanRiwayat from './pages/HalamanRiwayat'
import HalamanLogin from './pages/HalamanLogin'

export default function App() {
  const [session, setSession] = useState(null)
  const [profil, setProfil] = useState(null)
  const [loadingAwal, setLoadingAwal] = useState(true)
  const [halamanAktif, setHalamanAktif] = useState('dashboard')

  useEffect(() => {
    const ambilProfil = async (emailUser) => {
      try {
        const { data, error } = await supabase
          .from('profil_karyawan_v2')
          .select('*')
          .eq('email', emailUser)
          .single()

        if (data && !error) {
          setProfil(data)
        }
      } catch (err) {
        console.error('Gagal mengambil profil:', err)
      } finally {
        setLoadingAwal(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.email) {
        ambilProfil(session.user.email)
      } else {
        setLoadingAwal(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        ambilProfil(session.user.email)
      } else {
        setProfil(null)
        setLoadingAwal(false)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  if (loadingAwal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-gray-500 tracking-wide">Memeriksa hak akses kamu...</p>
      </div>
    )
  }

  if (!session) {
    return <HalamanLogin onLoginSuccess={() => setLoadingAwal(false)} />
  }

  return (
    <TataLetak profil={profil} halamanAktif={halamanAktif} setHalamanAktif={setHalamanAktif}>
      {halamanAktif === 'dashboard' && <HalamanDashboard profil={profil} />}
      {halamanAktif === 'master' && <HalamanMaster />}
      {halamanAktif === 'rekapan' && <HalamanRekapan />}
      {halamanAktif === 'cuti' && <HalamanCuti profil={profil} />}
      {halamanAktif === 'riwayat' && <HalamanRiwayat />}
    </TataLetak>
  )
}