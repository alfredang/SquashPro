-- ========================================
-- SquashPro Database Schema
-- ========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ========================================
-- PROFILES TABLE
-- ========================================
-- Extends auth.users with additional profile information
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  skill_level text check (skill_level in ('Beginner', 'Intermediate', 'Advanced', 'Pro')),
  rating numeric(2,1) default 0.0 check (rating >= 0 and rating <= 5),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- COURTS TABLE
-- ========================================
create table courts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- BOOKINGS TABLE
-- ========================================
create table bookings (
  id uuid default gen_random_uuid() primary key,
  court_id uuid references courts(id) on delete cascade not null,
  host_id uuid references profiles(id) on delete cascade not null,
  guest_id uuid references profiles(id) on delete set null,
  booking_date date not null,
  booking_time time not null,
  status text check (status in ('OPEN', 'CONFIRMED', 'CANCELLED')) default 'OPEN',
  target_skill_level text check (target_skill_level in ('Beginner', 'Intermediate', 'Advanced', 'Pro', 'Any')),
  notes text,
  user_lat numeric(10, 7),
  user_lng numeric(10, 7),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- BOOKING INVITATIONS TABLE
-- ========================================
create table booking_invitations (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references bookings(id) on delete cascade not null,
  inviter_id uuid references profiles(id) on delete cascade not null,
  invitee_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('PENDING', 'ACCEPTED', 'DECLINED')) default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(booking_id, invitee_id)
);

-- ========================================
-- PLAYER REVIEWS TABLE
-- ========================================
create table player_reviews (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references profiles(id) on delete cascade not null,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  booking_id uuid references bookings(id) on delete set null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(booking_id, reviewer_id, player_id)
);

-- ========================================
-- INDEXES
-- ========================================
create index bookings_host_id_idx on bookings(host_id);
create index bookings_guest_id_idx on bookings(guest_id);
create index bookings_court_id_idx on bookings(court_id);
create index bookings_status_idx on bookings(status);
create index bookings_date_idx on bookings(booking_date);
create index booking_invitations_invitee_id_idx on booking_invitations(invitee_id);
create index player_reviews_player_id_idx on player_reviews(player_id);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_bookings_updated_at before update on bookings
  for each row execute procedure update_updated_at_column();

create trigger update_booking_invitations_updated_at before update on booking_invitations
  for each row execute procedure update_updated_at_column();

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
