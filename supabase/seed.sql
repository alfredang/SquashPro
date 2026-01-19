-- ========================================
-- Seed Data for SquashPro
-- ========================================

-- ========================================
-- COURTS DATA (Singapore)
-- ========================================
insert into courts (id, name, address, lat, lng) values
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Kallang Squash Centre', '8 Stadium Blvd, Singapore', 1.3069, 103.8760),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Burghley Squash Centre', '43 Burghley Dr, Singapore', 1.3605, 103.8643),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Yio Chu Kang Squash Centre', '200 Ang Mo Kio Ave 9, Singapore', 1.3820, 103.8450);

-- ========================================
-- SAMPLE PLAYERS (Optional)
-- ========================================
-- Note: Real users will be created when they sign up via Google OAuth
-- These are just for reference/testing purposes
-- You can manually insert test profiles if needed for development

-- Example: To create a test user profile (requires corresponding auth.users entry)
-- insert into profiles (id, name, skill_level, rating, avatar_url) values
--   ('p1p1p1p1-p1p1-p1p1-p1p1-p1p1p1p1p1p1', 'Alex Johnson', 'Advanced', 4.5, 'https://picsum.photos/100/100?random=1'),
--   ('p2p2p2p2-p2p2-p2p2-p2p2-p2p2p2p2p2p2', 'Sam Smith', 'Intermediate', 3.2, 'https://picsum.photos/100/100?random=2'),
--   ('p3p3p3p3-p3p3-p3p3-p3p3-p3p3p3p3p3p3', 'Jordan Lee', 'Pro', 4.9, 'https://picsum.photos/100/100?random=3');

-- ========================================
-- ENABLE REALTIME
-- ========================================
-- Enable realtime for bookings table so clients get live updates
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table booking_invitations;
