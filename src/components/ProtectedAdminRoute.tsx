import { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Props = { children: ReactNode }

export default function ProtectedAdminRoute({ children }: Props) {
  const [state, setState] = useState<'loading' | 'allowed' | 'denied'>('loading')

  useEffect(() => {
    let active = true

    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (active) setState('denied')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (active) setState(!error && data?.role === 'admin' ? 'allowed' : 'denied')
    }

    checkAccess()
    return () => { active = false }
  }, [])

  if (state === 'loading') return <div className="screen-center">Validando acesso…</div>
  if (state === 'denied') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
