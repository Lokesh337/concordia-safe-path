-- ============================================================
-- CSP (Concordia Safe Path) — Supabase Schema
-- ============================================================
-- HOW TO USE:
--   1. Open your Supabase project → SQL Editor
--   2. Paste this entire file and run it
--   3. This script is idempotent — safe to re-run at any time
--      without losing existing data
--
-- WHEN SCHEMA CHANGES:
--   1. Update this file with your changes
--   2. Commit to GitHub with a comment describing what changed
--   3. Teammates pull and re-run the file in their Supabase project
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- One row per user, auto-created on signup via trigger.
-- Stores app-specific user data beyond what Supabase auth provides.
-- ============================================================
create table if not exists profiles (
    id                      uuid primary key references auth.users(id) on delete cascade,
    role                    text default 'student' check (role in ('student', 'staff', 'guest')),
    username                text,
    mobility_needs          boolean default false,
    anxiety_triggers        boolean default false,
    elevator_access         boolean default false,
    high_contrast           boolean default false,
    reduced_motion          boolean default false,
    alert_categories        text[] default array[]::text[],
    location_consent        boolean default false,
    emergency_contacts      jsonb default '[]'::jsonb,
    preferences_completed   boolean default false,  -- true once user completes or skips the onboarding preferences screen
    -- Notification preferences (added for preferences page)
    dark_mode               boolean default false,
    accessibility_routing   boolean default false,
    distance_normal         int default 500,
    distance_silent         int default 1000,
    notif_protest           text default 'normal' check (notif_protest in ('normal', 'silent', 'muted')),
    notif_road              text default 'normal' check (notif_road in ('normal', 'silent', 'muted')),
    notif_construction      text default 'normal' check (notif_construction in ('normal', 'silent', 'muted')),
    notif_vandalism         text default 'normal' check (notif_vandalism in ('normal', 'silent', 'muted')),
    created_at              timestamptz default now()
);

alter table profiles enable row level security;

-- Add new columns if they don't exist yet (safe to re-run)
alter table profiles add column if not exists dark_mode boolean default false;
alter table profiles add column if not exists accessibility_routing boolean default false;
alter table profiles add column if not exists distance_normal int default 500;
alter table profiles add column if not exists distance_silent int default 1000;
alter table profiles add column if not exists notif_protest text default 'normal';
alter table profiles add column if not exists notif_road text default 'normal';
alter table profiles add column if not exists notif_construction text default 'normal';
alter table profiles add column if not exists notif_vandalism text default 'normal';

-- Drop and recreate policies to ensure they are always up to date
drop policy if exists "Users can view own profile" on profiles;

drop policy if exists "Public can view profiles" on profiles;
create policy "Public can view profiles"
    on profiles for select
    using (true);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- ============================================================
-- TABLE: incidents
-- Core table for all reported campus incidents.
-- ============================================================
create table if not exists incidents (
    id                      uuid primary key default gen_random_uuid(),
    user_id                 uuid references auth.users(id) on delete cascade not null,
    type                    text not null check (type in ('protest', 'construction', 'emergency', 'blockade', 'accessibility', 'safety', 'vandalism')),
    description             text,
    severity                text not null check (severity in ('low', 'medium', 'high')),
    latitude                double precision,
    longitude               double precision,
    upvotes                 int default 0,
    verified                boolean default false,
    verified_by             uuid references auth.users(id),
    followed_by             uuid[] default array[]::uuid[],
    status                  text not null default 'active' check (status in ('active', 'resolved')),
    verification_status     text default 'submitted' check (
        verification_status in (
            'submitted',
            'under_review',
            'verified_by_users',
            'verified_by_campus',
            'resolved'
        )
    ),
    created_at              timestamptz default now()
);

alter table incidents enable row level security;

drop policy if exists "Anyone can view incidents" on incidents;
create policy "Anyone can view incidents"
    on incidents for select
    using (true);

drop policy if exists "Logged in users can create incidents" on incidents;
create policy "Logged in users can create incidents"
    on incidents for insert
    with check (auth.uid() is not null);

drop policy if exists "Logged in users can upvote incidents" on incidents;
create policy "Logged in users can upvote incidents"
    on incidents for update
    using (auth.uid() is not null)
    with check (auth.uid() is not null);

drop policy if exists "Users can delete their own incidents" on incidents;
create policy "Users can delete their own incidents"
    on incidents for delete
    using (auth.uid() = user_id);

-- Enable realtime
do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
        and tablename = 'incidents'
    ) then
        alter publication supabase_realtime add table incidents;
    end if;
end $$;

alter table incidents replica identity full;
alter table incidents add column if not exists downvotes int default 0;
alter table incidents add column if not exists witnessed int default 0;
-- ============================================================
-- TABLE: comments
-- Supporting details added to existing incident reports.
-- ============================================================
create table if not exists comments (
    id          uuid primary key default gen_random_uuid(),
    incident_id uuid references incidents(id) on delete cascade not null,
    user_id     uuid references auth.users(id) on delete cascade not null,
    content     text not null,
    created_at  timestamptz default now()
);

alter table comments enable row level security;

drop policy if exists "Anyone can view comments" on comments;
create policy "Anyone can view comments"
    on comments for select
    using (true);

drop policy if exists "Logged in users can create comments" on comments;
create policy "Logged in users can create comments"
    on comments for insert
    with check (auth.uid() is not null);

