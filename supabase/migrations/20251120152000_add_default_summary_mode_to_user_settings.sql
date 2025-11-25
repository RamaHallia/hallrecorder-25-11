alter table public.user_settings
  add column if not exists default_summary_mode text
  check (default_summary_mode in ('short', 'detailed'));

