import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Edit3, Eye, EyeOff, ImagePlus, ListPlus, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type Project = {
  id: string
  title: string
  slug: string
  short_description: string | null
  description: string | null
  goal: string | null
  problem: string | null
  solution: string | null
  cover_url: string | null
  category: string
  status: string
  demo_url: string | null
  github_url: string | null
  featured: boolean
  published: boolean
  display_order: number
}

type FormState = Omit<Project, 'id'>

const blank: FormState = {
  title: '', slug: '', short_description: '', description: '', goal: '', problem: '', solution: '',
  cover_url: '', category: 'Web', status: 'Planejamento', demo_url: '', github_url: '', featured: false,
  published: false, display_order: 0,
}

const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState<FormState>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const isEditing = useMemo(() => Boolean(editingId), [editingId])

  async function loadProjects() {
    setLoading(true)
    const { data, error } = await supabase.from('projects').select('*').order('display_order').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    else setProjects((data ?? []) as Project[])
    setLoading(false)
  }

  useEffect(() => { loadProjects() }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function saveProject(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    const payload = { ...form, slug: form.slug || slugify(form.title), updated_at: new Date().toISOString() }
    const query = editingId
      ? supabase.from('projects').update(payload).eq('id', editingId)
      : supabase.from('projects').insert(payload)

    const { error } = await query
    if (error) setMessage(`Erro: ${error.message}`)
    else {
      setMessage(isEditing ? 'Projeto atualizado.' : 'Projeto criado.')
      setForm(blank)
      setEditingId(null)
      await loadProjects()
    }
    setSaving(false)
  }

  function editProject(project: Project) {
    const { id, ...rest } = project
    setEditingId(id)
    setForm(rest)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function removeProject(id: string, title: string) {
    if (!window.confirm(`Excluir o projeto “${title}”? Esta ação não pode ser desfeita.`)) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    setMessage(error ? `Erro: ${error.message}` : 'Projeto excluído.')
    if (!error) await loadProjects()
  }

  async function togglePublished(project: Project) {
    const { error } = await supabase.from('projects').update({ published: !project.published, updated_at: new Date().toISOString() }).eq('id', project.id)
    setMessage(error ? `Erro: ${error.message}` : project.published ? 'Projeto ocultado.' : 'Projeto publicado.')
    if (!error) await loadProjects()
  }

  async function uploadCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setMessage('Selecione um arquivo de imagem.'); return }
    if (file.size > 5 * 1024 * 1024) { setMessage('A imagem deve ter no máximo 5 MB.'); return }

    setUploading(true)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('projects').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) setMessage(`Erro no upload: ${error.message}`)
    else {
      const { data } = supabase.storage.from('projects').getPublicUrl(path)
      update('cover_url', data.publicUrl)
      setMessage('Capa enviada com sucesso.')
    }
    setUploading(false)
    event.target.value = ''
  }

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <div><span className="eyebrow">Dashboard Jonash.dev</span><h1>Projetos</h1></div>
        <Link className="btn secondary" to="/admin"><ArrowLeft size={17}/> Dashboard</Link>
      </div>

      <section className="admin-panel">
        <h2>{isEditing ? 'Editar projeto' : 'Novo projeto'}</h2>
        <form className="admin-form" onSubmit={saveProject}>
          <label>Nome<input required value={form.title} onChange={e => { update('title', e.target.value); if (!isEditing) update('slug', slugify(e.target.value)) }} /></label>
          <label>Slug<input required value={form.slug} onChange={e => update('slug', slugify(e.target.value))} /></label>
          <label className="wide">Descrição curta<textarea rows={2} value={form.short_description ?? ''} onChange={e => update('short_description', e.target.value)} /></label>
          <label className="wide">Descrição completa<textarea rows={4} value={form.description ?? ''} onChange={e => update('description', e.target.value)} /></label>
          <label>Categoria<select value={form.category} onChange={e => update('category', e.target.value)}><option>Web</option><option>Aplicativo</option><option>Inteligência Artificial</option><option>Cristão</option><option>SaaS</option><option>Experimento</option><option>Sistema</option><option>Outro</option></select></label>
          <label>Status<select value={form.status} onChange={e => update('status', e.target.value)}><option>Planejamento</option><option>Em desenvolvimento</option><option>Beta</option><option>Publicado</option><option>Pausado</option><option>Arquivado</option></select></label>
          <label>Link demo<input type="url" value={form.demo_url ?? ''} onChange={e => update('demo_url', e.target.value)} /></label>
          <label>GitHub<input type="url" value={form.github_url ?? ''} onChange={e => update('github_url', e.target.value)} /></label>
          <label>Ordem<input type="number" value={form.display_order} onChange={e => update('display_order', Number(e.target.value))} /></label>
          <label className="file-label">Capa<input type="file" accept="image/*" onChange={uploadCover} /><span className="btn secondary"><ImagePlus size={17}/>{uploading ? 'Enviando…' : 'Enviar imagem'}</span></label>
          {form.cover_url && <div className="cover-preview"><img src={form.cover_url} alt="Prévia da capa" /></div>}
          <div className="wide checks"><label><input type="checkbox" checked={form.featured} onChange={e => update('featured', e.target.checked)} /> Destaque</label><label><input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} /> Publicado</label></div>
          <div className="wide form-actions"><button className="btn primary" disabled={saving || uploading}>{saving ? 'Salvando…' : isEditing ? 'Salvar alterações' : <><Plus size={17}/> Criar projeto</>}</button>{isEditing && <button type="button" className="btn secondary" onClick={() => { setEditingId(null); setForm(blank) }}>Cancelar</button>}</div>
        </form>
        {message && <p className="admin-message">{message}</p>}
      </section>

      <section className="admin-panel">
        <h2>Projetos cadastrados</h2>
        {loading ? <p>Carregando…</p> : projects.length === 0 ? <p>Nenhum projeto cadastrado.</p> : (
          <div className="admin-project-list">
            {projects.map(project => <article className="admin-project-item" key={project.id}>
              <div>{project.cover_url ? <img className="admin-thumb" src={project.cover_url} alt="" /> : <div className="admin-thumb placeholder">J.</div>}</div>
              <div className="admin-project-copy"><strong>{project.title}</strong><span>{project.category} • {project.status}</span><small>{project.published ? 'Publicado' : 'Oculto'}</small></div>
              <div className="admin-project-actions"><Link className="icon-btn" to={`/admin/projetos/${project.id}/conteudo`} title="Funcionalidades, tecnologias e screenshots"><ListPlus size={16}/></Link>
                <button className="icon-btn" title="Editar" onClick={() => editProject(project)}><Edit3 size={17}/></button>
                <button className="icon-btn" title={project.published ? 'Ocultar' : 'Publicar'} onClick={() => togglePublished(project)}>{project.published ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
                <button className="icon-btn danger" title="Excluir" onClick={() => removeProject(project.id, project.title)}><Trash2 size={17}/></button>
              </div>
            </article>)}
          </div>
        )}
      </section>
    </main>
  )
}
