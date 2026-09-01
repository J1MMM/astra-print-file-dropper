-- Run once in the Supabase SQL editor.
create extension if not exists pgcrypto;
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(), customer_name text check (char_length(customer_name) <= 80), customer_email text check (char_length(customer_email) <= 160), notes text check (char_length(notes) <= 800), status text not null default 'pending' check (status in ('pending','processing','ready','completed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.submissions(id) on delete cascade, file_name text not null, storage_path text not null unique, mime_type text not null, byte_size bigint not null check (byte_size >= 0), created_at timestamptz not null default now()
);
create index if not exists submissions_created_at_idx on public.submissions(created_at desc);
create index if not exists submissions_status_idx on public.submissions(status);
create index if not exists submission_files_submission_id_idx on public.submission_files(submission_id);
alter table public.submissions enable row level security;
alter table public.submission_files enable row level security;
-- No public policies: trusted server routes use the service role after authorization.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('print-files','print-files',false,20971520,array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation']) on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
