"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in a real app you should validate requests
  const data = Object.fromEntries(formData);

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return redirect('/login?message=Could not authenticate user');
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const data = Object.fromEntries(formData);

  if (data.password !== data.confirmPassword) {
    return redirect('/signup?message=Passwords do not match');
  }

  const { error } = await supabase.auth.signUp({
    email: data.email as string,
    password: data.password as string,
  });

  if (error) {
    return redirect('/signup?message=Could not authenticate user');
  }

  revalidatePath('/', 'layout');
  return redirect('/login?message=Check email to continue sign in process');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect('/login');
}