-- Add delegates.result_status — whether an applicant's interview was actually
-- given and evaluated. Kept separate from `status` (enrolment) and
-- `interview_status` (form submission) so the gating logic keeps its meaning
-- and a later selected/waitlisted verdict can bolt on beside it.
--
-- Apply in the Supabase SQL editor for project Delegate_app_cscd
-- (ref govbfxytrdxpmutxbkds), then run:
--   node scripts/reconcile-interviews.js --dry-run
--   node scripts/reconcile-interviews.js

alter table public.delegates
  add column if not exists result_status text not null default 'pending';

alter table public.delegates
  drop constraint if exists delegates_result_status_check;

alter table public.delegates
  add constraint delegates_result_status_check
  check (result_status in ('pending', 'evaluated', 'not_evaluated'));
