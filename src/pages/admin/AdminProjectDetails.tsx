import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ImagePlus, Link2, Plus, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { ProjectFeature, ProjectImage, Technology } from '../../types'

type ProjectRow = { id: string; title: string; slug: string }
type ProjectTechnologyRow = { technology_id: string; technologies: Technology | null }

export default function AdminProjectDetails() {
  const { id } = useParams()
  const [project, setProject] = useState<ProjectRow | null>(null)
  const [features, setFeatures] = useState<ProjectFeature[]>([])
  const [images, setImages] = useState<ProjectImage[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [linkedTechnologies, setLinkedTechnologies] = useState<ProjectTechnologyRow[]>([])
  const [featureTitle, setFeatureTitle] = useState('')
  const [featureDescription, setFeatureDescription] = useState('')
  const [technologyName, setTechnologyName] = useState('')
  const [technologyCategory, setTechnologyCategory] = useState('Frontend')
  const [technologyLevel, setTechnologyLevel] = useState('Utilizando em projetos')
  const [selectedTechnology, setSelectedTechnology] = useState('')
  const [caption, setCaption] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const linkedIds = useMemo(() => new Set(linkedTechnologies.map(item => item.technology_id)), [linkedTechnologies])
  const availableTechnologies = technologies.filter(tech => !linkedIds.has(tech.id))

  async function loadAll() {
    if (!id) return
    const [projectResult, featuresResult, imagesResult, technologiesResult, linkedResult] = await Promise.all([
      supabase.from('projects').select('id,title,slug').eq('id', id).maybeSingle(),
      supabase.from('project_features').select('*').eq('project_id', id).order('display_order'),
      supabase.from('project_images').select('*').eq('project_id', id).order('display_order'),
      supabase.from('technologies').select('*').order('name'),
      supabase.from('project_technologies').select('technology_id,technologies(id,name,category,level,icon)').eq('project_id', id),
    ])
    setProject((projectResult.data ?? null) as ProjectRow | null)
    setFeatures((featuresResult.data ?? []) as ProjectFeature[])
    setImages((imagesResult.data ?? []) as ProjectImage[])
    setTechnologies((technologiesResult.data ?? []) as Technology[])
    setLinkedTechnologies((linkedResult.data ?? []) as ProjectTechnologyRow[])
  }

  useEffect(() => { loadAll() }, [id])

  async function addFeature(event: FormEvent) {
    event.preventDefault()
    if (!id || !featureTitle.trim()) return
    const { error } = await supabase.from('project_features').insert({ project_id: id, title: featureTitle.trim(), description: featureDescription.trim() || null, display_order: features.length })
    setMessage(error ? `Erro: ${error.message}` : 'Funcionalidade adicionada.')
    if (!error) { setFeatureTitle(''); setFeatureDescription(''); await loadAll() }
  }

  async function deleteFeature(featureId: string) {
    if (!window.confirm('Excluir esta funcionalidade?')) return
    const { error } = await supabase.from('project_features').delete().eq('id', featureId)
    setMessage(error ? `Erro: ${error.message}` : 'Funcionalidade excluída.')
    if (!error) await loadAll()
  }

  async function createTechnology(event: FormEvent) {
    event.preventDefault()
    if (!technologyName.trim()) return
    const { data, error } = await supabase.from('technologies').insert({ name: technologyName.trim(), category: technologyCategory, level: technologyLevel }).select('*').single()
    if (error) setMessage(`Erro: ${error.message}`)
    else {
      setMessage('Tecnologia criada.')
      setTechnologyName('')
      if (data) setSelectedTechnology(data.id)
      await loadAll()
    }
  }

  async function linkTechnology() {
    if (!id || !selectedTechnology) return
    const { error } = await supabase.from('project_technologies').insert({ project_id: id, technology_id: selectedTechnology })
    setMessage(error ? `Erro: ${error.message}` : 'Tecnologia vinculada ao projeto.')
    if (!error) { setSelectedTechnology(''); await loadAll() }
  }

  async function unlinkTechnology(technologyId: string) {
    if (!id) return
    const { error } = await supabase.from('project_technologies').delete().eq('project_id', id).eq('technology_id', technologyId)
    setMessage(error ? `Erro: ${error.message}` : 'Tecnologia removida do projeto.')
    if (!error) await loadAll()
  }

  async function uploadScreenshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !id) return
    if (!file.type.startsWith('image/')) { setMessage('Selecione uma imagem.'); return }
    if (file.size > 5 * 1024 * 1024) { setMessage('A imagem deve ter no máximo 5 MB.'); return }
    setUploading(true)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${id}/screenshots/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('projects').upload(path, file, { cacheControl: '3600' })
    if (error) setMessage(`Erro no upload: ${error.message}`)
    else {
      const { data } = supabase.storage.from('projects').getPublicUrl(path)
      const { error: insertError } = await supabase.from('project_images').insert({ project_id: id, image_url: data.publicUrl, caption: caption.trim() || null, alt_text: caption.trim() || `Screenshot do projeto ${project?.title ?? ''}`, display_order: images.length })
      setMessage(insertError ? `Erro: ${insertError.message}` : 'Screenshot adicionado.')
      if (!insertError) { setCaption(''); await loadAll() }
    }
    setUploading(false)
    event.target.value = ''
  }

  async function deleteImage(image: ProjectImage) {
    if (!window.confirm('Excluir esta screenshot da galeria?')) return
    const { error } = await supabase.from('project_images').delete().eq('id', image.id)
    setMessage(error ? `Erro: ${error.message}` : 'Screenshot removido.')
    if (!error) await loadAll()
  }

  if (!project) return <main className="admin-page"><div className="empty-state">Carregando projeto…</div></main>

  return <main className="admin-page">
    <div className="admin-topbar"><div><span className="eyebrow">Conteúdo do projeto</span><h1>{project.title}</h1></div><div className="form-actions"><Link className="btn secondary" to="/admin/projetos"><ArrowLeft size={17}/> Projetos</Link><Link className="btn secondary" to={`/projetos/${project.slug}`} target="_blank">Ver página</Link></div></div>
    {message && <div className="admin-message admin-panel">{message}</div>}

    <section className="admin-panel"><h2>Funcionalidades</h2><form className="admin-form" onSubmit={addFeature}><label>Título<input value={featureTitle} onChange={e => setFeatureTitle(e.target.value)} placeholder="Ex.: Quiz bíblico" required/></label><label>Descrição<input value={featureDescription} onChange={e => setFeatureDescription(e.target.value)} placeholder="Explique a funcionalidade"/></label><div className="wide"><button className="button" type="submit"><Plus size={17}/> Adicionar funcionalidade</button></div></form><div className="admin-simple-list">{features.map(feature => <div key={feature.id}><div><strong>{feature.title}</strong><span>{feature.description || 'Sem descrição'}</span></div><button className="icon-btn danger" onClick={() => deleteFeature(feature.id)}><Trash2 size={16}/></button></div>)}</div></section>

    <section className="admin-panel"><h2>Tecnologias do projeto</h2><div className="admin-tech-manager"><div><h3>Vincular existente</h3><div className="inline-fields"><select value={selectedTechnology} onChange={e => setSelectedTechnology(e.target.value)}><option value="">Selecione</option>{availableTechnologies.map(tech => <option key={tech.id} value={tech.id}>{tech.name} — {tech.level}</option>)}</select><button className="button secondary" type="button" onClick={linkTechnology} disabled={!selectedTechnology}><Link2 size={16}/> Vincular</button></div></div><form onSubmit={createTechnology}><h3>Criar tecnologia</h3><div className="inline-fields"><input value={technologyName} onChange={e => setTechnologyName(e.target.value)} placeholder="Nome" required/><select value={technologyCategory} onChange={e => setTechnologyCategory(e.target.value)}><option>Frontend</option><option>Backend</option><option>Banco de dados</option><option>Ferramentas</option><option>Inteligência Artificial</option><option>Cloud</option><option>Outros</option></select><select value={technologyLevel} onChange={e => setTechnologyLevel(e.target.value)}><option>Estudando</option><option>Praticando</option><option>Utilizando em projetos</option></select><button className="button" type="submit"><Plus size={16}/> Criar</button></div></form></div><div className="technology-cloud admin-cloud">{linkedTechnologies.map(item => item.technologies && <span key={item.technology_id}><strong>{item.technologies.name}</strong><small>{item.technologies.level}</small><button onClick={() => unlinkTechnology(item.technology_id)} aria-label={`Remover ${item.technologies?.name}`}>×</button></span>)}</div></section>

    <section className="admin-panel"><h2>Screenshots e bastidores</h2><div className="admin-upload-row"><input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Legenda da screenshot"/><label className="file-label"><input type="file" accept="image/*" onChange={uploadScreenshot}/><span className="button"><ImagePlus size={17}/>{uploading ? 'Enviando…' : 'Enviar screenshot'}</span></label></div>{images.length === 0 ? <div className="empty-state">Nenhuma screenshot cadastrada.</div> : <div className="admin-screenshot-grid">{images.map(image => <article key={image.id}><img src={image.image_url} alt={image.alt_text || 'Screenshot'}/><div><span>{image.caption || 'Sem legenda'}</span><button className="icon-btn danger" onClick={() => deleteImage(image)}><Trash2 size={16}/></button></div></article>)}</div>}</section>
  </main>
}
