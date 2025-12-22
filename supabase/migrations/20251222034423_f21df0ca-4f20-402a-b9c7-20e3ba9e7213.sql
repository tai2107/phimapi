-- Create app_role enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create profiles table
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null default 'user',
    created_at timestamp with time zone default now() not null,
    unique (user_id, role)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- Create security definer function to check roles (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create function to check if user is admin
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = 'admin'
  )
$$;

-- Profiles RLS policies
create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

-- User roles RLS policies (only admins can manage roles)
create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.is_admin(auth.uid()));

create policy "Admins can insert roles"
on public.user_roles for insert
to authenticated
with check (public.is_admin(auth.uid()));

create policy "Admins can delete roles"
on public.user_roles for delete
to authenticated
using (public.is_admin(auth.uid()));

-- Users can view their own roles
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();