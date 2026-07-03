import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../utils/supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseSampingan = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

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

function KartuPersetujuanCuti({ p, onSetujui, onTolak }) {
  const canvasRef = useRef(null)
  const [adaTtd, setAdaTtd] = useState(false)
  const isDrawing = useRef(false)

  useEffect(() => {
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const ctx = canvas.getContext('2d')
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.strokeStyle = '#000000'
    }, 200)
  }, [])

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
    setAdaTtd(true)
  }

  const selesaiMenggambar = () => {
    isDrawing.current = false
  }

  const hapusCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setAdaTtd(false)
  }

  const tanganiKlikSetujui = () => {
    if (!adaTtd) {
      alert('Silakan bubuhkan tanda tangan persetujuan kamu terlebih dahulu')
      return
    }
    const ttdBase64 = canvasRef.current.toDataURL()
    onSetujui(p, ttdBase64)
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-900">{p.nama_karyawan}</span>
            <span className="text-xs font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md">{p.jenis_cuti}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Jabatan: {p.jabatan} | Keperluan: <span className="font-medium text-gray-700">"{p.alasan}"</span></p>
          <p className="text-xs text-blue-900 font-bold mt-0.5">Periode: {p.tgl_mulai} s/d {p.tgl_selesai} ({p.total_hari} Hari Kerja)</p>
          {p.ttd_karyawan && (
            <div className="mt-2">
              <p className="text-xxs text-gray-400 uppercase font-bold">Tanda Tangan Pemohon:</p>
              <img src={p.ttd_karyawan} alt="TTD Karyawan" className="h-10 object-contain border border-gray-100 rounded bg-gray-50" />
            </div>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto self-end">
          <button onClick={tanganiKlikSetujui} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs">
            Setujui
          </button>
          <button onClick={() => onTolak(p.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs">
            Tolak
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-100 pt-3 max-w-xs">
        <label className="block text-xxs font-bold text-gray-500 uppercase mb-1">Tanda Tangan Manajer Untuk Menyetujui</label>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 w-full h-24">
          <canvas
            ref={canvasRef}
            onMouseDown={mulaiMenggambar}
            onMouseMove={menggambar}
            onMouseUp={selesaiMenggambar}
            onMouseLeave={selesaiMenggambar}
            onTouchStart={mulaiMenggambar}
            onTouchMove={menggambar}
            onTouchEnd={selesaiMenggambar}
            className="w-full h-full bg-white cursor-crosshair touch-none"
          />
        </div>
        <button type="button" onClick={hapusCanvas} className="text-xxs text-red-600 font-bold mt-1 block">Bersihkan Tanda Tangan</button>
      </div>
    </div>
  )
}

export default function HalamanMaster() {
  const [karyawan, setKaryawan] = useState([])
  const [pengajuanMasuk, setPengajuanMasuk] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingCuti, setLoadingCuti] = useState(true)
  const [idEdit, setIdEdit] = useState(null)

  const [namaLengkap, setNamaLengkap] = useState('')
  const [email, setEmail] = useState('')
  const [jabatan, setJabatan] = useState('')
  const [noHp, setNoHp] = useState('')
  const [tanggalMasuk, setTanggalMasuk] = useState('')
  const [sisaCuti, setSisaCuti] = useState(0)
  const [password, setPassword] = useState('')
  const [cabang, setCabang] = useState('Palu')
  const [kataKunci, setKataKunci] = useState('')

  useEffect(() => {
    muatKaryawan()
    muatPengajuanCuti()
    resetForm()
  }, [])

  const muatKaryawan = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profil_karyawan_v2')
      .select()
      .order('nama_lengkap', { ascending: true })

    if (!error) setKaryawan(data || [])
    setLoading(false)
  }

  const muatPengajuanCuti = async () => {
    setLoadingCuti(true)
    const { data, error } = await supabase
      .from('pengajuan_cuti')
      .select()
      .eq('status', 'Menunggu')
      .order('created_at', { ascending: false })

    if (!error) setPengajuanMasuk(data || [])
    setLoadingCuti(false)
  }

  const tanganiTanggalMasukChange = (e) => {
    const tgl = e.target.value
    setTanggalMasuk(tgl)
    if (!tgl) return

    const hariIni = new Date()
    const tglMasuk = new Date(tgl)
    const selisihWaktu = hariIni.getTime() - tglMasuk.getTime()
    const selisihHari = Math.ceil(selisihWaktu / 86400000)

    if (selisihHari < 365) {
      setSisaCuti(0)
    } else {
      setSisaCuti(12)
    }
  }

  const tanganiSetujui = async (p, ttdManagerBase64) => {
    const { error: errorStatus } = await supabase
      .from('pengajuan_cuti')
      .update({ 
        status: 'Disetujui',
        ttd_manager: ttdManagerBase64
      })
      .eq('id', p.id)

    if (errorStatus) {
      alert('Gagal menyetujui cuti: ' + errorStatus.message)
      return
    }

    const jenis = p.jenis_cuti ? p.jenis_cuti.toLowerCase() : ''
    if (jenis.includes('tahunan') || jenis.includes('izin')) {
      const { data: dataStaf, error: errorFetch } = await supabase
        .from('profil_karyawan_v2')
        .select('sisa_cuti')
        .ilike('email', p.email_karyawan)
        .single()

      if (errorFetch) {
        alert('Gagal mengambil kuota staf: ' + errorFetch.message)
        return
      }

      if (dataStaf) {
        const kalkulasiSisa = dataStaf.sisa_cuti - p.total_hari
        const { error: errorUpdateProfil } = await supabase
          .from('profil_karyawan_v2')
          .update({ sisa_cuti: kalkulasiSisa })
          .ilike('email', p.email_karyawan)

        if (errorUpdateProfil) {
          alert('Gagal memotong kuota staf: ' + errorUpdateProfil.message)
          return
        }
      }
    }

    alert('Pengajuan cuti staf berhasil disetujui secara resmi')
    muatPengajuanCuti()
    muatKaryawan()
  }

  const tanganiTolak = async (id) => {
    const { error } = await supabase
      .from('pengajuan_cuti')
      .update({ status: 'Ditolak' })
      .eq('id', id)

    if (error) {
      alert('Gagal menolak proses: ' + error.message)
    } else {
      alert('Pengajuan cuti tersebut telah ditolak')
      muatPengajuanCuti()
    }
  }

  const tanganiSimpan = async (e) => {
    e.preventDefault()

    const payload = {
      nama_lengkap: namaLengkap,
      email: email,
      jabatan: jabatan,
      no_hp: noHp,
      tanggal_masuk: tanggalMasuk,
      sisa_cuti: parseInt(sisaCuti),
      cabang: cabang
    }

    if (idEdit) {
      const { error } = await supabase
        .from('profil_karyawan_v2')
        .update(payload)
        .eq('id', idEdit)

      if (error) {
        alert('Gagal memperbarui data: ' + error.message)
      } else {
        alert('Data karyawan berhasil diperbarui!')
        resetForm()
        muatKaryawan()
      }
    } else {
      const { data: authData, error: authError } = await supabaseSampingan.auth.signUp({
        email: email,
        password: password
      })

      if (authError) {
        alert('Gagal mendaftarkan akun login: ' + authError.message)
        return
      }

      const { error: profilError } = await supabase
        .from('profil_karyawan_v2')
        .insert([{
          id: authData.user.id,
          ...payload
        }])

      if (profilError) {
        alert('Gagal membuat profil data: ' + profilError.message)
      } else {
        alert('Karyawan baru sukses didaftarkan ke sistem!')
        resetForm()
        muatKaryawan()
      }
    }
  }

  const tanganiEdit = (k) => {
    setIdEdit(k.id)
    setNamaLengkap(k.nama_lengkap)
    setEmail(k.email)
    setJabatan(k.jabatan)
    setNoHp(k.no_hp || '')
    setTanggalMasuk(k.tanggal_masuk)
    setSisaCuti(k.sisa_cuti)
    setPassword('')
    setCabang(k.cabang || 'Palu')
  }

  const tanganiHapus = async (id) => {
    if (!confirm('Apakah kamu yakin ingin menghapus staf ini?')) return
    const { error } = await supabase.from('profil_karyawan_v2').delete().eq('id', id)
    if (!error) muatKaryawan()
  }

  const resetForm = () => {
    setIdEdit(null)
    setNamaLengkap('')
    setEmail('')
    setJabatan('')
    setNoHp('')
    setTanggalMasuk('')
    setSisaCuti(0)
    setPassword('')
    setCabang('Palu')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-yellow-100 bg-gradient-to-r from-white to-yellow-50/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <h2 className="text-base font-bold text-gray-800">Persetujuan Cuti Masuk (Butuh Verifikasi)</h2>
        </div>
        
        {loadingCuti ? (
          <p className="text-xs text-gray-400">Memeriksa pengajuan masuk...</p>
        ) : pengajuanMasuk.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Bersih. Tidak ada pengajuan cuti yang tertunda saat ini.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pengajuanMasuk.map(p => (
              <KartuPersetujuanCuti key={p.id} onSetujui={tanganiSetujui} onTolak={tanganiTolak} p={p}/>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          {idEdit ? 'Perbarui Data Staf Maxima' : 'Registrasi Karyawan Baru'}
        </h2>
        <form onSubmit={tanganiSimpan} className="grid grid-cols-1 md:grid-cols-2 gap-4" autoComplete="off">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nama Lengkap</label>
            <input type="text" value={namaLengkap} onChange={e => setNamaLengkap(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" required autoComplete="off" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Email Resmi</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" required disabled={!!idEdit} autoComplete="off" />
          </div>
          {!idEdit && (
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Kata Sandi Akun</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" required autoComplete="new-password" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Posisi Jabatan</label>
            <input type="text" value={jabatan} onChange={e => setJabatan(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" required autoComplete="off" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cabang Penugasan</label>
            <select value={cabang} onChange={e => setCabang(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600">
              <option value="Palu">Maxima Palu</option>
              <option value="Luwuk">Maxima Luwuk</option>
              <option value="Morowali">Maxima Morowali</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nomor WhatsApp</label>
            <input type="text" value={noHp} onChange={e => setNoHp(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" autoComplete="off" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tanggal Masuk Kerja</label>
            <input type="date" value={tanggalMasuk} onChange={tanganiTanggalMasukChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Kuota Hak Cuti</label>
            <input type="number" value={sisaCuti} onChange={e => setSisaCuti(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600" required />
          </div>
          <div className="md:col-span-2 flex gap-2 pt-2">
            <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md">
              {idEdit ? 'Simpan Hasil Edit' : 'Mulai Daftarkan Karyawan'}
            </button>
            {idEdit && (
              <button type="button" onClick={resetForm} className="w-28 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl text-sm transition">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Daftar Anggota Karyawan</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full mt-1 inline-block">{karyawan.length} Orang</span>
          </div>
          <div className="w-full sm:w-64">
            <input type="text" placeholder="Cari nama atau jabatan..." value={kataKunci} onChange={e => setKataKunci(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-600" />
          </div>
        </div>
        
        {loading ? (
          <p className="p-6 text-center text-gray-400 text-sm">Sedang menarik data...</p>
        ) : (
          <div className="p-4 space-y-6">
            {['Palu', 'Luwuk', 'Morowali'].map(cab => {
              const karyawanCabang = karyawan
                .filter(k => (k.cabang || 'Palu').toLowerCase() === cab.toLowerCase())
                .filter(k => {
                  const namaMatch = k.nama_lengkap.toLowerCase().includes(kataKunci.toLowerCase())
                  const jabMatch = (k.jabatan || '').toLowerCase().includes(kataKunci.toLowerCase())
                  return namaMatch || jabMatch
                })
                .sort((a, b) => {
                  const bobotA = dapatkanBobotJabatan(a.jabatan)
                  const bobotB = dapatkanBobotJabatan(b.jabatan)
                  if (bobotA !== bobotB) return bobotA - bobotB
                  return a.nama_lengkap.localeCompare(b.nama_lengkap)
                })

              if (karyawanCabang.length === 0) return null

              return (
                <div key={cab} className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-blue-50/50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-xs text-blue-950 uppercase tracking-wider">Cabang {cab}</span>
                    <span className="bg-blue-100 text-blue-800 text-xxs font-bold px-2.5 py-0.5 rounded-full">{karyawanCabang.length} Orang</span>
                  </div>
                  
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase border-b border-gray-100">
                          <th className="p-4">Nama Karyawan</th>
                          <th className="p-4">Jabatan</th>
                          <th className="p-4">Mulai Kerja</th>
                          <th className="p-4 text-center">Sisa Kuota</th>
                          <th className="p-4 text-center">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {karyawanCabang.map(k => (
                          <tr key={k.id} className="hover:bg-gray-50/50 transition">
                            <td className="p-4 font-semibold text-gray-900">{k.nama_lengkap}</td>
                            <td className="p-4 text-gray-500">{k.jabatan}</td>
                            <td className="p-4">{k.tanggal_masuk}</td>
                            <td className="p-4 text-center">
                              {k.sisa_cuti < 0 ? (
                                <span className="text-red-600 font-bold">Hutang {Math.abs(k.sisa_cuti)} Hari</span>
                              ) : (
                                <span className="text-blue-700 font-bold">{k.sisa_cuti} Hari</span>
                              )}
                            </td>
                            <td className="p-4 flex justify-center gap-2">
                              <button onClick={() => tanganiEdit(k)} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium">Edit</button>
                              <button onClick={() => tanganiHapus(k.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium">Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="block md:hidden divide-y divide-gray-100">
                    {karyawanCabang.map(k => (
                      <div key={k.id} className="p-4 space-y-2 bg-white hover:bg-gray-50/40">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{k.nama_lengkap}</p>
                            <p className="text-xs text-gray-500">{k.jabatan}</p>
                          </div>
                          <div className="text-xs">
                            {k.sisa_cuti < 0 ? (
                              <span className="bg-red-50 text-red-700 font-bold text-xs px-2.5 py-1 rounded-full">Hutang {Math.abs(k.sisa_cuti)} Hari</span>
                            ) : (
                              <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-full">{k.sisa_cuti} Hari</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
                          <p>Masuk: {k.tanggal_masuk}</p>
                          <div className="flex gap-2">
                            <button onClick={() => tanganiEdit(k)} className="bg-green-600 text-white px-3 py-1 rounded-md font-medium shadow-sm">Edit</button>
                            <button onClick={() => tanganiHapus(k.id)} className="bg-red-600 text-white px-3 py-1 rounded-md font-medium shadow-sm">Hapus</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}