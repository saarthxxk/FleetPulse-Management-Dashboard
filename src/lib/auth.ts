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

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('User creation failed')

  // Create profile
  const profileData = {
    id: authData.user.id,
    full_name: fullName,
    role: 'operator' as const,
  }

  const { data: profile, error: profileError } = await (
    supabase
      .from('profiles')
      .insert([profileData] as any)
      .select()
      .single() as any
  )

  if (profileError) throw profileError

  return { user: authData.user, profile: profile as UserProfile }
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

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select()
    .eq('id', authData.user.id)
    .single()

  if (profileError) throw profileError

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

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select()
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Failed to fetch profile:', profileError)
    return null
  }

  return { user, profile: profile as UserProfile }
}

export function onAuthStateChange(
  callback: (data: { user: { id: string; email: string } | null; profile: UserProfile | null }) => void
) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('id', session.user.id)
        .single()

      callback({
        user: { id: session.user.id, email: session.user.email || '' },
        profile: (profile as unknown as UserProfile) || null,
      })
    } else {
      callback({ user: null, profile: null })
    }
  })
}
