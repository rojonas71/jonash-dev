import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function PublicLayout() {
  return <div className="site-shell"><Header/><main><Outlet/></main><footer className="footer"><div className="container"><strong>Jonash.dev</strong><span>Tecnologia • IA • Projetos</span><small>Aprendendo. Criando. Evoluindo. 🚀</small></div></footer></div>
}
