#!/usr/bin/env python3
"""
check_missing_interviews.py — cross-checks delegates marked interview_status
'submitted' in Supabase against the AidaForm response CSV exports in
reponses/, to find submissions that may not have actually landed in AidaForm
(e.g. the webhook fired but the video/response never made it, or vice versa).

Matches on BOTH normalized email and normalized applicant_id (a delegate is
only flagged as "missing" if neither matches any CSV row) to avoid false
positives from typos in one field. Also strips zero-width/invisible unicode
characters that showed up in a few AidaForm name fields, since those can
silently break exact-string matching.

Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in the environment (.env).
Usage: python3 scripts/check_missing_interviews.py [--out report.json]
"""
import argparse
import csv
import glob
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESPONSES_DIR = ROOT / "reponses"

ZERO_WIDTH_RE = re.compile(r"[​‌‍﻿⁠]")


def load_env():
    """Minimal .env parser (avoids requiring python-dotenv)."""
    env = dict(os.environ)
    env_path = ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            env.setdefault(key.strip(), value.strip())
    return env


def normalize(s):
    if not s:
        return ""
    s = ZERO_WIDTH_RE.sub("", s)
    return s.strip().lower()


def fetch_submitted_delegates(supabase_url, service_key):
    url = f"{supabase_url}/rest/v1/delegates?interview_status=eq.submitted&select=*"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def load_aidaform_responses():
    rows = []
    for path in sorted(glob.glob(str(RESPONSES_DIR / "*.csv"))):
        with open(path, newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                rows.append(row)
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", help="Write full JSON report to this path (in addition to stdout summary)")
    args = parser.parse_args()

    env = load_env()
    supabase_url = env.get("SUPABASE_URL")
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env", file=sys.stderr)
        sys.exit(1)

    if not RESPONSES_DIR.exists():
        print(f"No {RESPONSES_DIR} directory found — export AidaForm responses there first.", file=sys.stderr)
        sys.exit(1)

    delegates = fetch_submitted_delegates(supabase_url, service_key)
    responses = load_aidaform_responses()

    email_col = "2. Your Email"
    applicant_col = "3. Applicant ID:"
    created_col = "Created"

    aida_emails = {normalize(r.get(email_col)) for r in responses if r.get(email_col)}
    aida_applicant_ids = {normalize(r.get(applicant_col)) for r in responses if r.get(applicant_col)}
    created_times = sorted(r.get(created_col, "") for r in responses if r.get(created_col))

    missing = []
    for d in delegates:
        email = normalize(d.get("email"))
        applicant_id = normalize(d.get("applicant_id"))
        email_hit = email in aida_emails
        applicant_hit = applicant_id and applicant_id in aida_applicant_ids
        if not email_hit and not applicant_hit:
            missing.append(d)

    print(f"Supabase delegates marked 'submitted': {len(delegates)}")
    print(f"AidaForm CSV rows read: {len(responses)} (from {len(glob.glob(str(RESPONSES_DIR / '*.csv')))} files)")
    print(f"Unique emails in CSVs: {len(aida_emails)}")
    print(f"Unique applicant IDs in CSVs: {len(aida_applicant_ids)}")
    if created_times:
        print(f"CSV date range: {created_times[0]} .. {created_times[-1]}")
    print()
    print(f"Marked submitted in Supabase, no match by email OR applicant_id in any CSV (n={len(missing)}):")
    for d in sorted(missing, key=lambda x: x.get("interview_submitted_at") or ""):
        print(
            f"- {d.get('email',''):35s} {d.get('name',''):30s} "
            f"{d.get('applicant_id',''):15s} submitted_at={d.get('interview_submitted_at')}"
        )

    if args.out:
        with open(args.out, "w") as fh:
            json.dump(
                {
                    "supabase_submitted_count": len(delegates),
                    "csv_row_count": len(responses),
                    "csv_date_range": [created_times[0], created_times[-1]] if created_times else None,
                    "missing": missing,
                },
                fh,
                indent=2,
            )
        print(f"\nFull report written to {args.out}")


if __name__ == "__main__":
    main()
