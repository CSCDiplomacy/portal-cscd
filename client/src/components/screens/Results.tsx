// Results. These render inline on the dashboard — there is no separate Results
// screen.
//
// `result_tier` (from the evaluation workbook, via scripts/reconcile-tiers.js)
// is the ONLY thing that decides what a delegate sees. Whether they interviewed
// is irrelevant here — the tier sheets are the authority, and many tiered
// applicants never interviewed.
//
//   full    → scholarship covers the fee; no form, team confirms directly
//   partial → pays 50%; registers + pays through Cognito form 79
//   self    → pays in full; registers + pays through Cognito form 78
//   alumni  → parked, handled by the team (final treatment still TBD)
//
// No tier → nothing renders at all (see Dashboard).
import { CognitoForm, COGNITO_FORM_IDS } from '../CognitoForm';
import type { ResultTier } from '../../types';

// The announcement artwork naming the full-scholarship cohort. The caption
// matters: without it the banner reads as "the delegates", which would tell the
// 149 partial/self delegates they hadn't been selected at all.
export const SelectedBanner = () => (
  <div className="results-banner">
    <div className="results-banner-caption">
      <p className="tag">Full scholarship recipients</p>
      <p className="t-desc">
        Congratulations to the delegates below, who have been awarded full scholarships to YPDS
        Jakarta 2026 following the interview panel's evaluation.
      </p>
    </div>
    <img
      src="/img/results-selected-delegates.png"
      alt="YPDS Jakarta 2026 full scholarship recipients"
      loading="lazy"
    />
  </div>
);

export const TierResult = ({ tier }: { tier: ResultTier }) => {
  // A full scholarship covers the fee, so there is nothing to pay and no
  // registration form — the team confirms these places directly.
  if (tier === 'full') {
    return (
      <div className="t-card is-award">
        <p className="tag">Full scholarship</p>
        <div className="t-title">Congratulations — we'll see you in Jakarta</div>
        <p className="t-desc">
          Ten full scholarships were awarded across the whole applicant pool, and one of them is
          yours. The panel came away genuinely impressed — by the clarity of your thinking and the
          seriousness you brought to the interview. Your place at YPDS Jakarta 2026 is secured in
          full, with nothing further to pay. Our team will be in touch shortly with your travel and
          arrival details.
        </p>
      </div>
    );
  }

  if (tier === 'partial' || tier === 'self') {
    const partial = tier === 'partial';
    return (
      <div className="stack">
        <div className="t-card is-award">
          <p className="tag">{partial ? 'Partial scholarship' : 'Self-financed place'}</p>
          <div className="t-title">
            {partial
              ? 'Congratulations — you have been awarded a partial scholarship'
              : 'Congratulations — your application was successful'}
          </div>
          <p className="t-desc">
            {partial
              ? 'Your application impressed the panel and you have been awarded a 50% scholarship to YPDS Jakarta 2026. Complete the registration form below to confirm your place.'
              : 'You have been accepted to YPDS Jakarta 2026 on a self-financed basis. We were glad to meet you at interview and would be delighted to welcome you to Jakarta. Complete the registration form below to confirm your place.'}
          </p>
        </div>
        <CognitoForm
          formId={COGNITO_FORM_IDS[tier]}
          title={partial ? 'Partial scholarship registration' : 'Self-financed registration'}
        />
      </div>
    );
  }

  // alumni — handled directly by the team, no form in the portal.
  return (
    <div className="t-card">
      <p className="tag">Alumni</p>
      <div className="t-title">Welcome back</div>
      <p className="t-desc">
        You're registered with us as a CSCD alumnus. Our team will contact you directly about your
        participation in YPDS Jakarta 2026.
      </p>
    </div>
  );
};
