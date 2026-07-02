# TalentForge AI — Backend (Django)

Django REST Framework backend that mirrors the frontend's Hybrid Data Layer
service contracts (`src/lib/api/services/*`). The frontend works fully
without this backend; when it's reachable, the frontend automatically
switches to it.

## Run locally

```bash
cp .env.example .env
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Run with Docker

```bash
docker compose up --build
```

Health check: `GET /api/health/` → `{"status": "ok"}`

## Notes
- JWT auth via SimpleJWT (`/api/auth/login/`, `/api/auth/refresh/`).
- Cloudinary upload is stubbed in `apps/uploads/views.py` — set
  `CLOUDINARY_URL` and install the `cloudinary` SDK call to activate it.
- OpenRouter proxy is stubbed in `apps/ai/views.py` — set `OPENROUTER_KEY`.
- Every endpoint here matches one method on a frontend service in
  `src/lib/api/services/`, so no frontend contract changes are needed as
  real logic is filled in.
