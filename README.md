<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme-assets/logo.png" />
  <source media="(prefers-color-scheme: light)" srcset="docs/readme-assets/logo.png" />
  <img src="docs/readme-assets/logo.png" alt="Samen Bondarenko Gallery" width="420" />
</picture>

<br/>

A commercial art commerce platform powering **[samen-bondarenko.com](https://samen-bondarenko.com)** — a live gallery and print shop processing real orders, payments, and worldwide print-on-demand fulfillment.

Fully designed and built by me: backend architecture, system design, admin tooling, CI/CD pipeline, and frontend design direction.

<br/>

[![CI](https://github.com/SamenB/SBGallery/actions/workflows/ci.yml/badge.svg)](https://github.com/SamenB/SBGallery/actions/workflows/ci.yml)
[![CD](https://github.com/SamenB/SBGallery/actions/workflows/cd.yml/badge.svg)](https://github.com/SamenB/SBGallery/actions/workflows/cd.yml)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.124-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis 7](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

</div>

---

## Tech Stack

<table>
<tr><td><strong>Backend</strong></td><td>Python 3.12 · FastAPI · Pydantic v2 · SQLAlchemy 2 (async) · asyncpg · Alembic · Celery · Uvicorn</td></tr>
<tr><td><strong>Data</strong></td><td>PostgreSQL 15 · Redis 7 (cache, tokens, broker, geo) · fastapi-cache2</td></tr>
<tr><td><strong>Security</strong></td><td>JWT access + refresh · Argon2 (pwdlib) · ECDSA webhook verification · Redis token whitelist/blacklist · Rate limiting</td></tr>
<tr><td><strong>Integrations</strong></td><td>Prodigi Print API · Monobank Acquiring · Google OAuth · S3 storage (boto3) · SMTP · Telegram Bot · IP Geo API</td></tr>
<tr><td><strong>Frontend</strong></td><td>Next.js 16 (App Router) · React 19 · TypeScript 5 strict · Tailwind CSS 4 · PostHog analytics</td></tr>
<tr><td><strong>Infrastructure</strong></td><td>Docker Compose (12 services) · Nginx (TLS, HTTP/2, gzip, HSTS) · Let's Encrypt · GitHub Actions CI/CD</td></tr>
<tr><td><strong>Monitoring</strong></td><td>Prometheus · Grafana · Node Exporter · Dozzle (live logs) · Loguru (structured JSON, rotating files)</td></tr>
<tr><td><strong>Quality</strong></td><td>pytest (51 test files) · Ruff · ESLint · TypeScript strict · CI build/test gates</td></tr>
</table>

---

## Architecture

The backend enforces all business correctness. The frontend presents already-resolved data.

```
API Routes   →  thin HTTP mapping, auth guards, response contracts
     ↓
Services     →  business rules, orchestration, transaction ownership (18 services)
     ↓
Repositories →  data access, DataMapper pattern, base CRUD (13 repositories)
     ↓
Models       →  14 SQLAlchemy ORM models, 61 Alembic migrations
```

- **Unit of Work** — `DBManager` coordinates 13 repositories in one atomic transaction with deadlock retry and exponential backoff
- **Domain exceptions** — `ArtShopException` hierarchy globally mapped to consistent `{"detail": ...}` JSON responses
- **Provider adapter** — `PrintProvider` abstract base class isolates vendor logic; swap print-on-demand providers without changing business code

### Authentication

- **JWT access (30 min) + refresh (7 days)** in HTTP-only cookies with single-use refresh rotation
- Refresh tokens on Redis **whitelist** (`rt:{jti}`), access tokens on Redis **blacklist** on logout (`at_bl:{token}`)
- **Argon2** password hashing · **Google OAuth** with server-side ID token verification and auto-account creation
- **Rate limiting** — Redis-backed per-IP sliding windows: login 5/15min, register 10/1hr, OAuth 10/5min
- **Public order references** — XOR + Base36 encoding hides sequential database IDs in URLs and emails

### Checkout & Payments

- **Server-owned** — the browser never dictates final prices; print economics are rehydrated from the active Prodigi storefront payload
- **Mixed cart splitting** — originals and prints become separate order rows linked by `checkout_group_id`, paid through one Monobank invoice
- **ECDSA webhook verification** for Monobank payment callbacks with automatic public key rotation retry
- **Abandoned order cleanup** — Celery Beat releases locked original artworks hourly
- **Transactional emails** — DB-driven templates (editable in admin panel), dispatched in background threads

### Prodigi Print-on-Demand

The most architecture-heavy subsystem — **31 service modules** isolated behind the `PrintProvider` adapter:

```
Raw CSV → Curator → Parser → Planner → Baker → Materializer → Read Model
                                                                    ↓
                                                Shop · Artwork page · Checkout
```

- Storefront reads come from **materialized per-artwork × per-country JSON payloads** — no live API probes
- Bake tables model available products across **countries × aspect ratios × categories × sizes**
- **Preflight gates** verify every requirement before order submission: active SKU, print area dimensions, asset availability (HTTPS HEAD + MD5), country routing, product attributes
- **Fulfillment jobs** persist request/response payloads, idempotency keys, payload hashes, events, and retry state
- Print assets rendered with **Pillow LANCZOS**, uploaded to **S3**, verified before submission

---

## Testing & Production

**51 test files** across unit and integration suites with isolated test DB, safety guards, JSON mock fixtures validated through Pydantic, in-memory MockRedis, and authenticated admin client fixture.

| Coverage | Details |
|---|---|
| Auth & Security | Registration, login, token lifecycle, admin guards, config safety |
| Checkout & Orders | Mixed original/print flows, cart splitting, economics, abandoned cleanup |
| Payments | Monobank invoice creation, status transitions, webhook handling |
| Prodigi (20+ files) | Catalog pipeline, storefront bake, fulfillment policy, order assets, sizing, shipping, callbacks |

**Production** — 12 Docker services with health checks, dependency ordering, and persistent volumes. CI runs on every push (3 parallel jobs: backend lint, frontend lint/build, backend tests with Postgres + Redis). CD deploys to production via SSH after CI passes on main — `docker compose up --build` → Alembic migration → Prodigi auto-rebuild if stale.

**Nginx:** TLS · HTTP/2 · gzip · HSTS · security headers · rate limiting · restricted Swagger · Grafana/Dozzle subpath routing.
**Backup:** Automated `pg_dump` + rclone differential media sync to Google Drive.

---

## Project Structure

```
├── backend/
│   └── src/
│       ├── api/                                 # 15 FastAPI route modules
│       │   ├── auth.py                          #   JWT login, register, refresh, Google OAuth
│       │   ├── payments.py                      #   Monobank invoice creation, ECDSA webhook
│       │   ├── orders.py                        #   Checkout, fulfillment status, tracking
│       │   ├── artworks.py                      #   Gallery CRUD, image upload, likes
│       │   └── geo.py, labels.py, ...           #   Geo detection, labels, site settings
│       │
│       ├── services/                            # 18 business service classes
│       │   ├── orders.py (1071 lines)           #   Full checkout lifecycle, mixed cart, emails
│       │   ├── monobank.py                      #   Payment gateway client, ECDSA verification
│       │   ├── auth.py                          #   Token pairs, Argon2, password management
│       │   ├── email.py                         #   SMTP transactional emails, DB templates
│       │   └── artworks.py, labels.py, ...      #   Domain services
│       │
│       ├── repositories/                        # Data access layer
│       │   ├── base.py                          #   Generic CRUD + DataMapper pattern
│       │   └── artworks.py, orders.py, ...      #   Specialized query repositories
│       │
│       ├── models/                              # 14 SQLAlchemy ORM models
│       ├── schemas/                             # Pydantic v2 DTOs (request / response)
│       │
│       ├── integrations/prodigi/                # Prodigi provider boundary (31 modules)
│       │   ├── catalog_pipeline/                #   Raw CSV → Curate → Parse → Plan
│       │   ├── services/                        #   Storefront bake, materialization,
│       │   │                                    #   fulfillment, order assets, sizing,
│       │   │                                    #   shipping policy, snapshot, settings
│       │   ├── fulfillment/                     #   Preflight gates, submit, retry, track
│       │   ├── api/                             #   Admin routes, webhooks, diagnostics
│       │   └── tasks/                           #   Maintenance CLI tools
│       │
│       ├── print_on_demand/                     # Abstract provider adapter (strategy)
│       │   ├── base.py                          #   PrintProvider ABC — vendor contract
│       │   └── registry.py                      #   Provider lookup + singleton cache
│       │
│       ├── tasks/                               # Celery workers + Beat schedules
│       ├── middleware/                          # Redis-based rate limiting
│       ├── connectors/                          # Telegram Bot, Redis manager
│       ├── migrations/                          # 61 Alembic versions
│       └── utils/
│           ├── db_manager.py                    #   Unit of Work — 13 repos, deadlock retry
│           └── order_public_code.py             #   XOR + Base36 order reference encoding
│
├── backend/tests/                               # 51 test files
│   ├── unit_tests/services/                     #   30 service tests (Prodigi, orders, auth)
│   ├── unit_tests/schemas/                      #   Schema validation tests
│   ├── unit_tests/tasks/                        #   Celery task tests
│   ├── integration_tests/                       #   Full API endpoint flows
│   ├── mocks/                                   #   JSON fixtures (users, artworks, orders)
│   └── conftest.py                              #   DB setup, MockRedis, auth fixtures
│
├── frontend/src/
│   ├── app/                                     # Next.js 16 App Router
│   │   ├── admin/                               #   Admin dashboard — 50+ components
│   │   │   └── components/                      #   Orders, Prodigi hub, artwork management,
│   │   │                                        #   fulfillment, storefront settings, email
│   │   │                                        #   templates, labels, print pricing
│   │   ├── artwork/[slug]/                      #   Artwork detail + print configurator
│   │   ├── shop/                                #   Storefront with country-aware pricing
│   │   ├── checkout/                            #   Multi-step checkout flow
│   │   └── gallery/, about/, contact/, faq/     #   Content pages
│   ├── components/                              #   Shared UI (Navbar, Footer, Cart, Auth)
│   ├── context/                                 #   Cart, User, Preferences providers
│   └── hooks/                                   #   Custom React hooks
│
├── nginx/nginx.conf                             # TLS, HTTP/2, rate limits, security headers
├── monitoring/prometheus.yml                    # Metrics collection config
├── scripts/backup.sh                            # pg_dump + rclone to Google Drive
├── .github/workflows/                           # CI (lint + test) + CD (SSH deploy)
├── docker-compose.yml                           # Local dev (Postgres + Redis)
├── docker-compose.prod.yml                      # Production (12 services)
└── Makefile                                     # Developer commands
```

---

## Local Development

```bash
cp .env.example .env        # Configure environment
make infra                   # PostgreSQL + Redis in Docker
make migrate                 # Alembic migrations
make api                     # FastAPI with hot reload
make frontend                # Next.js dev server
make test                    # Run backend test suite
```

---

<div align="center">

[PolyForm Noncommercial License 1.0.0](LICENSE)

Built by [Semen Bondarenko](https://github.com/SamenB)

</div>
