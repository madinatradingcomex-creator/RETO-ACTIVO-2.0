import { createClient } from '@supabase/supabase-js';

// Obtenemos las credenciales desde las variables de entorno de Vite.
// Si no están configuradas, el cliente será null y la aplicación usará 
// de forma transparente el mock base de datos local (localStorage).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase no está completamente configurado. Reto Activo 2.0 está utilizando el modo de demostración local con almacenamiento persistente en el navegador (localStorage).\n\n" +
    "Para conectar Supabase real:\n" +
    "1. Crea un archivo '.env' en la raíz de tu proyecto.\n" +
    "2. Agrega las siguientes líneas con tus claves de Supabase:\n" +
    "   VITE_SUPABASE_URL=tu_supabase_url\n" +
    "   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key"
  );
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
