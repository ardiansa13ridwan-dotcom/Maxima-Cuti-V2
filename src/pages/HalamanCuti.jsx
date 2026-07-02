import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function HalamanCuti({ profil }) {
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [alasan, setAlasan] = useState('')
  const [jenisCuti, setJenisCuti] = useState('Cuti Tahunan')
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(false)
  const [adaTandaTangan, setAdaTandaTangan] = useState(false)

  const canvasRef = useRef(null)
  const isDrawing = useRef(false)

  useEffect(() => {
    if (profil) {
      muatRiwayatCuti()
    }
    setTimeout(() => {
      inisialisasiCanvas()
    }, 200)
  }, [profil])

  const inisialisasiCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000000'
  }

  const mulaiMenggambar = (e) => {
    isDrawing.current = true
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const menggambar = (e) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const clientX = e.clientX || (e.touches && e.touches[0].clientX)
    const clientY = e.clientY || (e.touches && e.touches[0].clientY)
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
    setAdaTandaTangan(true)
  }

  const selesaiMenggambar = () => {
    isDrawing.current = false
  }

  const hapusCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setAdaTandaTangan(false)
  }

  const muatRiwayatCuti = async () => {
    const { data, error } = await supabase
      .from('pengajuan_cuti')
      .select('*')
      .eq('email_karyawan', profil.email)
      .order('created_at', { ascending: false })

    if (!error) {
      setRiwayat(data || [])
    }
  }

  const hitungHariCutiEfektif = (mulai, selesai) => {
    let count = 0
    let berjalan = new Date(mulai)
    let akhir = new Date(selesai)
    
    const daftarTanggalMerah = [
      '2026-01-01',
      '2026-05-01',
      '2026-08-17',
      '2026-12-25'
    ]
    
    while (berjalan <= akhir) {
      const hariSaja = berjalan.getDay()
      const yyyy = berjalan.getFullYear()
      const mm = String(berjalan.getMonth() + 1).padStart(2, '0')
      const dd = String(berjalan.getDate()).padStart(2, '0')
      const formatTanggal = `${yyyy}-${mm}-${dd}`
      
      if (hariSaja !== 0 && !daftarTanggalMerah.includes(formatTanggal)) {
        count++
      }
      berjalan.setDate(berjalan.getDate() + 1)
    }
    return count
  }

  const tanganiPengajuan = async (e) => {
    e.preventDefault()
    if (!tanggalMulai || !tanggalSelesai || !alasan) {
      alert('Silakan lengkapi semua form pengajuan')
      return
    }

    if (!adaTandaTangan) {
      alert('Silakan bubuhkan tanda tangan kamu terlebih dahulu')
      return
    }

    const ttdBase64 = canvasRef.current.toDataURL()
    setLoading(true)

    const totalHari = hitungHariCutiEfektif(tanggalMulai, tanggalSelesai)

    if (totalHari <= 0) {
      alert('Hari pengajuan tidak valid atau bertepatan dengan hari libur nasional')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('pengajuan_cuti')
      .insert([{
        nama_karyawan: profil.nama_lengkap,
        email_karyawan: profil.email,
        jabatan: profil.jabatan,
        jenis_cuti: jenisCuti,
        tgl_mulai: tanggalMulai,
        tgl_selesai: tanggalSelesai,
        total_hari: totalHari,
        alasan: alasan,
        status: 'Menunggu',
        ttd_karyawan: ttdBase64
      }])

    setLoading(false)

    if (error) {
      alert('Gagal mengajukan cuti: ' + error.message)
    } else {
      alert('Cuti berhasil diajukan ke sistem')
      setTanggalMulai('')
      setTanggalSelesai('')
      setAlasan('')
      hapusCanvas()
      muatRiwayatCuti()
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 bg-gradient-to-r from-white to-blue-50/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Informasi Akun Karyawan</h2>
          <p className="text-xs text-gray-500 mt-0.5">Nama: {profil?.nama_lengkap} | Posisi: {profil?.jabatan}</p>
        </div>
        <div className="bg-blue-900 text-white px-5 py-3 rounded-xl shadow-md flex flex-col items-center justify-center min-w-[150px] text-center">
          <span className="text-xxs font-bold uppercase tracking-wider text-blue-200">Sisa Kuota Cuti</span>
          <span className="text-lg font-black mt-0.5">
            {profil?.sisa_cuti < 0 ? (
              <span className="text-red-300">Hutang {Math.abs(profil.sisa_cuti)} Hari</span>
            ) : (
              <span>{profil?.sisa_cuti || 0} Hari</span>
            )}
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800 mb-2">Form Pengajuan Cuti Mandiri V1 Style</h2>
        <p className="text-xs text-gray-500 mb-4">Sistem otomatis mendeteksi dan memotong hari minggu serta tanggal merah dari hitungan cuti milikmu</p>
        
        <form onSubmit={tanganiPengajuan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Jenis Pengajuan</label>
            <select value={jenisCuti} onChange={e => setJenisCuti(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600">
              <option value="Cuti Tahunan">Cuti Tahunan (Potong Saldo)</option>
              <option value="Izin">Izin (Potong Saldo)</option>
              <option value="Cuti Melahirkan">Cuti Melahirkan (Tanpa Potong)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tanggal Mulai</label>
            <input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tanggal Selesai</label>
            <input type="date" value={tanggalSelesai} onChange={e => setTanggalSelesai(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Alasan Cuti</label>
            <textarea value={alasan} onChange={e => setAlasan(e.target.value)} placeholder="Tulis alasan keperluan cuti milikmu" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 h-24 resize-none" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tanda Tangan Karyawan</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 w-full h-36">
              <canvas
                ref={canvasRef}
                onMouseDown={mulaiMenggambar}
                onMouseMove={menggambar}
                onMouseUp={selesaiMenggambar}
                onMouseLeave={selesaiMenggambar}
                onTouchStart={mulaiMenggambar}
                onTouchMove={menggambar}
                onTouchEnd={selesaiMenggambar}
                className="w-full h-full bg-white cursor-crosshair blocks touch-none"
              />
            </div>
            <button type="button" onClick={hapusCanvas} className="text-xs text-red-600 font-bold mt-1 block">Hapus Tanda Tangan</button>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md">
            {loading ? 'Mengirim...' : 'Kirim Pengajuan Cuti'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Status Pengajuan Cuti Milikmu</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {riwayat.length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm italic">Belum ada riwayat pengajuan cuti</p>
          ) : (
            riwayat.map(r => (
              <div key={r.id} className="p-4 space-y-2 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{r.alasan}</p>
                    <p className="text-xs text-gray-500">Periode: {r.tgl_mulai} s/d {r.tgl_selesai} ({r.total_hari} Hari Kerja)</p>
                    <p className="text-xs text-blue-600 font-medium">{r.jenis_cuti}</p>
                    {r.ttd_karyawan && (
                      <div className="mt-2">
                        <p className="text-xxs text-gray-400 uppercase font-bold">Tanda Tangan Kamu:</p>
                        <img src={r.ttd_karyawan} alt="TTD" className="h-10 object-contain border border-gray-100 rounded bg-gray-50" />
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    r.status === 'Disetujui' ? 'bg-green-100 text-green-800' :
                    r.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{r.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}