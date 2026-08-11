import { createClient } from "@supabase/supabase-js";

// Pegamos as chaves escondidas no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Criamos e exportamos a ponte de conexão
export const supabase = createClient(supabaseUrl, supabaseKey);
