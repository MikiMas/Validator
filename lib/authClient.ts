"use client";

import { supabase } from "./supabaseClient";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

export type AuthUser = User;

export function subscribeAuth(callback: (user: User | null, accessToken: string | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_: AuthChangeEvent, session: Session | null) => {
    callback(session?.user ?? null, session?.access_token ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function registerWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw error;
  }

  // Login automático después del registro
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    throw loginError;
  }

  return loginData.user ?? null;
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data.user ?? null;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
