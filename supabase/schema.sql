-- =============================================================
-- JONASH.DEV — SCHEMA COMPLETO
-- Execute no Supabase SQL Editor em um projeto novo ou de teste.
-- =============================================================
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text, display_name text, headline text, bio text, avatar_url text,
 role text not null default 'admin' check (role in ('admin')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin');
$$;

create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
 short_description text, description text, goal text, problem text, solution text, cover_url text, logo_url text,
 category text not null default 'Web', status text not null default 'Planejamento', demo_url text, github_url text,
 featured boolean not null default false, published boolean not null default false, started_at date, published_at timestamptz,
 display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_images (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
 image_url text not null, caption text, alt_text text, display_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.project_features (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
 title text not null, description text, display_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.technologies (
 id uuid primary key default gen_random_uuid(), name text not null unique, category text not null default 'Outros',
 level text not null default 'Estudando' check(level in ('Estudando','Praticando','Utilizando em projetos')),
 icon text, description text, display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_technologies (
 project_id uuid not null references public.projects(id) on delete cascade,
 technology_id uuid not null references public.technologies(id) on delete cascade,
 primary key(project_id,technology_id)
);
create table if not exists public.education (
 id uuid primary key default gen_random_uuid(), name text not null, institution text, category text, description text,
 start_date date, end_date date, status text, image_url text, link_url text, published boolean not null default true,
 display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.certificates (
 id uuid primary key default gen_random_uuid(), name text not null, institution text, year integer, workload text,
 category text, certificate_url text, image_url text, validation_code text, validation_url text, published boolean not null default true,
 display_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.timeline_events (
 id uuid primary key default gen_random_uuid(), title text not null, description text, event_date date, icon text, category text,
 image_url text, project_id uuid references public.projects(id) on delete set null, link_url text,
 published boolean not null default true, display_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.gallery (
 id uuid primary key default gen_random_uuid(), title text not null, caption text, category text, image_url text not null,
 alt_text text, project_id uuid references public.projects(id) on delete set null, featured boolean not null default false,
 published boolean not null default true, display_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, summary text, content text,
 category text, cover_url text, reading_time integer, author text default 'Jonas Henrique', featured boolean not null default false,
 published boolean not null default false, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.tags (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique);
create table if not exists public.post_tags (post_id uuid references public.posts(id) on delete cascade, tag_id uuid references public.tags(id) on delete cascade, primary key(post_id,tag_id));
create table if not exists public.services (
 id uuid primary key default gen_random_uuid(), name text not null, description text, icon text, benefits text,
 published boolean not null default true, display_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.social_links (
 id uuid primary key default gen_random_uuid(), platform text not null, label text, url text not null, icon text,
 enabled boolean not null default true, display_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.contact_messages (
 id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, subject text,
 contact_type text, message text not null, status text not null default 'Nova' check(status in ('Nova','Lida','Respondida','Arquivada')),
 created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
 id uuid primary key default gen_random_uuid(), site_name text default 'Jonash.dev', slogan text default 'Tecnologia • IA • Projetos',
 hero_title text, hero_subtitle text, logo_url text, favicon_url text, seo_title text, seo_description text, og_image_url text,
 email text, whatsapp text, footer_text text default 'Aprendendo. Criando. Evoluindo. 🚀', maintenance_mode boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.activity_logs (
 id uuid primary key default gen_random_uuid(), admin_id uuid references auth.users(id) on delete set null,
 action text not null, entity_type text, entity_id text, created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security; alter table public.projects enable row level security;
alter table public.project_images enable row level security; alter table public.project_features enable row level security;
alter table public.technologies enable row level security; alter table public.project_technologies enable row level security;
alter table public.education enable row level security; alter table public.certificates enable row level security;
alter table public.timeline_events enable row level security; alter table public.gallery enable row level security;
alter table public.posts enable row level security; alter table public.tags enable row level security; alter table public.post_tags enable row level security;
alter table public.services enable row level security; alter table public.social_links enable row level security;
alter table public.contact_messages enable row level security; alter table public.site_settings enable row level security;
alter table public.activity_logs enable row level security;

-- Perfil
create policy "own profile select" on public.profiles for select to authenticated using(id=auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());

-- Projetos e dependências
create policy "published projects public" on public.projects for select using(published=true or public.is_admin());
create policy "admin projects all" on public.projects for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "project images public" on public.project_images for select using(exists(select 1 from public.projects p where p.id=project_id and (p.published=true or public.is_admin())));
create policy "admin project images" on public.project_images for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "project features public" on public.project_features for select using(exists(select 1 from public.projects p where p.id=project_id and (p.published=true or public.is_admin())));
create policy "admin project features" on public.project_features for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "technologies public" on public.technologies for select using(true);
create policy "admin technologies" on public.technologies for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "project technologies public" on public.project_technologies for select using(true);
create policy "admin project technologies" on public.project_technologies for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Conteúdo publicado
create policy "education public" on public.education for select using(published=true or public.is_admin());
create policy "admin education" on public.education for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "certificates public" on public.certificates for select using(published=true or public.is_admin());
create policy "admin certificates" on public.certificates for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "timeline public" on public.timeline_events for select using(published=true or public.is_admin());
create policy "admin timeline" on public.timeline_events for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "gallery public" on public.gallery for select using(published=true or public.is_admin());
create policy "admin gallery" on public.gallery for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "posts public" on public.posts for select using(published=true or public.is_admin());
create policy "admin posts" on public.posts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "tags public" on public.tags for select using(true); create policy "admin tags" on public.tags for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "post tags public" on public.post_tags for select using(true); create policy "admin post tags" on public.post_tags for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "services public" on public.services for select using(published=true or public.is_admin());
create policy "admin services" on public.services for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "social public" on public.social_links for select using(enabled=true or public.is_admin());
create policy "admin social" on public.social_links for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "settings public" on public.site_settings for select using(true);
create policy "admin settings" on public.site_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());

-- Contato e logs
create policy "visitor contact insert" on public.contact_messages for insert to anon,authenticated with check(length(name) between 2 and 120 and length(message) between 2 and 5000);
create policy "admin contact select" on public.contact_messages for select to authenticated using(public.is_admin());
create policy "admin contact update" on public.contact_messages for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "admin contact delete" on public.contact_messages for delete to authenticated using(public.is_admin());
create policy "admin logs select" on public.activity_logs for select to authenticated using(public.is_admin());

-- Atualização automática de updated_at
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['profiles','projects','technologies','education','certificates','timeline_events','gallery','posts','services','social_links','site_settings'] loop execute format('drop trigger if exists touch_updated_at on public.%I',t); execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',t); end loop; end $$;

-- Log administrativo genérico
create or replace function public.log_admin_activity() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if public.is_admin() then insert into public.activity_logs(admin_id,action,entity_type,entity_id) values(auth.uid(),tg_op||' '||tg_table_name,tg_table_name,coalesce(new.id,old.id)::text); end if;
 return coalesce(new,old);
end $$;
do $$ declare t text; begin foreach t in array array['projects','technologies','education','certificates','timeline_events','gallery','posts','services','social_links','site_settings'] loop execute format('drop trigger if exists log_admin_activity on public.%I',t); execute format('create trigger log_admin_activity after insert or update or delete on public.%I for each row execute function public.log_admin_activity()',t); end loop; end $$;

-- Storage
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('projects','projects',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']),
 ('gallery','gallery',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']),
 ('certificates','certificates',true,10485760,array['image/jpeg','image/png','image/webp','application/pdf']),
 ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('posts','posts',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "public storage read" on storage.objects for select using(bucket_id in ('projects','gallery','certificates','avatars','posts'));
create policy "admin storage insert" on storage.objects for insert to authenticated with check(bucket_id in ('projects','gallery','certificates','avatars','posts') and public.is_admin());
create policy "admin storage update" on storage.objects for update to authenticated using(bucket_id in ('projects','gallery','certificates','avatars','posts') and public.is_admin()) with check(bucket_id in ('projects','gallery','certificates','avatars','posts') and public.is_admin());
create policy "admin storage delete" on storage.objects for delete to authenticated using(bucket_id in ('projects','gallery','certificates','avatars','posts') and public.is_admin());

-- Conteúdo inicial seguro (sem inventar métricas/experiência)
insert into public.site_settings(site_name,slogan,hero_title,hero_subtitle,footer_text)
select 'Jonash.dev','Tecnologia • IA • Projetos','Transformando ideias em projetos reais através da tecnologia.','Desenvolvedor em evolução, explorando programação, Inteligência Artificial e novas tecnologias através de projetos práticos.','Aprendendo. Criando. Evoluindo. 🚀'
where not exists(select 1 from public.site_settings);
insert into public.services(name,description,display_order) values
 ('Sites','Sites profissionais e responsivos.',1),('Aplicações Web','Experiências e sistemas acessíveis pelo navegador.',2),('Sistemas para pequenos negócios','Soluções digitais focadas em operações reais.',3),('Sistemas de agendamento','Agendamento online e organização de horários.',4),('Landing Pages','Páginas focadas em apresentação e conversão.',5),('Protótipos e MVPs','Validação rápida de ideias digitais.',6)
on conflict do nothing;

-- Após criar seu usuário em Authentication > Users, rode substituindo o UUID:
-- insert into public.profiles(id,full_name,display_name,role)
-- values ('UUID_DO_USUARIO','Jonas Henrique','Jonas','admin')
-- on conflict(id) do update set role='admin';
