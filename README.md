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

## ⚙️ Tech Stack

<table>
<tr><td><strong>Backend</strong></td><td>Python 3.12 · FastAPI · Pydantic v2 · SQLAlchemy 2 (async) · asyncpg · Alembic · Celery · Uvicorn</td></tr>
<tr><td><strong>Data</strong></td><td>PostgreSQL 15 · Redis 7 (cache, tokens, broker, geo) · fastapi-cache2</td></tr>
<tr><td><strong>Security</strong></td><td>JWT access + refresh · Argon2 (pwdlib) · ECDSA webhook verification · Redis token whitelist/blacklist · Rate limiting</td></tr>
<tr><td><strong>Integrations</strong></td><td>Prodigi Print API · Monobank Acquiring · Google OAuth · S3 storage (boto3) · SMTP · Telegram Bot · IP Geo API</td></tr>
<tr><td><strong>Frontend</strong></td><td>Next.js 16 (App Router) · React 19 · TypeScript 5 strict · Tailwind CSS 4 · PostHog analytics</td></tr>
<tr><td><strong>Infrastructure</strong></td><td>Docker Compose (12 services) · Nginx (TLS, HTTP/2, gzip, HSTS) · Let's Encrypt · GitHub Actions CI/CD</td></tr>
<tr><td><strong>Monitoring</strong></td><td>Prometheus · Grafana · Node Exporter · Dozzle (live logs) · Loguru (structured JSON, rotating files)</td></tr>
<tr><td><strong>Quality</strong></td><td>pytest (264 tests) · Ruff · ESLint · TypeScript strict · CI build/test gates</td></tr>
</table>

---

## 🖼️ Visual Walkthrough

<!-- Uncomment images after adding screenshots to docs/readme-assets/ -->

<details>
<summary><strong>📊 Admin: Prodigi Snapshot Visualization</strong></summary>

![Prodigi Snapshot Visualization](docs/readme-assets/admin-snapshot-visualization.png)

</details>

<details>
<summary><strong>🖼️ Admin: Artwork Master Upload & Print Readiness</strong></summary>

<!-- ![Artwork Master Upload](docs/readme-assets/admin-artwork-master-upload.png) -->

</details>

<details>
<summary><strong>📦 Admin: Prodigi Fulfillment Pipeline</strong></summary>

<!-- ![Prodigi Fulfillment Pipeline](docs/readme-assets/admin-prodigi-fulfillment-pipeline.png) -->

</details>

<details>
<summary><strong>💳 Admin: Orders & Monobank Checkout</strong></summary>

<!-- ![Monobank Checkout Orders](docs/readme-assets/admin-monobank-orders.png) -->

</details>

<details>
<summary><strong>🎨 Public: Storefront</strong></summary>

<!-- ![Public Storefront](docs/readme-assets/public-storefront.png) -->

</details>

---

## 🏗️ Architecture

The backend enforces all business correctness — the frontend presents already-resolved data.

| Layer | Responsibility | Scale |
|---|---|---|
| **API Routes** | HTTP mapping, auth guards, request/response contracts | 15 modules |
| **Services** | Business rules, orchestration, transaction ownership | 18 classes |
| **Repositories** | Data access, DataMapper pattern, base CRUD | 13 repos via Unit of Work |
| **Models** | Persistence shape, relationships, constraints | 14 ORM models, 61 migrations |

**Unit of Work** — `DBManager` coordinates all 13 repositories in one atomic transaction with deadlock retry. **Domain exceptions** — `ArtShopException` hierarchy globally mapped to `{"detail": ...}` JSON. **Provider adapter** — `PrintProvider` ABC isolates vendor logic; swap providers without changing business code.

---

## 🔐 Authentication

- **JWT access (30 min) + refresh (7 days)** in HTTP-only cookies with single-use refresh rotation
- Refresh tokens on Redis **whitelist** (`rt:{jti}`), access tokens on Redis **blacklist** on logout (`at_bl:{token}`)
- **Argon2** password hashing · **Google OAuth** with server-side ID token verification and auto-account creation
- **Rate limiting** — Redis-backed per-IP sliding windows: login 5/15min, register 10/1hr, OAuth 10/5min
- **Public order references** — XOR + Base36 encoding hides sequential database IDs in URLs and emails

---

## 💳 Checkout & Payments

- **Server-owned** — the browser never dictates final prices; print economics are rehydrated from the active Prodigi storefront payload
- **Mixed cart splitting** — originals and prints become separate order rows linked by `checkout_group_id`, paid through one Monobank invoice
- **ECDSA webhook verification** for Monobank payment callbacks with automatic public key rotation retry
- **Abandoned order cleanup** — Celery Beat releases locked original artworks hourly
- **Transactional emails** — DB-driven templates (editable in admin panel), dispatched in background threads

---

## 🖨️ Prodigi Print-on-Demand

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

## 🖼️ Image Processing Pipeline

Gallery images are processed asynchronously via Celery:

1. Upload arrives → saved to temp → Celery task dispatched
2. Normalize color mode (RGBA/LA/P → RGB with white background compositing)
3. Generate four WebP variants: `original` (92%), `large` 2560px (90%), `medium` 1600px (86%), `thumb` 500px (78%)
4. LANCZOS resampling for high-quality downscaling, WebP method 6 compression
5. Atomic database update appends variant URLs to the artwork's JSON image array
6. Temp files cleaned up

---

## ✅ Testing & Quality

**264 tests** across 51 files — unit and integration suites with structured fixtures and mock data:

