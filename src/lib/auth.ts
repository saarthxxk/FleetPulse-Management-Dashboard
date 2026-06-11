import { supabase } from './supabase'
import type { UserProfile } from '../types'

export interface SignUpData {
  email: string
  password: string
  fullName: string
}

export interface LoginData {
  email: string
  password: string
}

export async function signUp(data: SignUpData) {
  const { email, password, fullName } = data

  // Sign up the auth user.
  // When email confirmation is enabled, Supabase sends a verification email
  // and returns the user with identityData but no active session yet.
  // We do NOT insert into profiles here — the user isn't confirmed and has no
  // active session, so the insert will fail RLS. Profile is created on first login.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Pass full_name as metadata so a DB trigger can use it,
      // and so we can use it when creating the profile after confirmation.
      data: { full_name: fullName },
    },
  })

  if (authError) throw authError

  // Supabase returns a fake user object even for duplicate emails when
  // "Confirm email" is on — check identities to detect the duplicate case.
  if (authData.user && authData.user.identities?.length === 0) {
    throw new Error('Email is already registered')
  }

  if (!authData.user) throw new Error('Sign up failed')

  // Return a flag so LoginPage knows to show the verification message
  return { emailConfirmationRequired: true }
}

export async function login(data: LoginData) {
  const { email, password } = data

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

  if (authError) throw authError
  if (!authData.user) throw new Error('Login failed')

  // Fetch profile — may not exist yet if this is first login after confirmation.
  // If missing, create it now using the metadata stored during signUp.
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (!profile) {
    const fullName =
      (authData.user.user_metadata?.full_name as string | undefined) ?? email.split('@')[0]

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ id: authData.user.id, full_name: fullName, role: 'operator' })
      .select('*')
      .single()

    if (insertError) {
      // Non-fatal: user can still access the dashboard without a profile row
      console.warn('[auth] Profile insert failed:', insertError.message)
    } else {
      profile = newProfile
    }
  }

  return { user: authData.user, profile: profile as UserProfile }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile: (profile as UserProfile) ?? null }
}

export function onAuthStateChange(
  callback: (data: {
    user: { id: string; email: string } | null
    profile: UserProfile | null
  }) => void
) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      callback({
        user: { id: session.user.id, email: session.user.email ?? '' },
        profile: (profile as UserProfile) ?? null,
      })
    } else {
      callback({ user: null, profile: null })
    }
  })
}
