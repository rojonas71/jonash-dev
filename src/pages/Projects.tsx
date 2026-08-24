import { useEffect, useMemo, useState } from 'react'
import ProjectCard from '../components/ProjectCard'
import { supabase } from '../lib/supabase'
import type { ProjectSummary } from '../types'

const filters = ['Todos', 'Web', 'Aplicativo', 'Inteligência Artificial', 'Cristão', 'SaaS', 'Experimento', 'Sistema']

export default function Projects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Todos')

  useEffect(() => {
    supabase.from('projects')
      .select('id,title,slug,short_description,category,status,cover_url,demo_url')
      .eq('published', true)
      .order('display_order')
      .then(({ data }) => { setProjects((data ?? []) as ProjectSummary[]); setLoading(false) })
  }, [])

  const visible = useMemo(() => activeFilter === 'Todos' ? projects : projects.filter(project => project.category === activeFilter), [projects, activeFilter])

  return <main className="page"><section className="section"><div className="container">
    <span className="eyebrow">PORTFÓLIO</span><h1>Projetos que estou construindo</h1>
    <p className="section-lead">Ideias que estão saindo do papel e se transformando em experiências reais.</p>
    <div className="filters" aria-label="Filtros de projetos">{filters.map(filter => <button key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
    {loading ? <p>Carregando projetos…</p> : visible.length === 0 ? <div className="empty-state">Nenhum projeto publicado nesta categoria ainda.</div> : <div className="project-grid">{visible.map(project => <ProjectCard key={project.id} title={project.title} description={project.short_description || 'Projeto Jonash.dev'} category={project.category} status={project.status} coverUrl={project.cover_url} demoUrl={project.demo_url} slug={project.slug} />)}</div>}
  </div></section></main>
}
