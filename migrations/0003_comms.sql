create table if not exists activations (
  id text primary key,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists activations_email_idx on activations (email);

create table if not exists guests (
  id text primary key,
  secret_hash text not null,
  kind text not null,
  user_id text,
  contact text not null default '',
  label text not null,
  access text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists guests_user_uidx on guests (user_id) where user_id is not null;

create table if not exists payments (
  id text primary key,
  guest_id text not null,
  hostess_key text,
  kind text not null,
  amount_cents integer not null,
  currency text not null default 'ZAR',
  status text not null,
  paystack_ref text,
  pay_url text not null,
  description text not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create unique index if not exists payments_ref_uidx on payments (paystack_ref) where paystack_ref is not null;
create index if not exists payments_guest_idx on payments (guest_id);

create table if not exists threads (
  id text primary key,
  guest_id text not null,
  hostess_key text not null,
  payment_id text,
  status text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists threads_pair_uidx on threads (guest_id, hostess_key);
create index if not exists threads_hostess_idx on threads (hostess_key);

create table if not exists messages (
  id text primary key,
  thread_id text not null,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_thread_idx on messages (thread_id, created_at);
