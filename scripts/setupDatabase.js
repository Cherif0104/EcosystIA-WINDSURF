import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdiqyvwzjiiaktwizxul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaXF5dnd6amlpYWt0d2l6eHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjk3NzksImV4cCI6MjA3MzIwNTc3OX0.FWnSb5Ulor7xYylUDJLu02E49FnGHpCog9MxH2uodQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Configuration de la base de données...\n');

  try {
    // 1. Créer la table users
    console.log('📝 Création de la table users...');
    const { data: tableData, error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          full_name TEXT,
          role TEXT NOT NULL DEFAULT 'student',
          phone TEXT,
          location TEXT,
          skills TEXT[] DEFAULT '{}',
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (tableError) {
      console.error('❌ Erreur création table:', tableError.message);
      console.log('⚠️  Vous devez créer la table manuellement dans le SQL Editor de Supabase');
      console.log('📋 Voici le SQL à exécuter :');
      console.log(`
-- Créer la table users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    phone TEXT,
    location TEXT,
    skills TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_administrator'
        )
    );
      `);
      return;
    }

    console.log('✅ Table users créée avec succès !');

    // 2. Configurer RLS
    console.log('🔒 Configuration des politiques RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON public.users
          FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own profile" ON public.users
          FOR UPDATE USING (auth.uid() = id);
        
        CREATE POLICY "Super admins can view all users" ON public.users
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE id = auth.uid() 
              AND role = 'super_administrator'
            )
          );
      `
    });

    if (rlsError) {
      console.error('❌ Erreur configuration RLS:', rlsError.message);
    } else {
      console.log('✅ Politiques RLS configurées !');
    }

    // 3. Insérer l'utilisateur existant
    console.log('👤 Ajout de l\'utilisateur existant dans la table users...');
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: 'b4f19755-4cbf-4974-ad14-f81f8fe724fd', // ID de l'utilisateur existant
        email: 'contact@impulcia-afrique.com',
        first_name: 'Super',
        last_name: 'Admin',
        full_name: 'Super Admin',
        role: 'super_administrator',
        phone: '+221 77 123 45 67',
        location: 'Dakar, Sénégal',
        skills: [],
        avatar_url: null
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur insertion utilisateur:', insertError.message);
    } else {
      console.log('✅ Utilisateur ajouté à la table users !');
      console.log('   Email: contact@impulcia-afrique.com');
      console.log('   Role: super_administrator');
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('🔐 Vous pouvez maintenant vous connecter avec :');
    console.log('   Email: contact@impulcia-afrique.com');
    console.log('   Mot de passe: [votre mot de passe]');

  } catch (error) {
    console.error(`❌ Erreur générale:`, error.message);
  }
}

// Exécuter le script
setupDatabase().catch(console.error);
