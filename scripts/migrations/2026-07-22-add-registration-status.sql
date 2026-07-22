-- Records when a partial/self-financed delegate submits their Cognito
-- registration form. Cognito posts to POST /api/registration/webhook/:secret,
-- which matches the submission to a delegate by the applicant_id prefilled into
-- a hidden form field and flips registration_status → 'submitted'.
--
-- The delegate's `status` is intentionally NOT changed — enrolment / payment
-- verification stays a manual team step. This flag only swaps the dashboard
-- Cognito embed for a "Registration received" confirmation card.
--
--   not_started → form not yet submitted (shows the embed)
--   submitted   → webhook received (shows the confirmation card)
alter table public.delegates
  add column if not exists registration_status text not null default 'not_started',
  add column if not exists registration_submitted_at timestamptz;

alter table public.delegates
  drop constraint if exists delegates_registration_status_check;
alter table public.delegates
  add constraint delegates_registration_status_check
  check (registration_status in ('not_started', 'submitted'));

-- Widen the usage_events audit whitelist so the webhook's audit row is stored.
-- (Also adds 'scholarship_accepted', which the accept-scholarship route already
-- tries to write but which the old constraint silently rejected.)
alter table public.usage_events
  drop constraint if exists usage_events_event_type_check;
alter table public.usage_events
  add constraint usage_events_event_type_check
  check (event_type = any (array[
    'login', 'pdf_download', 'screen_view',
    'interview_open', 'interview_submitted',
    'scholarship_accepted', 'registration_submitted'
  ]));
