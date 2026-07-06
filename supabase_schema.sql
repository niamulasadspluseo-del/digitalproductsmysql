-- ============================================================
-- Digital Products Marketplace — Supabase schema (100% accurate)
-- Run this in your Supabase project's SQL editor.
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
create type public.app_role as enum ('admin', 'customer');
create type public.order_status as enum ('pending', 'payment_received', 'payment_not_received', 'in_progress', 'ready_for_delivery', 'delivered', 'refunded', 'cancel');
create type public.payment_method as enum ('crypto');
create type public.coupon_type as enum ('percent', 'fixed');
create type public.user_status as enum ('active', 'suspended', 'banned');

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  status public.user_status not null default 'active',
  billing jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.email);
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- USER ROLES
-- ============================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- CATEGORIES & TAGS
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories public read" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
alter table public.tags enable row level security;
create policy "Tags public read" on public.tags for select using (true);
create policy "Admins manage tags" on public.tags for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  price numeric(10,2) not null default 0,
  sale_price numeric(10,2),
  category_slug text,
  tags text[] not null default '{}',
  image text,
  gallery text[] not null default '{}',
  file_url text,
  variations jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  new_release boolean not null default false,
  best_seller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Products public read" on public.products for select using (true);
create policy "Admins manage products" on public.products for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger products_updated_at before update on public.products
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- COUPONS
-- ============================================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.coupon_type not null,
  value numeric(10,2) not null,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;
create policy "Coupons public read" on public.coupons for select using (true);
create policy "Admins manage coupons" on public.coupons for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_name text,
  user_email text,
  telegram text,
  whatsapp text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  status public.order_status not null default 'pending',
  payment_method public.payment_method,
  payment_txid text,
  payment_meta jsonb not null default '{}'::jsonb,
  billing jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Users view own orders" on public.orders for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Users create own orders" on public.orders for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Admins update orders" on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text,
  rating integer not null check (rating between 1 and 5),
  text text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create policy "Approved reviews are public" on public.reviews for select
  using (approved = true or auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Users create own reviews" on public.reviews for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users update own reviews" on public.reviews for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage reviews" on public.reviews for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- BLOG
-- ============================================================
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  cover text,
  author text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create policy "Blog public read" on public.blog_posts for select using (true);
create policy "Admins manage blog" on public.blog_posts for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- TESTIMONIALS
-- ============================================================
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  text text not null,
  avatar text,
  rating integer not null default 5,
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
create policy "Testimonials public read" on public.testimonials for select using (true);
create policy "Admins manage testimonials" on public.testimonials for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- FAQS
-- ============================================================
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.faqs enable row level security;
create policy "FAQs public read" on public.faqs for select using (true);
create policy "Admins manage faqs" on public.faqs for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STATIC PAGES
-- ============================================================
create table public.pages (
  slug text primary key,
  title text not null,
  content text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.pages enable row level security;
create policy "Pages public read" on public.pages for select using (true);
create policy "Admins manage pages" on public.pages for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger pages_updated_at before update on public.pages
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert to anon, authenticated with check (true);
create policy "Admins read messages" on public.contact_messages for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update messages" on public.contact_messages for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete messages" on public.contact_messages for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- SETTINGS (single row store)
-- ============================================================
create table public.settings (
  id text primary key default 'singleton' check (id = 'singleton'),
  brand jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  integrations jsonb not null default '{}'::jsonb,
  payments jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create policy "Settings public read" on public.settings for select using (true);
create policy "Admins manage settings" on public.settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger settings_updated_at before update on public.settings
  for each row execute function public.update_updated_at_column();

insert into public.settings (id) values ('singleton') on conflict do nothing;

-- ============================================================
-- GRANTS (table-level permissions)
-- ============================================================
grant usage on schema public to anon, authenticated;

-- Public read-only tables
grant select on public.products, public.categories, public.tags, public.coupons,
  public.blog_posts, public.testimonials, public.faqs, public.pages,
  public.settings to anon, authenticated;

-- Admin-managed tables (authenticated users need INSERT/UPDATE/DELETE for RLS)
grant insert, update, delete on public.products, public.categories, public.tags,
  public.coupons, public.blog_posts, public.testimonials, public.faqs,
  public.pages, public.settings to authenticated;

-- Profiles (user-owned)
grant select, insert, update, delete on public.profiles to authenticated;

-- Orders (user-owned + admin)
grant select, insert, update on public.orders to authenticated;

-- Reviews (user-owned + admin)
grant select, update, delete on public.reviews to authenticated;
grant insert on public.reviews to authenticated;

-- Contact messages (anon can insert, admin manages)
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

-- User roles (admin only for mutations)
grant select on public.user_roles to authenticated;

-- Service role (bypass RLS)
grant all on all tables in schema public to service_role;

-- Functions
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.update_updated_at_column() to service_role;

-- ============================================================
-- DONE
-- Next steps:
-- 1. In Supabase Auth > Providers, enable Email (and Google if needed).
-- 2. Create your first admin user (sign up via the app), then run:
--      insert into public.user_roles (user_id, role)
--      values ('<your-auth-user-id>', 'admin');
-- 3. Put your project URL + anon key into .env as:
--      VITE_SUPABASE_URL=...
--      VITE_SUPABASE_PUBLISHABLE_KEY=...
-- ============================================================
