import { createClient } from '@supabase/supabase-js'

// Alamat URL API resmi untuk proyek Maxima Cuti V2 milikmu
const supabaseUrl = 'https://clmrfjffvpkykwakfhyv.supabase.co'

// Ganti teks di bawah dengan Project Anon API Key asli dari dashboard Supabase
const supabaseAnonKey = 'sb_publishable_qzfJWnxTIRa-lYYddGMeAw_2DIRFGVc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)