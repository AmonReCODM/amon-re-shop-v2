"use client"

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function RealtimeAuth() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        toast.success('Connexion réussie ! Bienvenue !');
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        toast('Vous avez été déconnecté.', { icon: '👋' });
        router.push('/login');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return null;
}