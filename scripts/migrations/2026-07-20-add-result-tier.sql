-- Records the evaluation outcome tier from the video-submission evaluation
-- (YPDS Video submissions - Evaluation_mapped.xlsx, sheets Self/Partial/Full/Alumni).
--
--   full    → full scholarship, the selected cohort on the results banner
--   partial → partial scholarship, completes registration via Cognito form 78/79
--   self    → self-financed route, congratulated and pointed at registration
--   alumni  → prior-cohort alumni, handled separately
--   null    → not in the evaluation workbook / not reconciled
--
-- result_status stays as-is; this is orthogonal (a row is 'evaluated' AND a tier).
alter table public.delegates
  add column if not exists result_tier text;

alter table public.delegates
  drop constraint if exists delegates_result_tier_check;

alter table public.delegates
  add constraint delegates_result_tier_check
  check (result_tier is null or result_tier in ('self', 'partial', 'full', 'alumni'));
