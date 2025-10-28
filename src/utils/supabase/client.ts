// src/utils/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr'

/**
 * Esta función crea un cliente de Supabase que puede ser usado de forma segura
 * en cualquier Componente de Cliente ("use client").
 * 
 * Utiliza las variables de entorno NEXT_PUBLIC_ que son accesibles desde el navegador.
 */
export function createClient() {
  // Asegúrate de que tus variables de entorno se llamen exactamente así en tu archivo .env.local
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
