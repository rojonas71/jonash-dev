import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, Github, Target, Wrench, Lightbulb, CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { ProjectDetails as Project, ProjectFeature, ProjectImage, Technology } from '../types'

type Relation = { technologies: Technology | null }

export default function ProjectDetails() {
  const { slug } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [features, setFeatures] = useState<ProjectFeature[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)

  useEffect(() => {
    if (!slug) return
    async function load() {
      const { data } = await supabase.from('projects').select('*').eq('slug', slug).eq('published', true).maybeSingle()
      if (!data) { setLoading(false); return }
      const current = data as Project
      setProject(current)
      const [{ data: imageRows }, { data: featureRows }, { data: techRows }] = await Promise.all([
        supabase.from('project_images').select('*').eq('project_id', current.id).order('display_order'),
        supabase.from('project_features').select('*').eq('project_id', current.id).order('display_order'),
        supabase.from('project_technologies').select('technologies(id,name,category,level,icon)').eq('project_id', current.id),
      ])
      setImages((imageRows ?? []) as ProjectImage[])
      setFeatures((featureRows ?? []) as ProjectFeature[])
      setTechnologies(((techRows ?? []) as Relation[]).flatMap(row => row.technologies ? [row.technologies] : []))
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <main className="page"><div className="container">Carregando projeto…</div></main>
  if (!project) return <main className="page"><div className="container"><div className="empty-state"><h2>Projeto não encontrado</h2><p>Este projeto pode estar oculto ou ainda não foi publicado.</p><Link className="button secondary" to="/projetos"><ArrowLeft size={17}/> Voltar aos projetos</Link></div></div></main>

  return <><main>
    <section className="project-hero"><div className="container project-hero-grid"><div>
      <Link className="back-link" to="/projetos"><ArrowLeft size={16}/> Todos os projetos</Link>
      <div className="project-badges"><span>{project.category}</span><span>{project.status}</span></div>
      <h1>{project.title}</h1><p>{project.short_description}</p>
      <div className="actions">{project.demo_url && <a className="button" href={project.demo_url} target="_blank" rel="noreferrer">Ver demonstração <ExternalLink size={17}/></a>}{project.github_url && <a className="button secondary" href={project.github_url} target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a>}</div>
    </div><div>{project.cover_url ? <img className="project-detail-cover" src={project.cover_url} alt={`Capa do projeto ${project.title}`} /> : <div className="project-detail-cover placeholder">Jonash.dev</div>}</div></div></section>

    <section className="section"><div className="container detail-grid">
      <article className="detail-card"><Lightbulb/><h2>Sobre o projeto</h2><p>{project.description || project.short_description || 'Descrição em construção.'}</p></article>
      <article className="detail-card"><Target/><h2>Objetivo</h2><p>{project.goal || 'O objetivo detalhado deste projeto será publicado em breve.'}</p></article>
      <article className="detail-card"><Wrench/><h2>Problema</h2><p>{project.problem || 'O problema que este projeto busca resolver será documentado em breve.'}</p></article>
      <article className="detail-card"><CheckCircle2/><h2>Solução</h2><p>{project.solution || 'A solução e as decisões do projeto serão documentadas conforme a evolução.'}</p></article>
    </div></section>

    <section className="section dark-section"><div className="container"><span className="section-kicker">FUNCIONALIDADES</span><h2>O que o projeto oferece</h2>{features.length === 0 ? <div className="empty-state">As funcionalidades serão adicionadas conforme o desenvolvimento avançar.</div> : <div className="feature-grid">{features.map(feature => <article className="feature-card" key={feature.id}><CheckCircle2/><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div>}</div></section>

    <section className="section"><div className="container"><span className="section-kicker">TECNOLOGIAS</span><h2>Tecnologias utilizadas</h2>{technologies.length === 0 ? <div className="empty-state">As tecnologias deste projeto ainda não foram cadastradas.</div> : <div className="technology-cloud">{technologies.map(technology => <span key={technology.id}><strong>{technology.name}</strong><small>{technology.level}</small></span>)}</div>}</div></section>

    <section className="section dark-section"><div className="container"><span className="section-kicker">GALERIA</span><h2>Bastidores e screenshots</h2>{images.length === 0 ? <div className="empty-state">Os bastidores deste projeto serão publicados em breve.</div> : <div className="screenshot-grid">{images.map(image => <button key={image.id} className="screenshot-button" onClick={() => setSelectedImage(image)}><img src={image.image_url} alt={image.alt_text || image.caption || `Screenshot de ${project.title}`} loading="lazy"/><span>{image.caption}</span></button>)}</div>}</div></section>
  </main>
  {selectedImage && <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setSelectedImage(null)}><button aria-label="Fechar visualização">×</button><img src={selectedImage.image_url} alt={selectedImage.alt_text || selectedImage.caption || 'Screenshot ampliado'}/>{selectedImage.caption && <p>{selectedImage.caption}</p>}</div>}
  </>
}
