import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)          // job_seekers row
  const [employerProfile, setEmployerProfile] = useState(null) // employers row
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfiles(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfiles(session.user.id)
      } else {
        setProfile(null)
        setEmployerProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfiles(userId) {
    const [seekerRes, employerRes] = await Promise.all([
      supabase.from('job_seekers').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('employers').select('*').eq('user_id', userId).maybeSingle(),
    ])
    setProfile(seekerRes.data)
    setEmployerProfile(employerRes.data)
    setLoading(false)
  }

  // Job seeker sign-up
  async function signUp({ email, password, fullName }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      const { error: profileError } = await supabase.rpc('create_job_seeker_profile', {
        p_user_id: data.user.id,
        p_full_name: fullName,
      })
      if (profileError) throw profileError
    }
    return data
  }

  // Employer sign-up — creates auth user + employers row
  async function signUpEmployer({ email, password, companyName, contactName, city, phone, website }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      const { error: profileError } = await supabase.rpc('create_employer_profile', {
        p_user_id: data.user.id,
        p_company: companyName,
        p_city: city || 'Prince George',
        p_province: 'BC',
        p_phone: phone || null,
        p_website: website || null,
      })
      if (profileError) throw profileError
    }
    return data
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user, profile, employerProfile, loading,
      signUp, signUpEmployer, signIn, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
