<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/readme-assets/logo.png" />
  <source media="(prefers-color-scheme: light)" srcset="docs/readme-assets/logo.png" />
  <img src="docs/readme-assets/logo.png" alt="Samen Bondarenko Gallery" width="420" />
</picture>

### Production-Grade Art Commerce Platform

**Full-stack system for selling original artwork and fine art prints — print-on-demand fulfillment, secure payments, admin operations center, and automated deployment.**

🔗 **Live:** [samen-bondarenko.com](https://samen-bondarenko.com)

<br/>

[![CI](https://github.com/SamenB/SBGallery/actions/workflows/ci.yml/badge.svg)](https://github.com/SamenB/SBGallery/actions/workflows/ci.yml)
[![CD](https://github.com/SamenB/SBGallery/actions/workflows/cd.yml/badge.svg)](https://github.com/SamenB/SBGallery/actions/workflows/cd.yml)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.124-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis 7](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/License-PolyForm%20NC%201.0.0-lightgrey.svg)](LICENSE)

</div>

---

A commercial art commerce platform powering [samen-bondarenko.com](https://samen-bondarenko.com) — a live gallery and print shop that processes real orders, handles payments, and fulfills print-on-demand deliveries worldwide. Fully designed and built by me: backend architecture, system design, admin tooling, deployment pipeline, and frontend design direction (with AI assistance on frontend implementation).

**Backend-heavy by design.** Prices, shipping, payment state, print availability, and fulfillment decisions live in backend source-of-truth layers. The frontend presents already-resolved data.

> **18** backend services · **14** ORM models · **31** Prodigi service modules · **51** test files · **61** Alembic migrations · **12** production Docker services

---

## Visual Walkthrough

The public storefront hides most of the operational complexity. The admin side is where the real engineering lives.

<details>
<summary>
<strong>📊 Admin: Prodigi Snapshot Visualization</strong>
<br/><sub>Country-aware storefront matrix — product families, sizes, shipping routes, delivery availability, and catalog coverage after the bake/materialization pipeline.</sub>
</summary>

<!-- ![Prodigi Snapshot Visualization](docs/readme-assets/admin-snapshot-visualization.png) -->

</details>

<details>
<summary>
<strong>🖼️ Admin: Artwork Master Upload & Print Readiness</strong>
<br/><sub>Master file upload, aspect-ratio validation, print configuration, generated assets, and production readiness status.</sub>
</summary>

<!-- ![Artwork Master Upload](docs/readme-assets/admin-artwork-master-upload.png) -->

</details>

<details>
<summary>
<strong>📦 Admin: Prodigi Fulfillment Pipeline</strong>
<br/><sub>Fulfillment jobs, preflight gates, provider payload state, callback history, retry controls, cost breakdown, and audit trail.</sub>
</summary>

<!-- ![Prodigi Fulfillment Pipeline](docs/readme-assets/admin-prodigi-fulfillment-pipeline.png) -->

</details>

<details>
<summary>
<strong>💳 Admin: Orders & Monobank Checkout</strong>
<br/><sub>Order economics, payment state, Monobank invoice references, grouped checkout segments, fulfillment lifecycle, and admin operations.</sub>
</summary>

<!-- ![Monobank Checkout Orders](docs/readme-assets/admin-monobank-orders.png) -->

</details>

<details>
<summary>
<strong>🎨 Public: Storefront</strong>
<br/><sub>Customer-facing artwork presentation, available print products by country, regional pricing, and checkout entry.</sub>
</summary>

<!-- ![Public Storefront](docs/readme-assets/public-storefront.png) -->

</details>

---

## Tech Stack

<table>
<tr><td><strong>Backend Core</strong></td><td>Python 3.12 · FastAPI · Pydantic v2 · SQLAlchemy 2 (async) · asyncpg · Alembic · Uvicorn</td></tr>
<tr><td><strong>Data & Async</strong></td><td>PostgreSQL 15 · Redis 7 · Celery + Celery Beat · fastapi-cache2</td></tr>
<tr><td><strong>Security</strong></td><td>JWT (access + refresh) · Argon2 hashing · ECDSA webhook verification · Redis token whitelist/blacklist · Rate limiting</td></tr>
<tr><td><strong>Integrations</strong></td><td>Prodigi Print API · Monobank Acquiring · Google OAuth · IP Geo API · S3 storage (boto3) · SMTP · Telegram Bot</td></tr>
<tr><td><strong>Image Pipeline</strong></td><td>Pillow (LANCZOS) · WebP multi-variant generation · Async Celery processing</td></tr>
<tr><td><strong>Frontend</strong></td><td>Next.js 16 (App Router) · React 19 · TypeScript 5 strict · Tailwind CSS 4 · PostHog</td></tr>
<tr><td><strong>Infrastructure</strong></td><td>Docker Compose (12 services) · Nginx (TLS, HTTP/2, gzip) · Let's Encrypt · GitHub Actions CI/CD</td></tr>
<tr><td><strong>Monitoring</strong></td><td>Prometheus · Grafana · Node Exporter · Dozzle · Loguru (structured JSON, rotating files)</td></tr>
<tr><td><strong>Quality</strong></td><td>pytest (51 files) · Ruff · ESLint · TypeScript checks · CI build/test gates</td></tr>
</table>

---

## Architecture

```
API Routes  →  thin HTTP mapping, auth guards, response contracts
     ↓
Services    →  business rules, use cases, orchestration, transaction ownership
     ↓
Repositories →  SQL/ORM queries, DataMapper pattern, base CRUD
     ↓
Models       →  14 SQLAlchemy ORM models, 61 Alembic migrations
```

The `DBManager` implements a **Unit of Work** pattern — 13 repositories in one atomic transaction with deadlock retry. Domain exceptions (`ArtShopException` hierarchy) are globally mapped to consistent JSON responses. External providers live behind **adapter boundaries** (e.g., `PrintProvider` abstract base class — swap print vendors without touching business logic).

### Authentication & Security

- **JWT access (30 min) + refresh (7 days)** in HTTP-only cookies
- Refresh tokens → Redis **whitelist** with single-use rotation
- Access tokens → Redis **blacklist** on logout (lives until natural expiry)
- **Argon2** password hashing via `pwdlib`
- **Google OAuth** with server-side ID token verification and auto-account creation
- **Rate limiting** — Redis-backed per-IP sliding windows on auth endpoints
- **Public order references** — XOR + Base36 encoding hides sequential DB IDs

### Checkout & Payment Flow

- **Server-owned checkout** — the browser never dictates final prices
- Print economics **rehydrated from active Prodigi storefront payload**, not from browser-submitted values
- **Mixed cart splitting** — originals and prints become separate order rows linked by `checkout_group_id`, paid through one Monobank invoice
- **ECDSA webhook verification** for Monobank callbacks with automatic key rotation retry
- **Payment polling** — success page covers missed/delayed webhooks via Monobank status API
- **Abandoned order cleanup** — Celery Beat releases locked original artworks hourly
- **Transactional emails** — DB-driven templates editable via admin panel, sent in background threads

### Prodigi Print-on-Demand

The most architecture-heavy part. Isolated behind an abstract `PrintProvider` adapter, with 31 service modules:

```
Raw supplier CSV → Curator → Parser → Planner → Baker → Materializer → Read Model
                                                                            ↓
                                                        Shop · Artwork detail · Checkout
```

- Runtime reads from **materialized per-artwork × per-country payloads** — no live API probes
- Bake tables model products across **countries × aspect ratios × categories × sizes**
- **Preflight gates** verify: active SKU, print area dimensions, public asset availability (HTTPS + MD5), country routing, product attributes
- **Fulfillment jobs** persist request/response payloads, idempotency keys, payload hashes, events, and issues
- Celery Beat **auto-retries** failed fulfillment jobs every 15 minutes
- Print assets rendered with **Pillow LANCZOS**, uploaded to **S3**, verified via HTTPS HEAD + MD5 before submission

---

## Testing

**51 test files** across unit and integration suites:

| Area | Coverage |
|---|---|
| Auth & Security | Registration, login, token lifecycle, admin guards, config safety |
| Checkout & Orders | Mixed original/print flows, cart splitting, order economics, abandoned cleanup |
| Payments | Monobank invoice creation, status transitions, webhook handling, public order refs |
| Prodigi Catalog | Pipeline stages, storefront bake, settings, snapshot visualization, shipping policies |
| Prodigi Fulfillment | Order assets, print area resolution, fulfillment policy, admin actions, callbacks, validation |
| Assets & Storage | S3 publication, download verification, MD5 checks |
| Business Logic | Artworks, labels, likes, email templates, contact flows, print pricing, rehydration |

Test infrastructure: isolated test DB with safety guards · full schema rebuild per session · JSON mock fixtures validated through Pydantic · in-memory MockRedis · authenticated admin client fixture.

---

## Production Stack

**12 Docker services** orchestrated via Docker Compose with health checks, dependency ordering, and persistent volumes:

`artshop_db` · `artshop_redis` · `artshop_migrator` · `artshop_media_init` · `artshop_api` · `artshop_worker` · `artshop_beat` · `artshop_frontend` · `artshop_nginx` · `monitoring_prom` · `monitoring_grafana` · `monitoring_dozzle`

**CI** (every push) → backend lint + frontend lint/build + backend tests (with Postgres + Redis services)
**CD** (main branch) → SSH deploy → `docker compose up --build` → Alembic migration → Prodigi auto-rebuild if stale → image prune

**Nginx:** TLS · HTTP/2 · gzip · HSTS · security headers · rate limiting · restricted Swagger · Grafana/Dozzle routing
**Backup:** Automated `pg_dump` + rclone differential media sync to Google Drive

---

## Key Patterns

| Pattern | Application |
|---|---|
| **Layered Architecture** | API → Services → Repositories → Models with strict boundaries |
| **Unit of Work** | `DBManager` — 13 repos, one transaction, deadlock retry |
| **Strategy / Adapter** | `PrintProvider` abstract base — vendor-swappable |
| **Materialized Read Models** | Prodigi bake tables + per-artwork JSON payloads |
| **Domain Exception Hierarchy** | `ArtShopException` subclasses globally mapped to JSON |
| **Token Whitelist/Blacklist** | Refresh on whitelist (rotation), access on blacklist (logout) |
| **Server-Owned Checkout** | Backend rehydrates economics, never trusts browser amounts |
| **Idempotent Webhooks** | Terminal status guards prevent duplicate processing |
| **Preflight Gate System** | Multi-check pipeline before print order submission |
| **Pipeline Architecture** | CSV → Parse → Curate → Plan → Bake → Materialize → Read Model |
| **Public Code Encoding** | XOR + Base36 — opaque customer-facing order references |

---

## Local Development

```bash
cp .env.example .env        # Configure environment
make infra                   # PostgreSQL + Redis in Docker
make migrate                 # Alembic migrations
make api                     # FastAPI with hot reload
make frontend                # Next.js dev server
make worker                  # Celery worker (optional)
make beat                    # Celery Beat scheduler (optional)
make test                    # Run 51 backend test files
```

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

## License

[PolyForm Noncommercial License 1.0.0](LICENSE)

<div align="center">

Built by [Semen Bondarenko](https://github.com/SamenB)

</div>
