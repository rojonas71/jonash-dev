import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLogin(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const navigate=useNavigate()
 async function submit(e:FormEvent){e.preventDefault();setError(''); if(!supabase){setError('Configure o Supabase no arquivo .env antes de entrar.');return} const {error}=await supabase.auth.signInWithPassword({email,password}); if(error){setError(error.message);return} navigate('/admin')}
 return <main className="admin-login"><form onSubmit={submit} className="login-card"><div className="brand">Jonash<span>.dev</span></div><h1>Dashboard</h1><p>Acesso administrativo privado.</p><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="form-error">{error}</div>}<button className="button" type="submit">Entrar</button></form></main>
}
