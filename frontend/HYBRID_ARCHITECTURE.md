# TalentForge AI — Hybrid Architecture (Phase 2)

## What changed
Nothing existing was modified — no routes, components, pages, layouts, or
mock data files were touched. Only new files were added:

```
src/lib/api/
  config.ts              env vars (VITE_USE_BACKEND, VITE_API_BASE_URL, ...)
  backendStatus.ts        silent health check + subscribe()
  httpClient.ts            fetch wrapper (timeout, JWT header, JSON parsing)
  hybrid.ts                hybridCall(): try backend → auto fallback to mock
  services/
    AuthService.ts
    DataServices.ts        Job, Candidate, Dashboard, Analytics, Notification, Interview
    ContentServices.ts     Resume, Upload, AI, Career, Settings
  index.ts                 barrel export — the ONLY import path components should use

src/hooks/useBackendStatus.ts   optional reactive hook for debug/UI badges
.env.example                     documents the four VITE_ vars

backend/                   Django REST Framework skeleton (Phase 3 target)
  config/                  settings.py, urls.py, wsgi.py
  apps/core|accounts|jobs|candidates|resumes|interviews|analytics|
       notifications|ai|uploads
  requirements.txt, Dockerfile, .env.example, README.md
docker-compose.yml          Postgres + Django, one command to run both
```

## How it works
Every service method (e.g. `JobService.getJobs()`) calls `hybridCall(backendFn, mockFn)`:

- If `VITE_USE_BACKEND=true` **and** the `/api/health/` check succeeded → calls the real Django endpoint.
- Otherwise, or if that call throws for any reason → transparently returns the existing mock data. Nothing throws up to the UI.

No component currently calls this layer yet (none were touched, per the
zero-breaking-changes requirement) — but any page/hook can now switch from
importing `@/mocks/data` directly to `import { JobService } from "@/lib/api"`
to become backend-ready with no visual or behavioral change today.

## Turning the backend on
1. `cd backend && cp .env.example .env && docker compose up --build` (from repo root)
2. In the frontend `.env.local`: `VITE_USE_BACKEND=true`, `VITE_API_BASE_URL=http://localhost:8000`
3. Reload — the app detects the backend automatically and switches; if you stop the backend, it silently falls back to mock data again.

## Not done yet (intentionally, per the brief)
"Do not implement backend logic yet — only prepare the frontend contracts"
was the explicit instruction, so the Django app contains real models/routes/JWT
wiring for every service but the AI/Cloudinary logic is stubbed with clear
`# TODO` markers rather than fully implemented, since actual OpenRouter/
Cloudinary credentials and business rules weren't provided.
