-- ============================================
-- SEED DATA: Existing projects
-- Run this in Supabase SQL Editor AFTER running
-- the ALTER TABLE migration below
-- ============================================

INSERT INTO projects (name, slug, client, description, status, tags, features, tech, links, cover_image, published, display_order)
VALUES
(
  'CLASH — TOURNAMENT MANAGEMENT SYSTEM',
  'clash',
  NULL,
  'An all-in-one tournament platform where organizers generate and manage tournaments, and players discover events, register, and track their competitive history and results across seasons.',
  'completed',
  ARRAY['Tournament Engine', 'Bracket Generation', 'Player Profiles', 'Live Results'],
  ARRAY['Discover & register for tournaments', 'Auto-generated brackets & match schedules', 'Player history, stats & result tracking', 'Multi-sport support (volleyball, padel, beach tennis, dodgeball, spikeball)', 'Referee portal for live score entry', 'Venue & court management', 'Rankings system & player voting'],
  ARRAY['.NET', 'React', 'SQL Server', 'Docker', 'Jenkins', 'CSS', 'HTML', 'Netcup'],
  '[{"href":"https://theclasheg.com","icon":"fa-globe","label":"theclasheg.com"},{"href":"https://dashboard.theclasheg.com","icon":"fa-chart-line","label":"Dashboard"},{"href":"https://referee.theclasheg.com","icon":"fa-flag-checkered","label":"Referee Portal"}]'::jsonb,
  NULL,
  true,
  1
),
(
  'BEACHAMP — TRAINING PORTAL',
  'beachamp',
  NULL,
  'A full admin portal for managing sports training academies — track players, coaches, groups, payments, expenses, subscriptions, and scheduling with revenue analytics and daily reports.',
  'completed',
  ARRAY['Admin Dashboard', 'Player Management', 'Revenue Analytics', 'Scheduling', 'Payments'],
  ARRAY['Player, coach & group management', 'Revenue, expense & profit tracking', 'Subscription packages & payments', 'Session scheduling & daily reports'],
  ARRAY['Next.js 15', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Lucide React', 'Vercel'],
  '[{"href":"https://beachamp.org","icon":"fa-globe","label":"beachamp.org"}]'::jsonb,
  NULL,
  true,
  2
),
(
  'FL — THE FANTASY LEAGUE',
  'fl',
  NULL,
  'The ultimate fantasy football experience — create your own league with your rules, custom matches and players. Configure team budgets, auto-pricing, transfer windows, and custom point systems. Available on Android & iOS.',
  'completed',
  ARRAY['Custom Leagues', 'Auto Pricing', 'Transfer Market', 'Stat Tracking', 'Mobile App'],
  ARRAY['Configurable for any league or sport', 'Team budget & player price management', 'Transfer count limits & market', 'Custom scoring & point systems'],
  ARRAY['React Native', '.NET', 'SQL Server', 'Netcup'],
  '[{"href":"https://thefantasyleague.app","icon":"fa-globe","label":"thefantasyleague.app"},{"href":"https://play.google.com/store/apps/details?id=com.thefantasyleague","icon":"fa-google-play fa-brands","label":"Google Play"},{"href":"https://apps.apple.com/eg/app/the-fantasy-league/id6478969805","icon":"fa-apple fa-brands","label":"App Store"}]'::jsonb,
  NULL,
  true,
  3
);
