import { BarChart3, BookOpen, Briefcase, Cpu, FileText, GalleryHorizontal, GraduationCap, Home, LogOut, Mail, Settings, Share2, Trophy, Wrench } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
const items = [
  ['/admin', Home, 'Dashboard'], ['/admin/projetos', Briefcase, 'Projetos'], ['/admin/tecnologias', Cpu, 'Tecnologias'],
  ['/admin/jornada', BarChart3, 'Jornada'], ['/admin/estudos', GraduationCap, 'Estudos'], ['/admin/certificados', Trophy, 'Certificados'],
  ['/admin/conteudos', FileText, 'Conteúdos'], ['/admin/galeria', GalleryHorizontal, 'Galeria'], ['/admin/servicos', Wrench, 'Serviços'],
  ['/admin/mensagens', Mail, 'Mensagens'], ['/admin/redes', Share2, 'Redes sociais'], ['/admin/configuracoes', Settings, 'Configurações']
] as const
export default function AdminLayout(){ const nav=useNavigate(); async function logout(){await supabase.auth.signOut();nav('/admin/login')}
 return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand">Jonash<span>.dev</span><small>Dashboard</small></div><nav>{items.map(([p,I,l])=><NavLink end={p==='/admin'} key={p} to={p}><I size={18}/>{l}</NavLink>)}</nav><button className="ghost danger" onClick={logout}><LogOut size={18}/> Sair</button></aside><section className="admin-content"><Outlet/></section></div> }
