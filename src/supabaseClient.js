import { createClient } from '@supabase/supabase-js'

// --- Configuration de la Connexion ---
// IMPORTANT : Remplacez les valeurs ci-dessous par VOS PROPRES informations
// que vous trouverez dans les paramètres "API" de votre projet sur le site de Supabase.

const supabaseUrl = 'https://zzkwtcwddciwyjqcjulk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a3d0Y3dkZGNpd3lqcWNqdWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDE5MjQsImV4cCI6MjA3NDY3NzkyNH0.22M905Qra7pRmtFdYKrQGWFofb7aYaXM5Lcm7HLbZXg'

// Création d'une instance unique du client Supabase pour toute l'application
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
