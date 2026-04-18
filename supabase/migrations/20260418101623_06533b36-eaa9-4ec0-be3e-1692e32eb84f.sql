-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.collectible_category as enum ('coins','notes','stamps','antiques','medals','artifacts','books','other');
create type public.listing_status as enum ('active','sold','hidden');
create type public.identification_status as enum ('pending','reviewed','closed');

-- ============ updated_at helper ============
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

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  whatsapp text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles viewable by everyone"
  on public.profiles for select using (true);
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = user_id);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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
  select exists(
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Users view own roles"
  on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Admins manage roles"
  on public.user_roles for all using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- Trigger after user_roles exists
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ LISTINGS ============
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category public.collectible_category not null default 'coins',
  year integer,
  country text,
  condition text,
  price numeric(12,2),
  currency text not null default 'USD',
  images text[] not null default '{}',
  status public.listing_status not null default 'active',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.listings enable row level security;

create policy "Active listings viewable by everyone"
  on public.listings for select
  using (status = 'active' or auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Users create own listings"
  on public.listings for insert with check (auth.uid() = user_id);
create policy "Users update own listings"
  on public.listings for update using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Users delete own listings"
  on public.listings for delete using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.update_updated_at_column();

create index idx_listings_category on public.listings(category);
create index idx_listings_user on public.listings(user_id);
create index idx_listings_status on public.listings(status);

-- ============ IDENTIFICATION REQUESTS ============
create table public.identification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  images text[] not null default '{}',
  contact_name text,
  contact_email text,
  contact_whatsapp text,
  status public.identification_status not null default 'pending',
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.identification_requests enable row level security;

create policy "Owners and admins view requests"
  on public.identification_requests for select
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Anyone can create identification requests"
  on public.identification_requests for insert with check (true);
create policy "Admins update requests"
  on public.identification_requests for update
  using (public.has_role(auth.uid(),'admin'));

create trigger trg_idreq_updated_at
  before update on public.identification_requests
  for each row execute function public.update_updated_at_column();

-- ============ SPECIAL OFFERS ============
create table public.special_offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  link_url text,
  listing_id uuid references public.listings(id) on delete set null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.special_offers enable row level security;

create policy "Active offers viewable by everyone"
  on public.special_offers for select using (active = true or public.has_role(auth.uid(),'admin'));
create policy "Admins manage offers"
  on public.special_offers for all using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create trigger trg_offers_updated_at
  before update on public.special_offers
  for each row execute function public.update_updated_at_column();

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values ('listing-images','listing-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars','avatars', true)
  on conflict (id) do nothing;

-- listing-images policies (folder = user_id)
create policy "Listing images publicly readable"
  on storage.objects for select using (bucket_id = 'listing-images');
create policy "Users upload own listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own listing images"
  on storage.objects for update
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- avatars policies
create policy "Avatars publicly readable"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);