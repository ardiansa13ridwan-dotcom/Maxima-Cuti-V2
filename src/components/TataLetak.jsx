import React from 'react'
import { supabase } from '../utils/supabaseClient'

export default function TataLetak({ children, profil, halamanAktif, setHalamanAktif }) {
  const isAdmin = profil?.jabatan?.toLowerCase() === 'branch manager' || profil?.email === 'ardi13@gmail.com'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Header Utama Tampilan HP */}
      <header className="bg-blue-900 text-white p-4 flex flex-col gap-2 md:hidden shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-sm tracking-wide uppercase">Maxima Cuti</span>
            <span className="block text-xxs text-blue-300 font-medium">by AR Development Team</span>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            Keluar
          </button>
        </div>
        
        {/* Menu Navigasi Layar HP */}
        <div className="flex gap-1 pt-2 border-t border-blue-800 text-xxs overflow-x-auto">
          {isAdmin && (
            <>
              <button 
                onClick={() => setHalamanAktif('dashboard')}
                className={`px-3 py-2 rounded-md font-bold whitespace-nowrap ${halamanAktif === 'dashboard' ? 'bg-blue-950 text-white' : 'text-blue-200'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setHalamanAktif('master')}
                className={`px-3 py-2 rounded-md font-bold whitespace-nowrap ${halamanAktif === 'master' ? 'bg-blue-950 text-white' : 'text-blue-200'}`}
              >
                Kelola Karyawan
              </button>
              <button 
                onClick={() => setHalamanAktif('rekapan')}
                className={`px-3 py-2 rounded-md font-bold whitespace-nowrap ${halamanAktif === 'rekapan' ? 'bg-blue-950 text-white' : 'text-blue-200'}`}
              >
                Laporan Rekap
              </button>
            </>
          )}
          <button 
            onClick={() => setHalamanAktif('cuti')}
            className={`px-3 py-2 rounded-md font-bold whitespace-nowrap ${halamanAktif === 'cuti' ? 'bg-blue-950 text-white' : 'text-blue-200'}`}
          >
            Pengajuan Cuti
          </button>
          <button 
            onClick={() => setHalamanAktif('riwayat')}
            className={`px-3 py-2 rounded-md font-bold whitespace-nowrap ${halamanAktif === 'riwayat' ? 'bg-blue-950 text-white' : 'text-blue-200'}`}
          >
            Riwayat Kuota
          </button>
        </div>
      </header>

      {/* Navigasi Samping Tampilan Komputer Kantor */}
      <aside className="hidden md:flex md:w-64 bg-blue-900 text-white flex-col justify-between p-6 shadow-xl">
        <div className="space-y-6">
          <div>
            <h1 className="font-bold text-xl tracking-wider uppercase pb-1">Maxima Cuti</h1>
            <p className="text-xxs text-blue-300 font-medium tracking-wide">by AR Development Team</p>
            <div className="border-b border-blue-800 mt-3"></div>
          </div>
          
          <div className="bg-blue-950 p-4 rounded-xl border border-blue-800">
            <p className="text-xs text-blue-300 uppercase font-bold tracking-wider">Pengguna aktif</p>
            <p className="font-semibold text-sm mt-1 truncate">{profil?.nama_lengkap || 'Staf Maxima'}</p>
            <p className="text-xs text-blue-200 capitalize mt-0.5">{profil?.jabatan || 'Karyawan'}</p>
          </div>

          {/* Menu Navigasi Layar Komputer */}
          <nav className="space-y-1.5 pt-2">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setHalamanAktif('dashboard')}
                  className={`w-full text-left font-bold py-3 px-4 rounded-xl transition text-xs uppercase tracking-wider ${halamanAktif === 'dashboard' ? 'bg-blue-950 text-white shadow' : 'text-blue-100 hover:bg-blue-800'}`}
                >
                  📊 Dashboard Utama
                </button>
                <button 
                  onClick={() => setHalamanAktif('master')}
                  className={`w-full text-left font-bold py-3 px-4 rounded-xl transition text-xs uppercase tracking-wider ${halamanAktif === 'master' ? 'bg-blue-950 text-white shadow' : 'text-blue-100 hover:bg-blue-800'}`}
                >
                  👥 Kelola Karyawan
                </button>
                <button 
                  onClick={() => setHalamanAktif('rekapan')}
                  className={`w-full text-left font-bold py-3 px-4 rounded-xl transition text-xs uppercase tracking-wider ${halamanAktif === 'rekapan' ? 'bg-blue-950 text-white shadow' : 'text-blue-100 hover:bg-blue-800'}`}
                >
                  📋 Laporan Rekap
                </button>
              </>
            )}
            <button 
              onClick={() => setHalamanAktif('cuti')}
              className={`w-full text-left font-bold py-3 px-4 rounded-xl transition text-xs uppercase tracking-wider ${halamanAktif === 'cuti' ? 'bg-blue-950 text-white shadow' : 'text-blue-100 hover:bg-blue-800'}`}
            >
              📝 Pengajuan Cuti
            </button>
            <button 
              onClick={() => setHalamanAktif('riwayat')}
              className={`w-full text-left font-bold py-3 px-4 rounded-xl transition text-xs uppercase tracking-wider ${halamanAktif === 'riwayat' ? 'bg-blue-950 text-white shadow' : 'text-blue-100 hover:bg-blue-800'}`}
            >
              🕒 Riwayat Kuota
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-xs uppercase tracking-wider"
          >
            Keluar Aplikasi
          </button>
          <p className="text-center text-xxs text-blue-300 font-medium tracking-wide">© 2026 AR Development Team</p>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}