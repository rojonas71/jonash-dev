import { ArrowRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export type Project = {
  title: string
  description: string
  category: string
  status: string
  slug?: string
  coverUrl?: string | null
  demoUrl?: string | null
  tags?: string[]
}

type Props = Partial<Project> & { project?: Project }

export default function ProjectCard(props: Props) {
  const source = props.project ?? props
  const title = source.title ?? 'Projeto Jonash.dev'
  const description = source.description ?? ''
  const category = source.category ?? 'Projeto'
  const status = source.status ?? 'Em desenvolvimento'
  const coverUrl = source.coverUrl
  const demoUrl = source.demoUrl
  const slug = source.slug
  const tags = source.tags ?? []

  return <article className="project-card">
    {coverUrl ? <img className="project-cover" src={coverUrl} alt={`Capa do projeto ${title}`} loading="lazy" /> : <div className="project-cover project-cover-placeholder"><span>{category}</span></div>}
    <div className="project-card-body">
      <div className="project-meta"><span>{category}</span><span>•</span><span>{status}</span></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {tags.length > 0 && <div className="tag-list">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
      <div className="project-links">
        {slug && <Link className="text-link" to={`/projetos/${slug}`}>Ver detalhes <ArrowRight size={15}/></Link>}
        {demoUrl && <a className="text-link" href={demoUrl} target="_blank" rel="noreferrer">Demonstração <ExternalLink size={15}/></a>}
      </div>
    </div>
  </article>
}
