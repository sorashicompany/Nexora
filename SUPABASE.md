# Nexora + Supabase

Supabase project URL:

`https://xvmcsqpfcabhblaweaix.supabase.co`

The Android client uses the **publishable** key only. Never put `sb_secret_*`, `service_role`, a database password, or a JWT signing secret in the APK or GitHub.

## Database

The Nexora schema is already applied to the remote project. It contains profiles, social links, tracks, beats, followers, likes, comments, and notifications with RLS enabled.

## Storage buckets

The following public media buckets are configured:

- `avatars` — profile images, 5 MiB limit
- `covers` — artwork, 10 MiB limit
- `audio` — tracks/beats, 50 MiB limit

Authenticated uploads/updates/deletes are restricted to the object's owner. Public reads are allowed for published media buckets.

## Local migration workflow

Install the Supabase CLI, authenticate, link the project, and pull the current remote schema before creating additional migrations:

```bash
supabase login
supabase link --project-ref xvmcsqpfcabhblaweaix
supabase db pull
```

After that, commit migration files under `supabase/migrations/` and deploy with:

```bash
supabase db push
```

## Android

The Android project contains `SupabaseClient.java`, which provides a small Java REST/Auth layer. It persists the access token locally and sends the publishable key plus the user's bearer token to Supabase.

For production, add refresh-token rotation and encrypted session storage before relying on long-lived sessions.

## Cloudflare Worker

The Worker lives in `server/cloudflare/` and uses a **service-role/secret key only on the server**. Set it as a Wrangler secret:

```bash
cd server/cloudflare
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler deploy
```

Never commit that value.
