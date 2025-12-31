-- 1. Tabel Cache API (Inti Data Film)
create table api_cache (
  path text primary key,
  data jsonb,
  timestamp bigint
);

-- 2. Tabel Komentar
create table comments (
  id uuid default gen_random_uuid() primary key,
  episode_slug text not null,
  name text not null,
  content text not null,
  likes int default 0,
  parent_id uuid, -- Buat reply
  created_at timestamptz default now()
);

-- 3. Tabel Voting (Like/Dislike Video)
create table video_votes (
  slug text primary key,
  likes int default 0,
  dislikes int default 0
);

-- 4. Enable RLS (Security) - Opsional kalau mau ketat
alter table comments enable row level security;
alter table video_votes enable row level security;

-- Policy: Semua orang boleh baca komen & vote
create policy "Public Read Comments" on comments for select using (true);
create policy "Public Read Votes" on video_votes for select using (true);

-- Policy: Semua orang boleh nulis komen & vote (Anon)
create policy "Public Insert Comments" on comments for insert with check (true);
create policy "Public Update Votes" on video_votes for update using (true);
create policy "Public Insert Votes" on video_votes for insert with check (true);
