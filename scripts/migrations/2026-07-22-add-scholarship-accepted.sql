-- Records when a full-scholarship delegate accepts their award from inside the
-- portal (the "Accept scholarship" button on the dashboard). Only `result_tier
-- = 'full'` delegates ever see the button; the server enforces that too.
--
-- The column is the authoritative, persistent accept-state (drives idempotency
-- and flips the button to its "accepted" state on return). An audit row is also
-- written to usage_events (event_type = 'scholarship_accepted') for the log.
--
--   null       → not yet accepted
--   timestamptz→ moment of acceptance
alter table public.delegates
  add column if not exists scholarship_accepted_at timestamptz;
