# ShipStory

A place for makers to share what they ship. Post a project with screenshots, follow other makers, like and save the work you enjoy.

Live: https://shipstory-xi.vercel.app

## Stack

- Next.js (App Router) and React, Tailwind CSS
- Supabase for auth, Postgres and row level security
- Cloudflare R2 for media storage
- Cloudflare Turnstile for signup protection
- Vercel for hosting

## Local setup

1. Install dependencies: `npm install`
2. Copy your environment values into `.env.local` (names only, never commit values):
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (server only)
   - `NEXT_PUBLIC_MEDIA_BACKEND`
   - `R2_PUBLIC_BASE_URL`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAMES`
   - `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_COOKIE_KEY`, `GITHUB_APP_INSTALL_URL` (optional, GitHub import)
3. Apply the SQL files in `supabase/migrations` in order to your Supabase project.
4. Start the dev server: `npm run dev` and open http://localhost:3000

## Scripts

- `npm run dev` - development server
- `npm run build` - production build
- `npm run start` - run the production build
- `npm run lint` - lint
- `npm test` - run the standalone checks in `tests/`

## Source layout

- `src/app` - routes and pages
- `supabase/migrations` - database schema and policies
- `tests` - security, backend boundary, GitHub import privacy and admin checks

## License

MIT. See [LICENSE](LICENSE).
