import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useFleetStore } from '../store/useFleetStore'

export function useAuth() {
  const setAuth = useFleetStore((s) => s.setAuth)
  const clearAuth = useFleetStore((s) => s.clearAuth)
  const navigate = useNavigate()

  useEffect(() => {
    // Bootstrap: restore session on app load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setAuth({
        user: { id: session.user.id, email: session.user.email ?? '' },
        profile: profile ?? null,
      })
    })

    // Listen for sign-out and session expiry
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          clearAuth()
          navigate('/', { replace: true })
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setAuth({
            user: { id: session.user.id, email: session.user.email ?? '' },
            profile: profile ?? null,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setAuth, clearAuth, navigate])

  async function signOut() {
    await supabase.auth.signOut()
    clearAuth()
    navigate('/', { replace: true })
  }

  return { signOut }
}