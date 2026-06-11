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

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (authError) throw authError

  // Supabase returns identities: [] for duplicate emails when confirm is on
  if (authData.user && authData.user.identities?.length === 0) {
    throw new Error('Email is already registered')
  }

  if (!authData.user) throw new Error('Sign up failed')

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

  // Fetch existing profile
  let { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  // First login after confirmation — profile doesn't exist yet, create it
  if (!profileData) {
    const fullName =
      (authData.user.user_metadata?.full_name as string | undefined) ??
      email.split('@')[0]

    // Cast payload to any to avoid the Supabase typed client's 'never[]' inference
    // on tables whose Insert type differs from Row (id is normally auto-generated
    // but here we're providing it explicitly to match the auth user UUID).
    const { data: newProfileData, error: insertError } = await (supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ id: authData.user.id, full_name: fullName, role: 'operator' } as any)
      .select('*')
      .single() as any)

    if (insertError) {
      console.warn('[auth] Profile insert failed:', insertError.message)
    } else {
      profileData = newProfileData
    }
  }

  // Cast through unknown to satisfy strict null checks —
  // profileData is UserProfile at runtime; null only if insert failed above.
  const profile = profileData as unknown as UserProfile | null

  return { user: authData.user, profile }
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

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as unknown as UserProfile | null
  return { user, profile }
}

export function onAuthStateChange(
  callback: (data: {
    user: { id: string; email: string } | null
    profile: UserProfile | null
  }) => void
) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      const profile = profileData as unknown as UserProfile | null

      callback({
        user: { id: session.user.id, email: session.user.email ?? '' },
        profile,
      })
    } else {
      callback({ user: null, profile: null })
    }
  })
}