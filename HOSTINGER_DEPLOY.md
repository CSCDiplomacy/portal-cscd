# Hostinger Deploy Runbook

Accurate, verified steps for deploying `portal.thecscd.org` — the only
deployment doc in this repo. An earlier assumption that Express serves
`client/dist` directly is wrong; see the actual host layout below.

## Host layout (verified via SSH)

```
/home/u441737725/domains/portal.thecscd.org/
├── public_html/              # LiteSpeed's static webroot — served DIRECTLY,
│   ├── index.html            # bypasses Node entirely for any path that
│   ├── assets/*.js, *.css    # matches a real file on disk.
│   ├── img/*
│   └── .builds/
│       ├── last-source/      # full repo checkout, rebuilt on every
│       │                     # GitHub-connected deploy (git log here = your
│       │                     # latest pushed commit)
│       └── config/
│           ├── preload-timestamp.js   # Hostinger's own Node preload (see below)
│           └── .env
└── nodejs/                   # Passenger's app root (PassengerAppRoot in
                               # public_html/.htaccess) — THIS is what actually
                               # runs the API. It is a SEPARATE checkout that
                               # the GitHub deploy does NOT touch automatically.
```

**The trap:** pushing to `main` and even clicking "Redeploy" in hPanel only
refreshes `public_html/.builds/last-source` and the static files in
`public_html/` (frontend). It does **not** sync `nodejs/`. Any backend change
(`app.js`, `routes/`, `lib/`, `data/`, `package.json`) needs a manual step
below or it silently keeps running old code — GET routes may still resolve
(404 only on routes that don't exist yet), making this easy to miss.

## Frontend changes (client/, public/)

Nothing to do — `public_html/` static files refresh automatically on deploy.
Verify by checking the asset hash in view-source matches your latest build.

## Backend changes (app.js, routes/, lib/, data/, package.json)

After the GitHub deploy has landed (confirm: `git -C public_html/.builds/last-source log --oneline -1`
matches your pushed commit), SSH in and sync only the backend surface —
**never rsync `client/`, `public/`, `.env`, `node_modules/`, `.git/`, or `tmp/`**:

```bash
SRC=/home/u441737725/domains/portal.thecscd.org/public_html/.builds/last-source
DST=/home/u441737725/domains/portal.thecscd.org/nodejs

# backup first
tar -czf ~/backups/nodejs-backend-$(date +%Y%m%d-%H%M%S).tar.gz \
  -C "$DST" app.js server.js package.json package-lock.json routes lib data

# dry run, then apply (drop -n)
rsync -avn \
  --include="/app.js" --include="/server.js" \
  --include="/package.json" --include="/package-lock.json" \
  --include="/routes/" --include="/routes/**" \
  --include="/lib/" --include="/lib/**" \
  --include="/data/" --include="/data/**" \
  --exclude="*" \
  "$SRC"/ "$DST"/
```

If `package.json` dependencies actually changed (not just scripts), reinstall
— plain `npm` isn't on PATH over SSH, use the alt-node toolchain:
`/opt/alt/alt-nodejs22/root/bin/node` (find its sibling `npm` under the same
`bin/`, or trigger a fresh install via hPanel's redeploy instead).

## Force the new code live — restarting the worker

`touch nodejs/tmp/restart.txt` (the classic Apache+Passenger convention) is
**unreliable on this LiteSpeed `lsnode` setup** — verified it does not
reliably trigger a respawn. What does work:

```bash
# find the current worker(s)
ps -eo pid,etime,lstart,args | grep "portal.thecscd.org.*[n]ode"

# terminate — LiteSpeed's process manager respawns a fresh one on the
# next request (same model as PHP-FPM workers recycling)
kill -TERM <pid> [<pid2>...]
```

This is a live production action — confirm with whoever's driving before
running it, same as any other prod-affecting step.

## Verify the deploy actually took

```bash
curl -s https://portal.thecscd.org/health
curl -s -o /dev/null -w "%{http_code}\n" https://portal.thecscd.org/api/config   # 200
# hit any newly-added route directly — 404 means the worker hasn't picked up
# the new code yet (didn't restart, or synced files didn't land)
```

Also check `nodejs/console.log` for a fresh `"CSCD Delegate App listening on
:3000"` line timestamped after your restart — its absence means `app.listen()`
never fired (see gotcha below).

## Critical gotcha: app.js MUST call `app.listen()` unconditionally

Do **not** guard it with `if (require.main === module)`. Hostinger's own
preload script (`public_html/.builds/config/preload-timestamp.js`, injected
via `NODE_OPTIONS` in `.htaccess`) explicitly checks for this and logs:

> "App did not call listen() within 3 seconds... Entry file uses
> `if (require.main === module)` to guard server.listen() — remove that
> condition, it is not supported on Hostinger Node.js hosting."

Their loader does not set `require.main === module` for the startup file the
way plain `node app.js` would, so that guard silently disables the listener.
`PassengerStartupFile` here is `app.js` (see `public_html/.htaccess`); `.js`
must call `.listen()` at the top level, unconditionally, every time.

## Secrets

No `.env` file lives on the host inside `nodejs/`. Env vars
(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AIDAFORM_BASE_URL`,
`RESEND_API_KEY`, etc.) are injected directly into `process.env` via hPanel's
own **Environment Variables** panel for the Node app — never write or expect
a `.env` file to exist there.

## Known open issue

The live CSP response header only shows `upgrade-insecure-requests`, even
though the origin `app.js` (confirmed via direct file inspection on the host)
has the full `helmet()` `contentSecurityPolicy` directives, including
`unsafe-eval` needed for the AidaForm embed widget. Suspected CDN
(`server: hcdn`) header rewrite at the edge — not yet root-caused. If the
AidaForm widget throws a CSP eval error in-browser, this is the first thing
to re-check.
