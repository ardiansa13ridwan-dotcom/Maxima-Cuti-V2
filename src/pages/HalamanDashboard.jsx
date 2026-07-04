import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function HalamanDashboard() {
  const [cutiHariIni, setCutiHariIni] = useState([])
  const [totalKaryawan, setTotalKaryawan] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    muatDataDashboard()
  }, [])

  const muatDataDashboard = async () => {
    setLoading(true)
    const { data: dataKaryawan } = await supabase
      .from('profil_karyawan_v2')
      .select('id, nama_lengkap, email, jabatan, cabang')

    const { data: dataCuti } = await supabase
      .from('pengajuan_cuti')
      .select('*')
      .eq('status', 'Disetujui')

    if (dataKaryawan && dataCuti) {
      setTotalKaryawan(dataKaryawan.length)
      const hariIni = new Intl.DateTimeFormat('fr-CA', {
        timeZone: 'Asia/Makassar',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date())

      const aktifCuti = dataCuti
        .filter(c => c.tgl_mulai <= hariIni && c.tgl_selesai >= hariIni)
        .map(c => {
          const staf = dataKaryawan.find(k => k.email.toLowerCase() === c.email_karyawan.toLowerCase())
          return {
            ...c,
            cabang: staf ? staf.cabang : 'Palu'
          }
        })
      setCutiHariIni(aktifCuti)
    }
    setLoading(false)
  }

  const cutiPalu = cutiHariIni.filter(c => c.cabang === 'Palu').length
  const cutiLuwuk = cutiHariIni.filter(c => c.cabang === 'Luwuk').length
  const cutiMorowali = cutiHariIni.filter(c => c.cabang === 'Morowali').length

  if (loading) {
    return <p className="text-xs text-gray-400 p-6">Sedang memuat ringkasan dashboard...</p>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800">Dashboard Utama Maxima</h2>
        <p className="text-xs text-gray-500 mt-0.5">Pantau status operasional staf laboratorium aktif hari ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-800 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Seluruh Staf</span>
          <span className="text-3xl font-bold mt-2">{totalKaryawan} Orang</span>
        </div>
        <div className="bg-amber-500 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Sedang Cuti Hari Ini</span>
          <span className="text-3xl font-bold mt-2">{cutiHariIni.length} Orang</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Cabang Palu</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{cutiPalu} Staf Libur</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Cabang Luwuk</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{cutiLuwuk} Staf Libur</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-center">
          <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Cabang Morowali</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{cutiMorowali} Staf Libur</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Daftar Staf Libur Hari Ini</h3>
        </div>

        {cutiHariIni.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 italic text-center">Semua staf hadir bekerja. Operasional laboratorium lengkap.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-100">
                  <th className="p-4">Nama Staf</th>
                  <th className="p-4">Jabatan</th>
                  <th className="p-4">Cabang</th>
                  <th className="p-4">Jenis Cuti</th>
                  <th className="p-4">Keterangan Periode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {cutiHariIni.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-semibold text-gray-900">{c.nama_karyawan}</td>
                    <td className="p-4 text-gray-500">{c.jabatan}</td>
                    <td className="p-4"><span className="bg-blue-50 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-md">{c.cabang}</span></td>
                    <td className="p-4 text-amber-600 font-medium">{c.jenis_cuti}</td>
                    <td className="p-4 text-xs text-gray-400">{c.tgl_mulai} s/d {c.tgl_selesai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}