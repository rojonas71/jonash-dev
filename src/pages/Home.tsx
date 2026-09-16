import { BrainCircuit, Code2, Rocket, Sparkles, ArrowRight, Database, Globe2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

export default function Home(){
  const [projects,setProjects]=useState<any[]>([]);
  const [profile,setProfile]=useState<any>(null);
  const [stats,setStats]=useState({projects:0,technologies:0,certificates:0,posts:0});
  useEffect(()=>{
    let mounted=true;
    (async()=>{
      const [{data:projectsData},{data:profileData},{count:projectCount},{count:techCount},{count:certCount},{count:postCount}] = await Promise.all([
        supabase.from('projects').select('id,title,slug,short_description,category,status,cover_url,demo_url').eq('published',true).eq('featured',true).order('display_order').limit(3),
        supabase.from('profiles').select('full_name,display_name,headline,bio,avatar_url').eq('role','admin').limit(1).maybeSingle(),
        supabase.from('projects').select('*',{count:'exact',head:true}).eq('published',true),
        supabase.from('technologies').select('*',{count:'exact',head:true}),
        supabase.from('certificates').select('*',{count:'exact',head:true}),
        supabase.from('posts').select('*',{count:'exact',head:true}).eq('published',true),
      ]);
      if(mounted){ setProjects(projectsData??[]); setProfile(profileData); setStats({projects:projectCount??0,technologies:techCount??0,certificates:certCount??0,posts:postCount??0}); }
    })();
    return ()=>{mounted=false};
  },[]);
  return <>
    <SEO title="Jonash.dev — Tecnologia • IA • Projetos" description="Portfólio de Jonas Henrique: desenvolvimento, inteligência artificial, projetos e evolução profissional em tecnologia."/>
    <section className="hero"><div className="glow glow-one"/><div className="glow glow-two"/><div className="container hero-grid"><div><div className="eyebrow"><span/> Construindo novos projetos</div><p className="hello">Olá, eu sou {profile?.display_name || 'Jonas Henrique'} 👋</p><h1>Transformando ideias em <em>projetos reais</em> através da tecnologia.</h1><p className="hero-text">{profile?.headline || 'Desenvolvedor em evolução, explorando programação, Inteligência Artificial e novas tecnologias através de projetos práticos.'}</p><div className="badges"><span><Code2/> Desenvolvimento</span><span><BrainCircuit/> Inteligência Artificial</span><span><Rocket/> Projetos</span></div><div className="actions"><Link className="button" to="/projetos">Ver meus projetos <Rocket size={18}/></Link><Link className="button secondary" to="/jornada">Conheça minha jornada</Link><Link className="text-link" to="/contato">Entrar em contato <ArrowRight size={16}/></Link></div><div className="mini-copy">Aprendendo <b>•</b> Criando <b>•</b> Evoluindo <b>🚀</b></div></div><div className="hero-card">{profile?.avatar_url ? <img className="hero-photo" src={profile.avatar_url} alt={profile.display_name || 'Jonas Henrique'}/> : <><div className="terminal-top"><i/><i/><i/><span>jonash.dev</span></div><div className="terminal-code"><p><b>const</b> developer = {'{'}</p><p>&nbsp;&nbsp;name: <span>'Jonas Henrique'</span>,</p><p>&nbsp;&nbsp;focus: [<span>'Tecnologia'</span>, <span>'IA'</span>, <span>'Projetos'</span>],</p><p>&nbsp;&nbsp;status: <span>'evoluindo 🚀'</span></p><p>{'}'}</p></div><div className="profile-placeholder"><Sparkles/><span>Foto profissional</span><small>Configure pelo painel administrativo</small></div></>}</div></div></section>
    <section className="section"><div className="container"><span className="section-kicker">01 / VISÃO GERAL</span><h2>Uma jornada construída na prática.</h2><p className="lead">O Jonash.dev acompanha estudos, experimentos e projetos reais — com espaço para registrar o que foi aprendido, criado e evoluído.</p><div className="stats-public"><div><strong>{stats.projects}</strong><span>Projetos publicados</span></div><div><strong>{stats.technologies}</strong><span>Tecnologias</span></div><div><strong>{stats.certificates}</strong><span>Certificados</span></div><div><strong>{stats.posts}</strong><span>Conteúdos</span></div></div></div></section>
    <section className="section"><div className="container two-col"><div><span className="section-kicker">02 / SOBRE</span><h2>Quem sou eu?</h2></div><div className="copy"><p>{profile?.bio || 'Sou apaixonado por tecnologia e estou construindo minha trajetória através dos estudos, programação e desenvolvimento de projetos.'}</p><p>Cada projeto é uma oportunidade de transformar aprendizado em prática e avançar na minha jornada profissional.</p><Link className="text-link" to="/sobre">Conheça mais <ArrowRight size={16}/></Link></div></div></section>
    <section className="section dark-section"><div className="container"><span className="section-kicker">03 / PROJETOS</span><h2>Projetos que estou construindo</h2><p className="lead">Ideias que estão saindo do papel e se transformando em experiências reais.</p><div className="project-grid">{projects.map(p=><ProjectCard key={p.id} title={p.title} description={p.short_description} category={p.category} status={p.status} coverUrl={p.cover_url} demoUrl={p.demo_url} slug={p.slug}/>)}</div>{!projects.length&&<div className="empty-state">Cadastre projetos em destaque no painel administrativo.</div>}<div className="center"><Link className="button secondary" to="/projetos">Ver todos os projetos</Link></div></div></section>
    <section className="section"><div className="container"><span className="section-kicker">04 / CAMINHO</span><h2>Aprender → Criar → Testar → Evoluir</h2><p className="lead">O objetivo é transformar conhecimento em prática e prática em evolução profissional.</p><div className="process"><div><span>01</span><b>APRENDER</b><small><GraduationCap size={15}/> Estudos</small></div><div><span>02</span><b>CRIAR</b><small><Code2 size={15}/> Desenvolvimento</small></div><div><span>03</span><b>TESTAR</b><small><Database size={15}/> Dados</small></div><div><span>04</span><b>EVOLUIR</b><small><Globe2 size={15}/> Projetos reais</small></div></div></div></section>
    <section className="section dark-section"><div className="container"><span className="section-kicker">05 / IA</span><h2>IA como ferramenta de desenvolvimento</h2><div className="skills-grid"><div className="skill-card"><h3>🧠 Aprender conceitos</h3><p>Uso IA para explorar explicações e aprofundar estudos.</p></div><div className="skill-card"><h3>💡 Estruturar ideias</h3><p>Organizo funcionalidades, escopo e possibilidades.</p></div><div className="skill-card"><h3>🔍 Investigar erros</h3><p>Analiso problemas e comparo caminhos de solução.</p></div><div className="skill-card"><h3>🚀 Explorar melhorias</h3><p>Uso IA como apoio, nunca como substituta do conhecimento.</p></div></div><div className="callout">IA NÃO SUBSTITUI CONHECIMENTO. <span>Use IA para aprender, não apenas para copiar.</span></div></div></section>
  </>
}
