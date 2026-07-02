import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function HalamanRekapan() {
  const tahunSekarang = new Date().getFullYear()
  const bulanSekarang = new Date().getMonth() + 1

  const [bulan, setBulan] = useState(bulanSekarang)
  const [tahun, setTahun] = useState(tahunSekarang)
  const [daftarRekapan, setDaftarRekapan] = useState([])
  const [loading, setLoading] = useState(false)

  const muatDataRekapan = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('ambil_rekapan_cuti_bulanan', {
      bulan_pilihan: parseInt(bulan),
      tahun_pilihan: parseInt(tahun)
    })

    if (!error) {
      setDaftarRekapan(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    muatDataRekapan()
  }, [bulan, tahun])

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800 mb-4">Laporan Rekapan Cuti Bulanan</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Pilih Bulan</label>
            <select value={bulan} onChange={e => setBulan(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600">
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Pilih Tahun</label>
            <select value={tahun} onChange={e => setTahun(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600">
              <option value={tahunSekarang}>{tahunSekarang}</option>
              <option value={tahunSekarang - 1}>{tahunSekarang - 1}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-50/40 text-blue-950 text-xs font-bold uppercase border-b border-gray-100">
                <th className="p-4">Nama Karyawan</th>
                <th className="p-4">Jabatan</th>
                <th className="p-4 text-center">Total Cuti Terpakai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400">Memuat data rekapan...</td></tr>
              ) : daftarRekapan.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400 italic">Tidak ada data cuti bulan ini</td></tr>
              ) : (
                daftarRekapan.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-semibold text-gray-900">{item.nama_karyawan}</td>
                    <td className="p-4 text-gray-500">{item.jabatan_karyawan}</td>
                    <td className="p-4 text-center font-bold text-blue-700">{item.total_hari_cuti} Hari</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}