# Jonash.dev v2.0

Portfólio/CMS profissional de Jonas Henrique — **Tecnologia • IA • Projetos**.

## Stack
- React 18 + TypeScript + Vite
- React Router
- Supabase Auth + PostgreSQL + Storage + RLS
- Lucide React
- Netlify/Vercel

## Estrutura
`src/` frontend, `supabase/schema.sql` banco/RLS, `public/` SEO/PWA, `netlify.toml` deploy.

## Configuração
1. Copie `.env.example` para `.env.local`.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. No Supabase, execute `supabase/schema.sql`.
4. Crie o usuário administrador em **Authentication → Users**.
5. Use o UUID desse usuário em `public.profiles` com `role = 'admin'`.
6. Rode `npm install` e `npm run dev`.

## Build
```bash
npm install
npm run build
```

## Netlify
Build command: `npm run build`
Publish directory: `dist`

Variáveis: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

O `netlify.toml` já contém o redirect SPA.

## Admin
`/admin/login` → autenticação Supabase.

Não coloque service-role keys ou outros segredos no frontend.

## Regra de conteúdo
Cadastre somente experiências, estudos, certificados, projetos e informações reais. O painel foi pensado para permitir atualização contínua sem editar o código.
