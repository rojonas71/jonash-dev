import { ReactNode } from 'react'
export default function StaticPage({eyebrow,title,children}:{eyebrow:string,title:string,children:ReactNode}){return <section className="section page-top"><div className="container"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</div></section>}
