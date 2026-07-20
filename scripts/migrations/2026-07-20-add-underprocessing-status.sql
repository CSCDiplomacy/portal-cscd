-- Widen the delegates.status check constraint to allow the new
-- 'underprocessing' value (submitted applicant awaiting results decision).
-- Apply in the Supabase SQL editor for project Delegate_app_cscd
-- (ref govbfxytrdxpmutxbkds), then run:
--   node scripts/set-underprocessing.js

alter table public.delegates
  drop constraint if exists delegates_status_check;

alter table public.delegates
  add constraint delegates_status_check
  check (status in ('unenrolled', 'underprocessing', 'enrolled'));
