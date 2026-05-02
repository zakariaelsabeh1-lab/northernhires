-- ============================================================
-- NorthernHires — Seed Data (dev / demo)
-- Run AFTER schema.sql.
-- Creates placeholder auth.users first so the FK on employers
-- is satisfied, then inserts employers and jobs.
-- ============================================================

-- ── 1. Placeholder auth.users ───────────────────────────────
-- These are demo-only accounts. They satisfy the FK constraint
-- but are not intended for actual login.
insert into auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000092', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-unbc@northernhires.dev',        '$2a$10$placeholder.hash.seed.data.only', now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
  ('00000000-0000-0000-0000-000000000093', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-cn@northernhires.dev',           '$2a$10$placeholder.hash.seed.data.only', now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
  ('00000000-0000-0000-0000-000000000094', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-whitegoat@northernhires.dev',    '$2a$10$placeholder.hash.seed.data.only', now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
  ('00000000-0000-0000-0000-000000000095', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-interfor@northernhires.dev',     '$2a$10$placeholder.hash.seed.data.only', now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
  ('00000000-0000-0000-0000-000000000096', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-sd57@northernhires.dev',         '$2a$10$placeholder.hash.seed.data.only', now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
  ('00000000-0000-0000-0000-000000000097', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-nfreight@northernhires.dev',     '$2a$10$placeholder.hash.seed.data.only', now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
  ('00000000-0000-0000-0000-000000000098', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-uhnbc@northernhires.dev',        '$2a$10$placeholder.hash.seed.data.only', now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
  ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'seed-canfor@northernhires.dev',       '$2a$10$placeholder.hash.seed.data.only', now(), '{"provider":"email","providers":["email"]}', '{}', false, now(), now())
on conflict (id) do nothing;

-- ── 2. Employers ─────────────────────────────────────────────
insert into public.employers (id, user_id, company_name, description, website, city, province, verified)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000099', 'Canfor',                          'One of BC''s largest forest products companies.',              'https://canfor.com',         'Prince George', 'BC', true),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000098', 'University Hospital of Northern BC', 'The main referral hospital for Northern BC.',                'https://northernhealth.ca',  'Prince George', 'BC', true),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000097', 'Northern Freight Ltd.',            'Regional trucking and logistics across Northern BC.',          null,                         'Prince George', 'BC', false),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000096', 'SD57 Prince George',               'School District 57 serving Prince George and area.',          'https://sd57.bc.ca',         'Prince George', 'BC', true),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000095', 'Interfor Corporation',             'Global forest products company with operations in Northern BC.', 'https://interfor.com',     'Vanderhoof',    'BC', true),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000094', 'White Goat Brewing',               'Prince George''s favourite craft brewery.',                   null,                         'Prince George', 'BC', false),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000093', 'CN Rail',                          'Major rail network through Northern BC.',                     'https://cn.ca',              'Prince George', 'BC', true),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000092', 'UNBC',                             'University of Northern British Columbia.',                    'https://unbc.ca',            'Prince George', 'BC', true)
on conflict (id) do nothing;

-- ── 3. Jobs ──────────────────────────────────────────────────
insert into public.jobs (employer_id, title, description, category, job_type, salary_min, salary_max, salary_type, city, province, region, is_featured)
values
  -- Trades & Construction
  ('00000000-0000-0000-0000-000000000001', 'Heavy Equipment Operator',
   'Operate and maintain heavy equipment including bulldozers, excavators, and log loaders at our Prince George operation. Valid Class 5 licence required. Safety training provided.',
   'Trades & Construction', 'full-time', 35, 48, 'hourly', 'Prince George', 'BC', 'Prince George', true),

  ('00000000-0000-0000-0000-000000000005', 'Millwright',
   'Maintain and repair industrial machinery at the Vanderhoof sawmill. Red Seal certification preferred. Shift work.',
   'Trades & Construction', 'full-time', 40, 52, 'hourly', 'Vanderhoof', 'BC', 'Vanderhoof', false),

  ('00000000-0000-0000-0000-000000000001', 'Electrician — Industrial',
   'Journeyman Electrician for mill electrical maintenance. Valid BC Electrician Certificate of Qualification required.',
   'Trades & Construction', 'full-time', 42, 55, 'hourly', 'Prince George', 'BC', 'Prince George', false),

  -- Healthcare
  ('00000000-0000-0000-0000-000000000002', 'Registered Nurse — ICU',
   'Join our Intensive Care Unit team at UHNBC. BCNU experience and critical care certification an asset. Relocation assistance available for qualified candidates.',
   'Healthcare', 'full-time', 42, 58, 'hourly', 'Prince George', 'BC', 'Prince George', true),

  ('00000000-0000-0000-0000-000000000002', 'Licensed Practical Nurse',
   'LPN for medical-surgical unit. Registration with BCCNM required. Day/night rotation.',
   'Healthcare', 'full-time', 32, 40, 'hourly', 'Prince George', 'BC', 'Prince George', false),

  ('00000000-0000-0000-0000-000000000002', 'Healthcare Aide',
   'Provide personal care support to patients in acute care. No experience necessary — training provided. Part-time and casual positions available.',
   'Healthcare', 'casual', 22, 26, 'hourly', 'Prince George', 'BC', 'Prince George', false),

  -- Trucking & Logistics
  ('00000000-0000-0000-0000-000000000003', 'Long Haul Truck Driver',
   'Class 1 drivers needed for runs between Prince George, Fort St. John, and Vancouver. Home on weekends. Clean abstract required.',
   'Trucking & Logistics', 'full-time', 28, 36, 'hourly', 'Prince George', 'BC', 'Prince George', false),

  ('00000000-0000-0000-0000-000000000007', 'Rail Traffic Coordinator',
   'Coordinate rail movements across the Prince George CN yard. Computer skills and strong attention to detail required.',
   'Trucking & Logistics', 'full-time', 55000, 70000, 'annual', 'Prince George', 'BC', 'Prince George', false),

  -- Education
  ('00000000-0000-0000-0000-000000000004', 'Elementary School Teacher',
   'Grade 3-5 teacher for the 2025–26 school year. BC Teaching Certificate required. Criminal record check required.',
   'Education', 'contract', 60000, 90000, 'annual', 'Prince George', 'BC', 'Prince George', false),

  ('00000000-0000-0000-0000-000000000008', 'Academic Advisor',
   'Support undergraduate students in navigating degree requirements and career planning. Master''s degree preferred.',
   'Education', 'full-time', 55000, 68000, 'annual', 'Prince George', 'BC', 'Prince George', false),

  -- Forestry
  ('00000000-0000-0000-0000-000000000001', 'Forest Technician',
   'Conduct forest inventories, cruise timber, and support silviculture operations across our Northern BC tenure. Must have a valid driver''s licence and be comfortable working in remote conditions.',
   'Forestry & Natural Resources', 'seasonal', 24, 30, 'hourly', 'Prince George', 'BC', 'Prince George', false),

  -- Hospitality
  ('00000000-0000-0000-0000-000000000006', 'Restaurant Manager',
   'Lead front-of-house operations at White Goat Brewing. 2+ years management experience. Smart Serve or Serving It Right required.',
   'Hospitality & Food Service', 'full-time', 50000, 62000, 'annual', 'Prince George', 'BC', 'Prince George', false),

  -- Office & Admin
  ('00000000-0000-0000-0000-000000000005', 'Administrative Assistant',
   'Support the operations team at Interfor Vanderhoof. Proficiency in Microsoft Office required. Bilingual (French) an asset.',
   'Office & Admin', 'full-time', 45000, 55000, 'annual', 'Vanderhoof', 'BC', 'Vanderhoof', false),

  -- Maintenance
  ('00000000-0000-0000-0000-000000000002', 'Building Maintenance Technician',
   'Perform general maintenance and repairs across UHNBC facilities. Trade certification or equivalent experience preferred.',
   'Maintenance & Repair', 'full-time', 28, 34, 'hourly', 'Prince George', 'BC', 'Prince George', false);
