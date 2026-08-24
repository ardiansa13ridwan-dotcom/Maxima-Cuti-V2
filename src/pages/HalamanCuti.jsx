import React, { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { kirimNotifKeBranchManager } from '../utils/whatsappHelper'

export default function HalamanCuti({ profil }) {
  const isAdmin = profil?.jabatan?.toLowerCase() === 'branch manager' || profil?.email === 'ardi13@gmail.com'

  const [daftarPengajuan, setDaftarPengajuan] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // State Form Pengajuan
  const [jenisCuti, setJenisCuti] = useState('Cuti Tahunan')
  const [tanggalMulai, setTanggalMulai] = useState('')
  const [tanggalSelesai, setTanggalSelesai] = useState('')
  const [alasan, setAlasan] = useState('')
  const [pesanError, setPesanError] = useState('')
  const [pesanSukses, setPesanSukses] = useState('')

  useEffect(() => {
    muatPengajuan()
  }, [profil])

  const muatPengajuan = async () => {
    setLoading(true)
    let query = supabase.from('pengajuan_cuti').select('*').order('id', { ascending: false })

    if (!isAdmin && profil?.email) {
      query = query.eq('email_karyawan', profil.email)
    }

    const { data, error } = await query
    if (!error && data) {
      setDaftarPengajuan(data)
    }
    setLoading(false)
  }

  // Hitung jumlah hari
  const hitungJumlahHari = (mulai, selesai) => {
    if (!mulai || !selesai) return 0
    const dMulai = new Date(mulai)
    const dSelesai = new Date(selesai)
    const selisihWaktu = dSelesai.getTime() - dMulai.getTime()
    const selisihHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24)) + 1
    return selisihHari > 0 ? selisihHari : 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPesanError('')
    setPesanSukses('')

    const durasi = hitungJumlahHari(tanggalMulai, tanggalSelesai)

    if (durasi <= 0) {
      setPesanError('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.')
      return
    }

    if (jenisCuti === 'Cuti Tahunan' && profil?.sisa_cuti !== undefined && durasi > profil.sisa_cuti) {
      setPesanError(`Sisa kuota cuti tahunan Anda tidak mencukupi (${profil.sisa_cuti} hari tersisa).`)
      return
    }

    setSubmitting(true)

    const payload = {
      nama_karyawan: profil?.nama_lengkap || '',
      email_karyawan: profil?.email || '',
      jabatan: profil?.jabatan || '',
      jenis_cuti: jenisCuti,
      tanggal_mulai: tanggalMulai,
      tgl_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      tgl_selesai: tanggalSelesai,
      jumlah_hari: durasi,
      durasi: durasi,
      lama_cuti: durasi,
      alasan: alasan,
      keterangan: alasan,
      status: 'Menunggu'
    }

    const { error } = await supabase.from('pengajuan_cuti').insert([payload])

    if (error) {
      // Jika kolom tertentu tidak ada di DB, kirim format standar
      const payloadStandar = {
        nama_karyawan: profil?.nama_lengkap || '',
        email_karyawan: profil?.email || '',
        jabatan: profil?.jabatan || '',
        jenis_cuti: jenisCuti,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        jumlah_hari: durasi,
        alasan: alasan,
        status: 'Menunggu'
      }
      const { error: errStandar } = await supabase.from('pengajuan_cuti').insert([payloadStandar])
      if (errStandar) {
        setPesanError('Gagal mengajukan cuti: ' + errStandar.message)
        setSubmitting(false)
        return
      }
    }

    setPesanSukses('Pengajuan cuti berhasil dikirim!')

    // Kirim Notifikasi WhatsApp ke Branch Manager
    kirimNotifKeBranchManager({
      namaStaf: profil?.nama_lengkap,
      jabatan: profil?.jabatan,
      cabang: profil?.cabang_penugasan,
      jenisCuti: jenisCuti,
      tglMulai: tanggalMulai,
      tglSelesai: tanggalSelesai,
      jumlahHari: durasi,
      alasan: alasan,
      nomorTujuan: '6281234567890'
    })

    setJenisCuti('Cuti Tahunan')
    setTanggalMulai('')
    setTanggalSelesai('')
    setAlasan('')
    muatPengajuan()
    setSubmitting(false)
  }

  const handleAksiStatus = async (id, statusBaru) => {
    const konfirmasi = window.confirm(`Apakah Anda yakin ingin mengubah status menjadi "${statusBaru}"?`)
    if (!konfirmasi) return

    const { error } = await supabase
      .from('pengajuan_cuti')
      .update({ status: statusBaru })
      .eq('id', id)

    if (!error) {
      muatPengajuan()
    } else {
      alert('Gagal memperbarui status: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Form Pengajuan Cuti</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ajukan permohonan cuti resmi dan pantau status persetujuan</p>
        </div>
        <div className="bg-blue-50 text-blue-900 px-4 py-2 rounded-xl text-xs font-semibold">
          Sisa Kuota Cuti Anda: <span className="font-bold text-sm text-blue-950">{profil?.sisa_cuti ?? 0} Hari</span>
        </div>
      </div>

      {/* Form Input Pengajuan */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Buat Permohonan Cuti Baru</h3>

        {pesanError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs mb-4 border border-red-100 font-medium">
            ⚠️ {pesanError}
          </div>
        )}

        {pesanSukses && (
          <div className="bg-green-50 text-green-700 p-3 rounded-xl text-xs mb-4 border border-green-100 font-medium">
            ✅ {pesanSukses}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">NAMA PEMOHON</label>
            <input 
              type="text" 
              value={profil?.nama_lengkap || ''} 
              disabled 
              className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-sm text-gray-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">JENIS CUTI</label>
            <select 
              value={jenisCuti} 
              onChange={(e) => setJenisCuti(e.target.value)}
              className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-900 bg-white"
            >
              <option value="Cuti Tahunan">Cuti Tahunan</option>
              <option value="Cuti Melahirkan">Cuti Melahirkan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">TANGGAL MULAI CUTI</label>
            <input 
              type="date" 
              value={tanggalMulai} 
              onChange={(e) => setTanggalMulai(e.target.value)} 
              required 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">TANGGAL SELESAI CUTI</label>
            <input 
              type="date" 
              value={tanggalSelesai} 
              onChange={(e) => setTanggalSelesai(e.target.value)} 
              required 
              className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              ALASAN / KETERANGAN CUTI
            </label>
            <textarea 
              rows="3" 
              value={alasan} 
              onChange={(e) => setAlasan(e.target.value)} 
              placeholder="Tuliskan keterangan atau keperluan izin cuti..."
              required
              className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-900"
            ></textarea>
          </div>

          <div className="md:col-span-2 pt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Cuti'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Riwayat & Daftar Pengajuan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">
            {isAdmin ? 'Semua Pengajuan Cuti Staf' : 'Riwayat Pengajuan Cuti Saya'}
          </h3>
        </div>

        {loading ? (
          <p className="p-6 text-xs text-gray-400">Sedang memuat data cuti...</p>
        ) : daftarPengajuan.length === 0 ? (
          <p className="p-6 text-sm text-gray-400 italic text-center">Belum ada data pengajuan cuti</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-100">
                  <th className="p-4">KARYAWAN</th>
                  <th className="p-4">JENIS CUTI</th>
                  <th className="p-4">PERIODE</th>
                  <th className="p-4">DURASI</th>
                  <th className="p-4">KETERANGAN</th>
                  <th className="p-4">STATUS</th>
                  {isAdmin && <th className="p-4">AKSI PERSETUJUAN</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {daftarPengajuan.map((item) => {
                  // Fallback membaca nama kolom tanggal & durasi
                  const tglAwal = item.tanggal_mulai || item.tgl_mulai || item.tgl_awal || item.mulai || ''
                  const tglAkhir = item.tanggal_selesai || item.tgl_selesai || item.tgl_akhir || item.selesai || ''
                  const durasiHari = item.jumlah_hari ?? item.durasi ?? item.lama_cuti ?? item.total_hari ?? (tglAwal && tglAkhir ? hitungJumlahHari(tglAwal, tglAkhir) : 0)
                  const keterangan = item.alasan || item.keterangan || item.keperluan || '-'
                  const status = item.status || item.status_pengajuan || 'Menunggu'

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{item.nama_karyawan}</p>
                        <p className="text-xxs text-gray-400">{item.jabatan || item.email_karyawan}</p>
                      </td>
                      <td className="p-4 text-xs font-medium text-gray-600">{item.jenis_cuti}</td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                        {tglAwal && tglAkhir ? `${tglAwal} s/d ${tglAkhir}` : (tglAwal || '-')}
                      </td>
                      <td className="p-4 text-xs font-bold text-blue-900">{durasiHari} Hari</td>
                      <td className="p-4 text-xs text-gray-500 max-w-xs truncate">{keterangan}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`text-xxs font-bold px-2.5 py-1 rounded-full ${
                          status === 'Disetujui' 
                            ? 'bg-green-100 text-green-800' 
                            : status === 'Ditolak' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-4 flex gap-1.5 whitespace-nowrap">
                          <button 
                            onClick={() => handleAksiStatus(item.id, 'Disetujui')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-lg font-medium transition"
                          >
                            Setujui
                          </button>
                          <button 
                            onClick={() => handleAksiStatus(item.id, 'Ditolak')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-lg font-medium transition"
                          >
                            Tolak
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}