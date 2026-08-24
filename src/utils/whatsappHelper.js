// Ganti dengan nomor WhatsApp Branch Manager / Admin penerima (awali dengan 62)
export const NOMOR_BRANCH_MANAGER = '6282221828188'

/**
 * Membuat link WhatsApp otomatis dengan template pesan pengajuan cuti
 */
export function kirimNotifKeBranchManager({ namaStaf, jabatan, cabang, jenisCuti, tglMulai, tglSelesai, jumlahHari, alasan }) {
  const pesan = 
`*NOTIFIKASI PENGAJUAN CUTI BARU*
_Sistem Informasi Maxima Cuti_

Halo Ibu/Bapak Branch Manager,
Ada permohonan cuti baru dengan rincian:

👤 *Nama:* ${namaStaf || '-'}
💼 *Jabatan:* ${jabatan || '-'}
🏢 *Cabang:* ${cabang || '-'}
📌 *Jenis Cuti:* ${jenisCuti || '-'}
📅 *Periode:* ${tglMulai} s/d ${tglSelesai} (${jumlahHari} Hari)
📝 *Keterangan:* ${alasan || '-'}

Mohon periksa dan konfirmasi di aplikasi:
https://maxima-cuti-v2.vercel.app

_Pesan dikirim melalui Sistem Maxima Cuti._`

  const linkWa = `https://wa.me/${NOMOR_BRANCH_MANAGER}?text=${encodeURIComponent(pesan)}`
  
  // Buka WhatsApp di tab/jendela baru secara otomatis
  window.open(linkWa, '_blank')
}