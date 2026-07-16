#!/usr/bin/env python3
"""send_credentials.py — email each delegate their login credentials via Resend.

Run LATER, once the participant emails are final and seed-delegates.js has
produced the credentials CSV.

Usage:
    RESEND_API_KEY=... APP_URL=https://delegateapp.thecscd.org \
    FROM_EMAIL=noreply@programs.thecscd.org \
    python3 scripts/send_credentials.py delegate-credentials.csv

The CSV is the output of seed-delegates.js with header: email,password,name
Requires: requests  (pip install requests)  — uses the Resend HTTP API directly,
no extra SDK needed.
"""
import csv
import os
import sys
import time
from pathlib import Path

import requests

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "noreply@programs.thecscd.org")
APP_URL = os.environ.get("APP_URL", "https://portal.thecscd.org/")
EVENT_NAME = os.environ.get("EVENT_NAME", "YPDS Jakarta 2026")
PORTAL_URL = os.environ.get("PORTAL_URL", "https://portal.thecscd.org/")
INTERVIEW_DEADLINE = os.environ.get("INTERVIEW_DEADLINE", "17 July 2026, 11:00 PM (GMT+7, Jakarta time)")

RESEND_ENDPOINT = "https://api.resend.com/emails"
TEMPLATE_PATH = Path(__file__).with_name("credential-email.html")


def render_template(name: str, email: str, password: str) -> str:
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    replacements = {
        "{{name}}": name or "Delegate",
        "{{email}}": email,
        "{{password}}": password,
        "{{portal_url}}": PORTAL_URL,
    }
    for placeholder, value in replacements.items():
        template = template.replace(placeholder, value)
    return template


def build_html(name: str, email: str, password: str) -> str:
    return render_template(name, email, password)


def build_text(name: str, email: str, password: str) -> str:
    greeting = name or "Delegate"
    return (
        f"Welcome to {EVENT_NAME} — Your Portal Is Ready\n\n"
        f"Dear {greeting},\n\n"
        "Congratulations, and welcome to the Young Public Diplomacy Summit — Jakarta 2026.\n\n"
        "By applying to YPDS, you have already joined an exceptional community of scholars, young diplomats, and leaders from across the world. We are delighted to have you with us and wish you the very best as we begin reviewing applications.\n\n"
        "Your portal is now active. From here you can complete your interview, explore the summit program, and prepare for the days ahead.\n\n"
        "Login Details\n"
        f"Portal: {PORTAL_URL}\n"
        f"Email: {email}\n"
        f"Password: {password}\n\n"
        "[ ] Mark interview taken\n\n"
        "Your Interview\n"
        "The video and text interview form is ready under the Interview tab, and it is the next step in the review for scholarship consideration. This is your opportunity to share your vision for public diplomacy and strategic leadership.\n\n"
        "Please respond to the following question:\n"
        "\u201cWhy did you choose to join the Young Public Diplomacy Summit \u2014 Jakarta 2026? What does public diplomacy mean to you, and what are you hoping to learn from this experience in order to better understand and address today\u2019s global challenges?\u201d\n\n"
        "Maximum length: 2 minutes\n"
        "Total time to complete the form: approximately 5 minutes\n"
        f"Deadline: {INTERVIEW_DEADLINE}\n\n"
        "Missing this deadline will affect your eligibility for scholarship evaluation. You will, however, still be considered for the self-financed option.\n\n"
        "What Else You Can Do\n"
        "Explore the summit program — Browse the full four-day agenda: opening keynotes from diplomatic leaders, workshops on public diplomacy and peace-building, youth policy labs, and closing presentations.\n\n"
        "Discover venues and speakers — Learn about Tugu Kunstkring Paleis, our historic Jakarta venue, and meet the diplomatic experts leading the summit.\n\n"
        "Save sessions — Star any session to keep it handy for easy reference.\n\n"
        "Next Steps\n"
        f"1. Visit {PORTAL_URL}\n"
        "2. Sign in with your email and password\n"
        "3. Complete your interview before the deadline\n"
        "4. Explore the summit program\n\n"
        "If you have any questions, simply reply to this email. We look forward to your participation at YPDS Jakarta 2026.\n\n"
        "Warm regards,\nThe CSCD Team\nCenter for Strategic and Cultural Diplomacy"
    )


def send(to_email: str, name: str, password: str) -> bool:
    # A plain-text part is included alongside the HTML: HTML-only messages render
    # blank in clients that strip or block HTML, which is the "completely blank
    # email" symptom we hit before.
    payload = {
        "from": f"CSCD <{FROM_EMAIL}>",
        "to": [to_email],
        "subject": f"Welcome to {EVENT_NAME} — Your Portal Is Ready",
        "html": build_html(name, to_email, password),
        "text": build_text(name, to_email, password),
    }
    resp = requests.post(
        RESEND_ENDPOINT,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    if resp.status_code >= 300:
        print(f"  ✗ {to_email}: {resp.status_code} {resp.text}")
        return False
    print(f"  ✓ {to_email}")
    return True


def main() -> None:
    if not RESEND_API_KEY:
        sys.exit("RESEND_API_KEY not set in environment.")
    if len(sys.argv) < 2:
        sys.exit("Usage: python3 scripts/send_credentials.py <credentials.csv>")

    path = sys.argv[1]
    sent = failed = 0
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            email = (row.get("email") or "").strip()
            if not email:
                continue
            ok = send(email, (row.get("name") or "").strip(), (row.get("password") or "").strip())
            sent += ok
            failed += (not ok)
            time.sleep(0.6)  # gentle on the API rate limit

    print(f"\nDone. Sent {sent}, failed {failed}.")


if __name__ == "__main__":
    main()
