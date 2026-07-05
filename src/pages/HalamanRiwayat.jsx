import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function HalamanRiwayat() {
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    muatRiwayat()
  }, [])

  const muatRiwayat = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('riwayat_kuota')
      .select('*')
      .order('id', { ascending: false })

    if (data) {
      setRiwayat(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <p className="text-xs text-gray-400 p-6">Sedang memuat riwayat kuota...</p>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800">Riwayat Kuota Cuti</h2>
        <p className="text-xs text-gray-500 mt-0.5">Catatan otomatis penambahan kuota cuti tahunan milik karyawan</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {riwayat.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 italic text-center">Belum ada riwayat perubahan kuota</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-100">
                  <th className="p-4">Nama Karyawan</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Perubahan</th>
                  <th className="p-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {riwayat.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-semibold text-gray-900">{r.nama_karyawan}</td>
                    <td className="p-4 text-gray-500">{r.email}</td>
                    <td className="p-4">
                      <span className="bg-green-50 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-md">
                        +{r.perubahan} Hari
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{r.keterangan}</td>
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