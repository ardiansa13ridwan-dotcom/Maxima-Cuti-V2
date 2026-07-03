import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const dapatkanBobotJabatan = (jabatan) => {
  const jab = jabatan ? jabatan.toLowerCase() : ''
  if (jab.includes('branch manager') || jab.includes('bm') || jab.includes('supervisor')) return 1
  if (jab.includes('marketing')) return 2
  if (jab.includes('keuangan')) return 3
  if (jab.includes('admin')) return 4
  if (jab.includes('pelayanan')) return 5
  if (jab.includes('analis')) return 6
  if (jab.includes('phelebotomist') || jab.includes('phlebotomist')) return 7
  if (jab.includes('radiographer') || jab.includes('radiografer')) return 8
  if (jab.includes('ob') || jab.includes('office boy')) return 9
  return 10
}

export default function HalamanRekapan() {
  const [karyawan, setKaryawan] = useState([])
  const [riwayatCuti, setRiwayatCuti] = useState([])
  const [loading, setLoading] = useState(true)
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [tahun, setTahun] = useState(String(new Date().getFullYear()))

  const daftarBulan = [
    { kode: '01', nama: 'Januari' },
    { kode: '02', nama: 'Februari' },
    { kode: '03', nama: 'Maret' },
    { kode: '04', nama: 'April' },
    { kode: '05', nama: 'Mei' },
    { kode: '06', nama: 'Juni' },
    { kode: '07', nama: 'Juli' },
    { kode: '08', nama: 'Agustus' },
    { kode: '09', nama: 'September' },
    { kode: '10', nama: 'Oktober' },
    { kode: '11', nama: 'November' },
    { kode: '12', nama: 'Desember' }
  ]

  useEffect(() => {
    muatDataRekapan()
  }, [])

  const muatDataRekapan = async () => {
    setLoading(true)
    const { data: dataStaf } = await supabase
      .from('profil_karyawan_v2')
      .select('*')

    const { data: dataCuti } = await supabase
      .from('pengajuan_cuti')
      .select('*')
      .eq('status', 'Disetujui')

    setKaryawan(dataStaf || [])
    setRiwayatCuti(dataCuti || [])
    setLoading(false)
  }

  const cetakSatuBagian = (idElemen, judulDoc) => {
    const konten = document.getElementById(idElemen).innerHTML
    const jendela = window.open('', '_blank')
    jendela.document.write(`
      <html>
        <head>
          <title>${judulDoc}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="p-8 text-gray-900" onload="window.print(); window.close();">
          <div class="mb-6 border-b pb-4">
            <h1 class="text-xl font-bold uppercase tracking-wider text-blue-900">Maxima Laboratorium Klinik</h1>
            <p class="text-xs text-gray-500">Laporan Resmi Dokumen Rekapan Cuti Karyawan</p>
          </div>
          ${konten}
        </body>
      </html>
    `)
    jendela.document.close()
  }

  const dapatkanNamaBulan = (kodeBulan) => {
    const match = daftarBulan.find(b => b.kode === kodeBulan)
    return match ? match.nama : ''
  }

  if (loading) {
    return <p className="text-xs text-gray-400 p-6">Sedang memuat data rekapan cuti...</p>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Laporan Rekapan Cuti Bulanan</h2>
          <p className="text-xs text-gray-500 mt-0.5">Kelola data cuti resmi per cabang dan cetak dokumen PDF</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select value={bulan} onChange={e => setBulan(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            {daftarBulan.map(b => (
              <option key={b.kode} value={b.kode}>{b.nama}</option>
            ))}
          </select>
          <select value={tahun} onChange={e => setTahun(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            {['2024', '2025', '2026', '2027'].map(th => (
              <option key={th} value={th}>{th}</option>
            ))}
          </select>
          <button onClick={() => cetakSatuBagian('semua-cabang', `Rekapan_Semua_Cabang_${bulan}_${tahun}`)} className="bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition">
            Cetak Semua Cabang
          </button>
        </div>
      </div>

      <div id="semua-cabang" className="space-y-8">
        {['Palu', 'Luwuk', 'Morowali'].map(cab => {
          const stafCabang = karyawan
            .filter(k => (k.cabang || 'Palu').toLowerCase() === cab.toLowerCase())
            .sort((a, b) => {
              const bobotA = dapatkanBobotJabatan(a.jabatan)
              const bobotB = dapatkanBobotJabatan(b.jabatan)
              if (bobotA !== bobotB) return bobotA - bobotB
              return a.nama_lengkap.localeCompare(b.nama_lengkap)
            })

          if (stafCabang.length === 0) return null

          return (
            <div key={cab} id={`area-cabang-${cab}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-xs text-gray-700 uppercase tracking-wider">Cabang {cab} - Periode {dapatkanNamaBulan(bulan)} {tahun}</span>
                <button onClick={() => cetakSatuBagian(`area-cabang-${cab}`, `Rekapan_Cabang_${cab}_${bulan}_${tahun}`)} className="bg-gray-800 hover:bg-gray-900 text-white text-xxs font-bold px-3 py-1.5 rounded-lg transition">
                  Cetak Cabang {cab}
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {stafCabang.map(k => {
                  const cutiStaf = riwayatCuti.filter(c => {
                    if (!c.email_karyawan || !c.tgl_mulai) return false
                    const samaEmail = c.email_karyawan.toLowerCase() === k.email.toLowerCase()
                    const [thCuti, blnCuti] = c.tgl_mulai.split('-')
                    return samaEmail && thCuti === tahun && blnCuti === bulan
                  })

                  const totalHariCuti = cutiStaf.reduce((acc, curr) => acc + (curr.total_hari || 0), 0)

                  return (
                    <div key={k.id} id={`staf-${k.id}`} className="p-4 space-y-3 bg-white hover:bg-gray-50/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{k.nama_lengkap}</p>
                          <p className="text-xs text-gray-500">{k.jabatan} | Sisa Kuota Tahunan: {k.sisa_cuti} Hari | Cabang: {cab}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-lg">
                            Terpakai Bulan Ini: {totalHariCuti} Hari
                          </span>
                          <button onClick={() => cetakSatuBagian(`staf-${k.id}`, `Rekapan_${k.nama_lengkap}_${bulan}_${tahun}`)} className="text-xxs bg-green-600 hover:bg-green-700 text-white font-bold px-2 py-1 rounded-md transition">
                            Cetak PDF Staf
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">History Pengajuan Cuti Bulan Ini</p>
                        {cutiStaf.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Tidak ada pengambilan cuti resmi pada bulan ini.</p>
                        ) : (
                          <div className="bg-gray-50/60 rounded-xl p-2 border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase text-xxs">
                                  <th className="pb-1">Jenis Cuti</th>
                                  <th className="pb-1">Periode Tanggal</th>
                                  <th className="pb-1 text-center">Durasi</th>
                                  <th className="pb-1">Keperluan Alasan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-700">
                                {cutiStaf.map(c => (
                                  <tr key={c.id}>
                                    <td className="py-1.5 font-medium text-gray-900">{c.jenis_cuti}</td>
                                    <td className="py-1.5">{c.tgl_mulai} s/d {c.tgl_selesai}</td>
                                    <td className="py-1.5 text-center font-bold text-blue-800">{c.total_hari} Hari</td>
                                    <td className="py-1.5 italic text-gray-500">"{c.alasan}"</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}