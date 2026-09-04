# SEBA Auth — security-hardened, redesigned

This replaces the auth pages you uploaded (Login, Register, Forgot/Reset
Password, Verify Email) with:

1. A visual redesign that matches your logo exactly (same red/pink/black,
   same geometric shape language), instead of the old glass-card look.
2. The security fixes and features you said "yes" to, out of the 60-item
   list — mapped one-by-one below.
3. Amharic translations wired through **one** shared language system, on
   every auth page including Reset Password (which previously had its
   own separate, English-only-by-default language state).
4. A responsive layout with fixed, consistent padding on mobile instead
   of shapes/spacing that could collide with the form.

**Read this whole file before deploying** — several features (rate
limiting, the CAPTCHA, passkeys, session management) only work once you
run the SQL migration and deploy the edge functions. Nothing will
silently "half-work" — until you deploy the backend, the CAPTCHA and
submit buttons will show a network error, which is the correct, safe
failure mode (fails closed, not open).

---

## 1. What's actually new, top to bottom

### Design
- `src/features/auth/design/tokens.ts` — colors sampled directly from
  your logo file (`#CC1E00` red, `#FF9999` pink, `#000000` wordmark).
  Nothing invented.
- `src/features/auth/components/GeometricPanel.tsx` — rebuilds the
  logo's grid of circles/quarter-circles/half-circles/diagonal cuts as
  live layout, with the bold "SEBA" wordmark on top. This is what fills
  the left half of the screen on desktop, and a fixed-height band at the
  top on mobile.
- `src/features/auth/components/AuthShell.tsx` — replaces `AuthCard`.
  Desktop: 50/50 split, geometric panel left, form right, **no tagline
  copy** (the panel is the brand statement now). Mobile: single column,
  fixed padding at every breakpoint (`px-5` to `sm:px-8` to `lg:px-16`),
  so shapes and form content never collide regardless of screen height.

### Security — mapped to your yes/no list

- **1, 2, 7** — No more account-type/enumeration leaks. Every failure
  path in `auth.service.ts` throws one generic `AUTH_GENERIC_ERROR`;
  the staff-vs-owner tab no longer reveals which one an email belongs to.
- **3, 4** — Rate limiting + IP lockout after repeated failures.
  `supabase/functions/login-guard` + the `blocked_ips` table.
- **5** — Custom CAPTCHA, not a 3rd-party API, bilingual, shape-based.
  `SebaCaptcha.tsx` + `supabase/functions/captcha`. Has one real
  limitation — see "Custom CAPTCHA" in §4.
- **6** — Resend-verification-email rate limit, IP-based, separate
  limiter from login. `supabase/functions/resend-guard`.
- **8** — New-device login notice: **not built**. Sending email needs an
  SMTP/email provider outside what I have access to. `login_attempts`
  already logs every login with IP + user agent, so "new IP for this
  user -> send email" is one Auth Hook away once you wire up email.
- **9–14** — Password policy: strength meter, confirm field, min
  length, breach check (HIBP k-anonymity, public API, no key), reuse
  prevention, max length. `PasswordStrengthMeter.tsx`, `Register.tsx`,
  `ResetPassword.tsx`, `supabase/functions/password-history`.
- **15** — Session/device management. `Sessions.tsx` +
  `list_user_sessions`/`revoke_user_session` SQL functions.
- **16** — Reset password revokes other sessions; policy page added.
  `ResetPassword.tsx` calls `revoke-other-sessions`; `Terms.tsx` /
  `Privacy.tsx` added.
- **17** — Policy page added. Idle/absolute session **timeout itself
  isn't implemented** client-side — Supabase sessions are JWT-based with
  refresh/expiry configured in the dashboard (Authentication ->
  Sessions), not something the client enforces. Set your desired window
  there.
- **18** — Session storage confirmed: Supabase JS defaults to
  `persistSession: true` in `localStorage`; `src/lib/supabase.ts` keeps
  that and documents it. Moving to httpOnly-cookie storage needs a
  server-rendered/proxy auth setup — bigger change, flag it if you want
  it.
- **19** — Open-redirect protection: `emailRedirectTo` is always built
  from `window.location.origin`, never from user input.
- **20** — Single-use reset links: Supabase's recovery flow already
  invalidates a link after one use; `ResetPassword.tsx`'s `validSession`
  check reflects that.
- **22** — Passkey option now available at login too, not just
  post-reset. `Login.tsx` "Sign in with a passkey" button, real WebAuthn
  via `passkey-options` / `passkey-verify`.
- **23** — 2FA-lost recovery path: **left undecided**, per your "idk".
  Nothing built. Supabase MFA supports backup codes — say the word and
  I'll wire it into `SecuritySettings.tsx`.
