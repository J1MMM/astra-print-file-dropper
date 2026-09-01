# PrintDrop

PrintDrop is a Next.js 16 + Supabase print-submission desk. Customers upload without an account; an authenticated admin can review the queue, download originals, update statuses, arrange submitted images, and print contact sheets.

## Set up Supabase

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor.
3. Create an admin email/password user under **Authentication → Users**.
4. Copy `.env.example` to `.env.local` and fill in every key.
5. Set `ADMIN_EMAILS` to a comma-separated allowlist. If blank, any authenticated Supabase user is accepted.
6. Set `NEXT_PUBLIC_STORAGE_QUOTA_BYTES` to the quota shown in the dashboard (default: 1 GB).
7. Set `NEXT_PUBLIC_SITE_URL` to the deployed public URL so shared links use the correct Open Graph address.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in the browser or commit `.env.local`.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for uploads and `/login` for administration.

The storage metric is calculated from `submission_files`, so it reflects files uploaded through PrintDrop's dedicated private bucket. The quota is an environment setting because Supabase plan limits are not exposed by the standard client API.
