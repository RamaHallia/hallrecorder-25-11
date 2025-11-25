alter table public.meetings
  add column if not exists summary_mode text not null default 'detailed' check (summary_mode in ('short','detailed'));

alter table public.meetings
  add column if not exists summary_regenerated boolean not null default false;

update public.meetings
set summary_mode = 'detailed'
where summary_mode is null;