<table>
<tr><td width="250"><strong>Area</strong></td><td><strong>What's Covered</strong></td></tr>
<tr><td>🔐 Auth & Security</td><td>Registration, login, token lifecycle, admin guards, API contracts, config safety</td></tr>
<tr><td>🛒 Checkout & Orders</td><td>Mixed original/print flows, cart splitting, order economics, abandoned cleanup</td></tr>
<tr><td>💳 Payments</td><td>Monobank invoice creation, status transitions, public order references, webhook handling</td></tr>
<tr><td>🖨️ Prodigi Catalog</td><td>Pipeline stages, storefront bake, settings, snapshot visualization, shipping policies</td></tr>
<tr><td>📦 Prodigi Fulfillment</td><td>Order assets, print area resolution, fulfillment policy, admin actions, status mapping, callbacks, validation reports</td></tr>
<tr><td>☁️ Assets & Storage</td><td>S3 publication, download verification, MD5 checks for provider-ready print assets</td></tr>
<tr><td>🖼️ Image Processing</td><td>Gallery image variants, upload workflows, WebP conversion</td></tr>
<tr><td>📊 Business Logic</td><td>Artwork services, labels, likes, email templates, contact flows, print pricing, order rehydration</td></tr>
<tr><td>⚙️ Infrastructure</td><td>CI workflow safety checks, production prepare decider, print provider registry</td></tr>
</table>

**Test infrastructure:**
- Isolated test database with safety guards (refuses to run against non-test database names)
- Full schema rebuild per session via `DROP SCHEMA CASCADE` + `Base.metadata.create_all`
- JSON mock fixtures validated through Pydantic before insertion
- Mock Redis (in-memory) for token/rate-limit tests without external dependencies
- Authenticated test client fixture with admin privileges
- In-memory FastAPI cache backend

**Quality gates (enforced in CI):**

```bash
# Backend
ruff check .                    # Lint
ruff format --check .           # Format verification
pytest -v                       # 264 tests across 51 files

# Frontend  
npx eslint .                    # Lint
npx tsc --noEmit                # Type checking
npm run build                   # Production build verification
```

---

## 🚢 Production Deployment

### CI/CD Pipeline

**CI** runs on every push/PR with concurrency control (cancels redundant runs) — 3 parallel jobs:

| Job | What It Does |
|---|---|
| **Backend Lint** | `ruff check .` + `ruff format --check .` |
| **Frontend Lint** | `eslint .` + `tsc --noEmit` + `npm run build` |
| **Backend Tests** | Full pytest suite with PostgreSQL + Redis service containers |

**CD** triggers automatically after CI passes on `main`:

`SSH connect` → `git fetch/reset` → `docker compose up --build` → `Alembic migrate` → `Prodigi auto-rebuild if stale` → `image prune`

### Production Stack — 12 Services

| Service | Container | Role |
|---|---|---|
| 🐘 **Database** | `artshop_db` | PostgreSQL 15 with persistent volumes and health checks |
| ⚡ **Cache/Broker** | `artshop_redis` | Redis 7 — cache, token state, Celery broker |
| 📋 **Migrator** | `artshop_migrator` | One-shot Alembic migration runner (exits after completion) |
| 📁 **Media Init** | `artshop_media_init` | Volume permission repair (root → appuser) |
| 🔧 **API** | `artshop_api` | FastAPI backend (non-root user, no port exposed to host) |
| ⚙️ **Worker** | `artshop_worker` | Celery background worker for async jobs |
| ⏰ **Beat** | `artshop_beat` | Celery Beat for scheduled tasks |
| ⚛️ **Frontend** | `artshop_frontend` | Next.js production build with persistent cache |
| 🔒 **Nginx** | `artshop_nginx` | Reverse proxy, TLS, HTTP/2, gzip, rate limiting, security headers |
| 📊 **Prometheus** | `monitoring_prom` | Metrics collection (15-day retention) |
| 📈 **Grafana** | `monitoring_grafana` | Dashboard UI (served from `/grafana/` subpath) |
| 📋 **Dozzle** | `monitoring_dozzle` | Live container logs (password-protected via Nginx Basic Auth) |

**Nginx security:** HTTP→HTTPS redirect, HSTS, X-Frame-Options, X-Content-Type-Options, XSS protection, restricted Swagger/OpenAPI access, rate-limited API endpoints.

**Backup:** Automated daily script — `pg_dump` to Google Drive via rclone + differential media sync from Docker volumes.

---

## 📁 Project Structure

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
├── backend/tests/                               # 51 test files (264 tests)
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

## 🚀 Local Development

```bash
cp .env.example .env        # Configure environment
make infra                   # PostgreSQL + Redis in Docker
make migrate                 # Alembic migrations
make api                     # FastAPI with hot reload
make frontend                # Next.js dev server
make worker                  # Celery worker (optional)
make beat                    # Celery Beat scheduler (optional)
make test                    # Run 264 backend tests
make lint                    # Ruff lint + format check
```

---

## 💡 What This Project Demonstrates

- **Backend source-of-truth design** — money, shipping, payment state, and fulfillment logic never lives in the frontend
- **Real external system integration** — provider-specific logic isolated behind adapter boundaries, not scattered across the codebase
- **Durable catalog pipelines** — materialized read models instead of live API probes in customer-facing hot paths
- **Asynchronous commerce workflows** — persisted jobs, events, retries, callbacks, and admin diagnostics
- **Production deployment as part of the product** — CI/CD, TLS, monitoring, backup, health checks are not afterthoughts
- **Comprehensive test coverage** — business rules, APIs, payment flows, fulfillment, and infrastructure safety checks

---

<div align="center">

[PolyForm Noncommercial License 1.0.0](LICENSE)

Built by [Semen Bondarenko](https://github.com/SamenB)

</div>

