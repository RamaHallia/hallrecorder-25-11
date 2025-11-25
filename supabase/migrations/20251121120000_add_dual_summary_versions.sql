alter table public.meetings
  add column if not exists summary_short text;

alter table public.meetings
  add column if not exists summary_detailed text;

update public.meetings
set
  summary_detailed = coalesce(summary_detailed, summary),
  summary_short = coalesce(summary_short, summary);