- **25–29** — Input sanitization, server-side-safe email normalization,
  homoglyph domain warning, `account_type` never trusted client-side.
  `src/lib/security.ts`, `auth.service.ts`.
- **30, 32** — Staff audit log + forced password reset on reactivation.
  `staff_audit_log` table + trigger in the migration.
- **33, 34** — Login history page + basic anomaly surface (failed vs.
  succeeded, IP shown). `Sessions.tsx`.
- **35** — CSRF: Supabase's bearer-token model (not cookies) has no
  ambient credential a third-party site can ride on, so classic CSRF
  doesn't apply the way it does to cookie-session apps. Documented here
  as a decision, not an omission.
- **36** — CSP / security headers. `vercel.json` and `public/_headers` —
  use whichever matches your host, delete the other.
- **37** — Honeypot field on Register (and added to Login too).
  `HoneypotField.tsx`.
- **38** — Credential-stuffing detection: many different emails failing
  from one IP gets the IP blocked. `login-guard`'s
  `MAX_DISTINCT_EMAIL_FAILURES_PER_IP`.
- **39** — Terms consent checkbox + policy pages. `Register.tsx`
  checkbox, `Terms.tsx`, `Privacy.tsx`.
- **40** — Forced re-auth for sensitive changes: the reset-password flow
  already requires the recovery-link session. The same pattern
  (`reauthRequiredTitle`/`Body` strings are already in the translation
  file) is ready to reuse on a future "change email" page.
- **41** — Google / Apple sign-in. `loginWithOAuth()`, buttons in
  `Login.tsx`. Requires provider setup in the Supabase dashboard — §5.
- **42** — Magic link login. `sendMagicLink()`, toggle in `Login.tsx`.
- **43** — Passkey sign-in. Full WebAuthn round trip — `passkey-options`,
  `passkey-verify`, `passkeys` table.
- **57** — Welcome email: **not built**, same reason as #8 (needs an
  email provider). The natural place is Supabase's "Confirm signup"
  email template — a dashboard edit, not code.
- **60** — Animated success states on every auth page. `seba-pop` /
  `seba-shake` / `seba-spin` in `styles/auth.css`.

Items 21, 24, 44–49, 51, 53–56, 58, 59 were "no" and intentionally left
out. Item 52 (what happens after login) was existing behavior you
described, not something new to build — `ProtectedRoute.tsx` (kept from
your original zip, unchanged) is what routes to onboarding vs.
dashboard.

### A real bug I found and fixed while doing this

Your original `ResetPassword.tsx` "prevented password reuse" by storing
`btoa(password).slice(0, 24)` — base64, **not a hash** — inside
`user_metadata`, which is readable by the user's own client session.
That means the last 3 passwords were effectively stored in
lightly-obscured plaintext on the user object. `password-history` (edge
function) replaces this with a per-password random salt + SHA-256 hash
in a private table no client role can read.

Same page's passkey enrollment called `navigator.credentials.create()`
with a throwaway random challenge that was never sent to or checked by
any server, then said "Passkey saved successfully!" regardless — it
never actually enabled passkey login for anything. That's now a real,
server-verified WebAuthn registration.

---

## 2. Project structure

```
src/
  lib/
    supabase.ts          - client init (keep your existing one if you have it)
    translations.ts       - EN/AM dictionary, single source for every auth page
    security.ts            - sanitizePlainText, normalizeEmail, homoglyph check
  features/
    auth/
      design/tokens.ts     - colors sampled from the logo
      context/              - AuthContext, Languagecontext (now with tList for arrays)
      components/           - AuthShell, GeometricPanel, SebaCaptcha, PasswordStrengthMeter,
                              HoneypotField, LanguageToggle, ProtectedRoute*, OnboardingRoute*
      pages/                 - Login, Register, ForgotPassword, ResetPassword, VerifyEmail,
                              Terms, Privacy, Sessions, SecuritySettings
      services/auth.service.ts
      styles/auth.css
    onboarding/services/onboarding.service.ts   - STUB, see below
supabase/
  functions/
    _shared/helpers.ts
    login-guard/            - rate limiting, lockouts, session list/revoke
    resend-guard/           - separate limiter for the resend-verification button
    captcha/                - issues + verifies the shape-matching challenge
    password-history/       - reuse check + salted-hash storage
    passkey-options/        - WebAuthn registration/authentication options
    passkey-verify/         - WebAuthn verification + session issuance
  migrations/20260829_security_hardening.sql
vercel.json / public/_headers   - CSP + security headers (use whichever matches your host)
.env.example
```

`*` = carried over from your zip unchanged (`ProtectedRoute.tsx`,
`OnboardingRoute.tsx`) — they weren't part of the security/design brief.

**`src/features/onboarding/services/onboarding.service.ts` is a stub.**
Your zip's `ProtectedRoute`/`OnboardingRoute` import it but the real file
wasn't in what you uploaded, so I couldn't include it. Delete the stub
and drop your real one back in — nothing else needs to change.

