import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jurgkcylzdxilkmrqbql.supabase.co"; // Supabase projenizin URL'si
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cmdrY3lsemR4aWxrbXJxYnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTIxODMsImV4cCI6MjA2MzM4ODE4M30.JyxE5c0pknl0h9YqHAwKkAk_Fh4-2koqrH_ZkSjLoNk"; // Supabase projenizin anon key'i

if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
  console.warn(
    "Supabase URL'si ayarlanmamış. Lütfen src/supabaseClient.js dosyasını güncelleyin."
  );
}
if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
  console.warn(
    "Supabase Anon Key'i ayarlanmamış. Lütfen src/supabaseClient.js dosyasını güncelleyin."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
