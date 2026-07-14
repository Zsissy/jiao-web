# Supabase Setup

Run `schema.sql` in the Supabase SQL Editor before deploying the dynamic site.

Then add these environment variables in Vercel:

- `ADMIN_PASSWORD`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET=site-media`

The first successful site load seeds starter content automatically.