---

## 3. Setup

```bash
npm install
cp .env.example .env        # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
```

Merge `src/App.example.tsx` and `src/features/auth/routes.example.tsx`
into your real app shell/router — they're examples, not meant to
overwrite whatever root files you already have.

---

## 4. Deploying the backend (required for login/register/captcha to work)

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 1. Run the migration
supabase db push

# 2. Set secrets used by the edge functions
supabase secrets set ALLOWED_ORIGIN=https://your-real-domain.com
supabase secrets set WEBAUTHN_RP_ID=your-real-domain.com
supabase secrets set WEBAUTHN_ORIGIN=https://your-real-domain.com

# 3. Deploy every function
supabase functions deploy login-guard
supabase functions deploy resend-guard
supabase functions deploy captcha
supabase functions deploy password-history
supabase functions deploy passkey-options
supabase functions deploy passkey-verify
```

**Custom CAPTCHA — one real limitation, stated plainly:** the shape
tiles are sent to the browser as structured data (`{ id, shape }`) so
the UI can render and translate them without a language-specific image
pipeline. A bot calling the API directly (not through a real browser)
could compute the matching tiles the same way a human eye does. This
stops scripted form-spam and keeps the challenge genuinely easy and
bilingual, which is what you asked for, but it is **not** equivalent to
an image-rendered CAPTCHA against a determined attacker. The rate
limiting and IP lockout in `login-guard` / `resend-guard` are the real
backstop and work independently of whether the CAPTCHA itself is beaten
— that's why both layers exist rather than relying on the CAPTCHA alone.
If you later want the stronger version, the fix is rendering the tiles
as server-side images instead of sending shape names as data — say the
word and I'll build that pass.

**Passkeys — please test end-to-end before launch.** WebAuthn is exact
about origin and RP ID matching. `WEBAUTHN_RP_ID` / `WEBAUTHN_ORIGIN`
must be your real deployed domain, not `localhost`, once you're off your
own machine. I've implemented the full standard flow (registration +
authentication + credential storage + counter tracking against replay),
but WebAuthn has no equivalent of "looks right in review" — it either
verifies or it doesn't on a given browser/domain, so run it against your
actual domain before relying on it.

**Session listing (`Sessions.tsx`)** reads `auth.sessions` via two
`SECURITY DEFINER` SQL functions, since that table isn't exposed through
the normal REST API. Supabase's internal session-table shape has changed
across versions before — if `list_user_sessions` errors after you
deploy, check your project's current `auth.sessions` columns and adjust
the function in the migration to match.

---

## 5. Social login (item #41)

Google and Apple sign-in call `supabase.auth.signInWithOAuth()`, which
needs each provider configured in **Supabase dashboard -> Authentication
-> Providers** — this is dashboard configuration, not code:

- **Google:** create an OAuth client in Google Cloud Console, add
  `https://YOUR-PROJECT.supabase.co/auth/v1/callback` as an authorized
  redirect URI, paste the client ID/secret into the Supabase dashboard.
- **Apple:** requires an Apple Developer account, a Services ID, and a
  private key generated in the Apple Developer portal — more setup than
  Google. Apple's own docs walk through this; the Supabase-side steps
  are the same shape as Google's.

---

## 6. What to test before launch

- [ ] Register, then confirm rate limiting kicks in after repeated attempts
- [ ] Log in with the wrong password 5 times, confirm the lockout message and timer
- [ ] Try the CAPTCHA in both EN and AM — the instruction text should
      switch; the shapes/interaction don't need translation
- [ ] Register with a known-breached password (e.g. `password123`),
      confirm it's rejected
- [ ] Reset your password, confirm you're signed out of a second
      browser/device
- [ ] Reactivate a deactivated staff account, confirm they're forced to
      reset their password on next login
- [ ] Resize to a phone width on every page (Login, Register, Forgot,
      Reset, Verify), confirm padding stays consistent and nothing
      overlaps the geometric band at the top
- [ ] Passkey registration + login on your real deployed domain
- [ ] Google/Apple buttons once providers are configured

---

## 7. Design notes

The palette is exactly the logo's three flat colors — no gradients, no
tints added. The "SEBA" wordmark on the geometric panel is the same
visual object as your uploaded logo, rebuilt as CSS shapes instead of a
static PNG so it can sit behind a real, responsive layout instead of
being a fixed image. The old marketing tagline ("Discover trusted
businesses...") is gone per your request — the geometric panel now
carries the brand on its own, the way the logo does.

Amharic (Ge'ez script) reads left-to-right just like Latin script, so no
RTL layout changes were needed — only the translation dictionary, and
routing every page through `useLanguage()` instead of local state.