drop policy if exists "Users can delete their own comments" on comments;
create policy "Users can delete their own comments"
    on comments for delete
    using (auth.uid() = user_id);

alter table comments
drop constraint if exists comments_user_id_fkey,
    add constraint comments_user_id_fkey
        foreign key (user_id) references profiles(id) on delete cascade;

-- ============================================================
-- TABLE: incident_votes
-- tracks per-user vote on an incident so votes persist across sessions
-- ============================================================
create table if not exists incident_votes (
    id          uuid primary key default gen_random_uuid(),
    incident_id uuid references incidents(id) on delete cascade not null,
    user_id     uuid references auth.users(id) on delete cascade not null,
    vote        text not null check (vote in ('up', 'down', 'witnessed')),
    created_at  timestamptz default now(),
    unique (incident_id, user_id)  -- one vote per user per incident
    );

alter table incident_votes enable row level security;

drop policy if exists "Users can view own votes" on incident_votes;
create policy "Users can view own votes"
    on incident_votes for select
                                          using (auth.uid() = user_id);

drop policy if exists "Users can insert own votes" on incident_votes;
create policy "Users can insert own votes"
    on incident_votes for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update own votes" on incident_votes;
create policy "Users can update own votes"
    on incident_votes for update
                                                      using (auth.uid() = user_id);

drop policy if exists "Users can delete own votes" on incident_votes;
create policy "Users can delete own votes"
    on incident_votes for delete
using (auth.uid() = user_id);

-- ============================================================
-- TABLE: emergency_contacts
-- Per-user emergency contacts for the resources page.
-- ============================================================
create table if not exists emergency_contacts (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete cascade not null,
    name            text not null,
    phone_number    text not null,
    created_at      timestamptz default now()
);

alter table emergency_contacts enable row level security;

drop policy if exists "Users can view own emergency contacts" on emergency_contacts;
create policy "Users can view own emergency contacts"
    on emergency_contacts for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert own emergency contacts" on emergency_contacts;
create policy "Users can insert own emergency contacts"
    on emergency_contacts for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update own emergency contacts" on emergency_contacts;
create policy "Users can update own emergency contacts"
    on emergency_contacts for update
    using (auth.uid() = user_id);

drop policy if exists "Users can delete own emergency contacts" on emergency_contacts;
create policy "Users can delete own emergency contacts"
    on emergency_contacts for delete
    using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- Reads role and username from user_metadata so the profile
-- is populated correctly whether email confirmation is on or off.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, role, username)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'role', 'student'),
        new.raw_user_meta_data->>'username'
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ============================================================
-- TABLE: notifications
-- One row per user per event (new incident or incident update).
-- ============================================================
create table if not exists notifications (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users(id) on delete cascade not null,
    incident_id uuid references incidents(id) on delete cascade not null,
    message     text not null,
    read        boolean default false,
    created_at  timestamptz default now()
);

alter table notifications enable row level security;

drop policy if exists "Users can view own notifications" on notifications;
create policy "Users can view own notifications"
    on notifications for select
    using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on notifications;
create policy "Users can update own notifications"
    on notifications for update
    using (auth.uid() = user_id);

drop policy if exists "Users can insert own notifications" on notifications;
create policy "Users can insert own notifications"
    on notifications for insert
    with check (auth.uid() = user_id);

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
        and tablename = 'notifications'
    ) then
        alter publication supabase_realtime add table notifications;
    end if;
end $$;

alter table notifications replica identity full;

-- ============================================================
-- TRIGGER: notify all users when a new incident is created
-- ============================================================
-- Recreate trigger: notify all users on new incident

create or replace function public.handle_new_incident()
returns trigger as $$
begin
insert into public.notifications (user_id, incident_id, message)
select
    p.id,
    new.id,
    initcap(new.type) || ' reported near campus'
from public.profiles p
where coalesce(
              case new.type
                  when 'protest' then p.notif_protest
                  when 'blockade' then p.notif_road
                  when 'construction' then p.notif_construction
                  when 'vandalism' then p.notif_vandalism
                  end,
              'normal'
      ) != 'muted';
return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_incident_created on incidents;
create trigger on_incident_created
    after insert on incidents
    for each row execute procedure public.handle_new_incident();

create or replace function public.handle_incident_update()
returns trigger as $$
declare
    follower uuid;
    msg text;
begin
    if new.followed_by is null or array_length(new.followed_by, 1) is null then
        return new;
    end if;

    -- Determine what changed and set message accordingly
    if old.status is distinct from new.status and new.status = 'resolved' then
        msg := initcap(new.type) || ' you are following has been resolved';
    elsif old.verification_status is distinct from new.verification_status 
        and new.verification_status = 'verified_by_campus' then
        msg := initcap(new.type) || ' you are following has been verified';
    elsif old.upvotes is distinct from new.upvotes 
        and new.upvotes >= 4 and old.upvotes < 4 then
        msg := initcap(new.type) || ' you are following has been reported by others';
    else
        return new; -- no relevant change, skip
    end if;

    foreach follower in array new.followed_by
    loop
        insert into public.notifications (user_id, incident_id, message)
        values (follower, new.id, msg);
    end loop;

    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_incident_updated on incidents;
create trigger on_incident_updated
    after update on incidents
    for each row
    execute procedure public.handle_incident_update();