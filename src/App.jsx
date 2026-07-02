import React, { useState, useEffect } from 'react'
import { supabase } from './utils/supabaseClient'
import HalamanLogin from './pages/HalamanLogin'
import TataLetak from './components/TataLetak'
import HalamanCuti from './pages/HalamanCuti'
import HalamanMaster from './pages/HalamanMaster'
import HalamanRekapan from './pages/HalamanRekapan'

export default function App() {
  const [session, setSession] = useState(null)
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [halamanAktif, setHalamanAktif] = useState('cuti')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) muatProfilKaryawan(session.user.email)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        muatProfilKaryawan(session.user.email)
      } else {
        setProfil(null)
        setHalamanAktif('cuti')
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const muatProfilKaryawan = async (email) => {
    const { data, error } = await supabase
      .from('profil_karyawan_v2')
      .select('*')
      .eq('email', email)
      .single()

    if (!error && data) {
      setProfil(data)
      const jabatanUser = data.jabatan?.toLowerCase()
      if (jabatanUser === 'branch manager' || data.email === 'ardi13@gmail.com' || data.email === 'julistiawati@gmail.com') {
        setHalamanAktif('master')
      } else {
        setHalamanAktif('cuti')
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-900 font-semibold text-sm animate-pulse">Memuat Aplikasi Maxima Cuti...</p>
      </div>
    )
  }

  if (!session) {
    return <HalamanLogin />
  }

  const luruskanHalaman = () => {
    switch (halamanAktif) {
      case 'master':
        return <HalamanMaster />
      case 'rekapan':
        return <HalamanRekapan />
      case 'cuti':
      default:
        return <HalamanCuti profil={profil} />
    }
  }

  return (
    <TataLetak profil={profil} halamanAktif={halamanAktif} setHalamanAktif={setHalamanAktif}>
      {luruskanHalaman()}
    </TataLetak>
  )
}