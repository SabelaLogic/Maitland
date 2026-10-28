create table if not exists hostesses (
  id text primary key,
  user_id text not null,
  name text not null,
  vibe text not null,
  bio text not null,
  languages text not null,
  hours text not null,
  specialties text not null,
  status text not null,
  created_at timestamptz not null default now()
);
create index if not exists hostesses_user_idx on hostesses (user_id);

create table if not exists applications (
  id text primary key,
  user_id text not null,
  name text not null,
  languages text not null,
  hours text not null,
  message text not null,
  status text not null,
  created_at timestamptz not null default now()
);
create index if not exists applications_user_idx on applications (user_id);

create table if not exists reservations (
  id text primary key,
  user_id text not null,
  guest_name text not null,
  suite text not null,
  hostess_id text not null,
  services text not null,
  duration_code text not null,
  persona text not null,
  mood text not null,
  boundary_note text not null,
  window_label text not null,
  nda_accepted boolean not null,
  phase text not null,
  status text not null,
  folio_account text not null,
  created_at timestamptz not null default now()
);
create index if not exists reservations_user_idx on reservations (user_id, created_at desc);

create table if not exists environments (
  reservation_id text primary key,
  user_id text not null,
  lighting integer not null,
  climate_tenths integer not null,
  playlist text not null,
  blackout boolean not null,
  white_noise boolean not null,
  aromatherapy text not null,
  hydrotherapy boolean not null
);

create table if not exists bar_tickets (
  id text primary key,
  user_id text not null,
  reservation_id text not null,
  item text not null,
  notes text not null,
  cents integer not null,
  status text not null,
  created_at timestamptz not null default now()
);
create index if not exists bar_res_idx on bar_tickets (reservation_id);

create table if not exists courses (
  id text primary key,
  user_id text not null,
  reservation_id text not null,
  course_no integer not null,
  dish text not null,
  status text not null,
  created_at timestamptz not null default now()
);
create index if not exists courses_res_idx on courses (reservation_id, course_no);

create table if not exists folio_lines (
  id text primary key,
  user_id text not null,
  reservation_id text not null,
  kind text not null,
  description text not null,
  cents integer not null,
  settled_via text not null,
  created_at timestamptz not null default now()
);
create index if not exists folio_res_idx on folio_lines (reservation_id, created_at);

create table if not exists gate_events (
  id text primary key,
  user_id text not null,
  reservation_id text not null,
  source text not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index if not exists gate_res_idx on gate_events (reservation_id, created_at);

create table if not exists conduct_checks (
  reservation_id text not null,
  user_id text not null,
  code text not null,
  adhered boolean not null,
  primary key (reservation_id, code)
);

create table if not exists desk_notes (
  id text primary key,
  user_id text not null,
  reservation_id text not null,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists notes_res_idx on desk_notes (reservation_id, created_at);

create table if not exists hotel_seed (
  user_id text primary key,
  seeded_at timestamptz not null default now()
);
