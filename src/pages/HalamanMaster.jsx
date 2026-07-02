import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'

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

  useEffect(() => {
    muatKaryawan()
    muatPengajuanCuti()
    resetForm()
  }, [])

  const muatKaryawan = async () => {
    setLoading(true)
    const { data, error }