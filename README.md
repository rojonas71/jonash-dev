# Jonash.dev — Sistema Completo

Portfólio + CMS administrativo construído com React, TypeScript, Vite e Supabase.

## Recursos

- Home premium e responsiva
- Sobre, Projetos, Tecnologias, Jornada, Estudos, Certificados, Conteúdos, Galeria, Serviços e Contato
- Página individual de projeto e conteúdo
- Filtros de projetos
- Formulário de contato persistido no Supabase
- Login administrativo por e-mail/senha
- Dashboard privado protegido
- CRUD de projetos, tecnologias, jornada, estudos, certificados, conteúdos, galeria, serviços e redes sociais
- Gerenciamento de funcionalidades, tecnologias e screenshots por projeto
- Mensagens recebidas no painel
- Configurações globais
- RLS em todas as tabelas sensíveis
- Storage separado por tipo de mídia
- Logs administrativos
- robots.txt e sitemap.xml
- 404 personalizada e estados vazios

## 1. Instalação

```bash
npm install
cp .env.example .env
npm run dev
```

No Windows, crie manualmente `.env` se o comando `cp` não funcionar.

## 2. Variáveis

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Nunca coloque `service_role` no frontend.

## 3. Banco

Abra Supabase > SQL Editor e execute `supabase/schema.sql`.

Recomendado: execute primeiro em um projeto novo ou de teste. Se sua base anterior já possui policies com os mesmos nomes, remova-as antes ou migre de forma incremental.

## 4. Administrador

1. Supabase > Authentication > Users > Add user.
2. Copie o UUID do usuário.
3. Execute:

```sql
insert into public.profiles(id, full_name, display_name, role)
values ('UUID_DO_USUARIO', 'Jonas Henrique', 'Jonas', 'admin')
on conflict(id) do update set role='admin';
```

4. Acesse `/admin/login`.

## 5. Projetos

No painel, crie o projeto em `/admin/projetos`. Depois abra o gerenciador de conteúdo do projeto para adicionar funcionalidades, tecnologias e screenshots.

## 6. Deploy

Compatível com Netlify/Vercel. Configure as duas variáveis `VITE_...` no ambiente de produção. Para SPA, garanta rewrite de todas as rotas para `index.html`.

## Segurança

O bloqueio visual de `/admin` não é a proteção principal. As operações de banco e storage são protegidas por RLS e pela função `is_admin()`.
