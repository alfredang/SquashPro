-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table courts enable row level security;
alter table bookings enable row level security;
alter table booking_invitations enable row level security;
alter table player_reviews enable row level security;

-- ========================================
-- PROFILES POLICIES
-- ========================================

-- Everyone can view all profiles (needed to see other players)
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

-- Users can insert their own profile (handled by trigger, but allow manual creation)
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Users can update only their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ========================================
-- COURTS POLICIES
-- ========================================

-- Everyone can view all courts
create policy "Courts are viewable by everyone"
  on courts for select
  using (true);

-- Only authenticated users can create courts (for admin functionality)
create policy "Authenticated users can insert courts"
  on courts for insert
  with check (auth.role() = 'authenticated');

-- ========================================
-- BOOKINGS POLICIES
-- ========================================

-- Everyone can view all bookings (needed for "Find Match" feature)
create policy "Bookings are viewable by everyone"
  on bookings for select
  using (true);

-- Authenticated users can create bookings as the host
create policy "Users can create bookings"
  on bookings for insert
  with check (auth.uid() = host_id);

-- Users can update their own bookings, or join as guest if booking is open
create policy "Users can update own bookings or join as guest"
  on bookings for update
  using (
    auth.uid() = host_id or 
    (status = 'OPEN' and guest_id is null and auth.uid() is not null)
  );

-- Users can delete only their own bookings (as host)
create policy "Users can delete own bookings"
  on bookings for delete
  using (auth.uid() = host_id);

-- ========================================
-- BOOKING INVITATIONS POLICIES
-- ========================================

-- Users can see invitations where they are the inviter or invitee
create policy "Users can view their invitations"
  on booking_invitations for select
  using (auth.uid() = inviter_id or auth.uid() = invitee_id);

-- Users can create invitations for their own bookings
create policy "Users can send invitations for own bookings"
  on booking_invitations for insert
  with check (
    auth.uid() = inviter_id and
    exists (
      select 1 from bookings
      where bookings.id = booking_id
      and bookings.host_id = auth.uid()
    )
  );

-- Users can update invitations where they are the invitee (accept/decline)
create policy "Users can update invitations sent to them"
  on booking_invitations for update
  using (auth.uid() = invitee_id);

-- Users can delete invitations they created
create policy "Users can delete own invitations"
  on booking_invitations for delete
  using (auth.uid() = inviter_id);

-- ========================================
-- PLAYER REVIEWS POLICIES
-- ========================================

-- Everyone can view all reviews (public ratings)
create policy "Reviews are viewable by everyone"
  on player_reviews for select
  using (true);

-- Authenticated users can create reviews
create policy "Users can create reviews"
  on player_reviews for insert
  with check (auth.uid() = reviewer_id);

-- Users can update only their own reviews
create policy "Users can update own reviews"
  on player_reviews for update
  using (auth.uid() = reviewer_id);

-- Users can delete only their own reviews
create policy "Users can delete own reviews"
  on player_reviews for delete
  using (auth.uid() = reviewer_id);
