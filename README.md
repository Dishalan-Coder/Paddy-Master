# Paddy Master

A production-oriented web platform for paddy-field management and direct paddy trading. The system supports three roles: **administrator**, **paddy farmer**, and **buyer**, using a React frontend, FastAPI backend, MongoDB database, and optional Amazon S3 image storage.

## Implemented modules

### Farmer workspace

- Farm creation, editing, and deletion
- Crop tracking by variety, planted date, growth stage, and expected harvest date
- Expense recording by farm/crop/category
- Revenue, expense, profit, wallet, active-crop, listing, and order summaries
- Rule-based fertilizer, irrigation, crop-care, harvest, pest, and weather recommendations
- Paddy listing creation with up to five images
- Incoming order management and status updates
- Tamil/English language switcher
- Profile editing and profile-photo upload

### Buyer workspace

- Searchable and filterable paddy marketplace
- Product details, farmer verification, farmer rating, and product reviews
- Order placement with quantity, delivery address, and notes
- Cash-on-delivery, bank-transfer, and non-production card workflow
- Active/completed order dashboard and order history
- Review submission for delivered purchases
- Profile and notification management

### Administrator workspace

- Platform analytics dashboard
- User directory and farmer/buyer verification
- Product moderation and deletion
- Order monitoring
- Daily/regional market-price management
- Platform notifications and profile access

### Shared intelligence

- Current weather and five-day forecast
- Rain, flood, drought, pest, and disease-risk alerts
- Daily paddy prices, regional comparison, and price trends
- Event notifications for registration, orders, payments, reminders, and status changes
- Durable image object keys with freshly generated S3 presigned URLs
- Local image-storage fallback for development

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios, Recharts, i18next |
| Backend | Python, FastAPI, Pydantic, Motor, JWT authentication |
| Database | MongoDB |
| Images | Amazon S3, with local filesystem fallback |
| Deployment | Docker Compose, Nginx, Uvicorn |
| Testing | Pytest, HTTPX, Vitest, React Testing Library |

## Run the complete system with Docker

### Requirements

- Docker Engine or Docker Desktop
- Docker Compose

### Start

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Website: `http://localhost:5173`
- API documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Load the demonstration dataset

After the containers are running:

```bash
docker compose exec backend python3 -m scripts.seed_demo
```

Demo accounts:

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@paddymaster.lk` | `Demo123!` |
| Farmer | `farmer@paddymaster.lk` | `Demo123!` |
| Buyer | `buyer@paddymaster.lk` | `Demo123!` |

The seed command is idempotent and intended only for local demonstration.

### Stop

```bash
docker compose down
```

Delete database and upload volumes as well:

```bash
docker compose down -v
```

## Production deployment

Use the production compose file for a deployable single-host setup. It keeps MongoDB off the public host ports, serves the React build through Nginx, proxies `/api` and `/uploads` to the backend service, and requires production secrets before startup.

```bash
cp .env.production.example .env.production
# Edit .env.production with real domain, secrets, CORS origins, and storage settings.
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

Production defaults:

- Frontend: exposed on `${FRONTEND_PORT:-80}`
- API: available through the frontend origin at `/api/v1`
- Uploads: available through the frontend origin at `/uploads`
- Frontend health check: `/healthz`

Place HTTPS, DNS, certificate renewal, and optional CDN/WAF controls at the load balancer or reverse proxy in front of the frontend container. For card payments, replace the included local workflow with a regulated provider integration before accepting real money.

## Local development

### Backend

Start MongoDB locally, then run:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Optional demo data:

```bash
python -m scripts.seed_demo
```

### Frontend

In a second terminal:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Vite proxies `/api` and `/uploads` to the backend in development.

## Amazon S3 configuration

For local backend development, set these values in `backend/.env`. For Docker Compose, set them in the root `.env`:

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-private-bucket
```

The IAM identity needs permission to put, get, and delete objects in the configured bucket. The application stores stable object keys in MongoDB and generates short-lived presigned image URLs when responses are returned. Keep the bucket private; do not store presigned URLs in the database.

When S3 settings are blank, images are saved under `backend/uploads` and exposed through `/uploads`.

## Weather configuration

Set `WEATHER_API_KEY` in `backend/.env` to use OpenWeatherMap. Without a key, the application returns clearly marked demonstration weather and agricultural alerts so the UI remains usable locally.

## Payment scope

The included payment module is a **basic MVP workflow**, not a production payment gateway:

- Cash on delivery records a pending payment.
- Bank transfer records a reference and processing state; an administrator can confirm receipt.
- Demo card payment accepts a local demonstration token and marks the order paid.

Before accepting real money, integrate a supported payment provider, validate callbacks/webhooks, use idempotency keys, and complete the provider's security/compliance requirements.

## Environment variables

### Backend

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `DB_NAME` | Database name |
| `JWT_SECRET` | JWT signing secret; replace before deployment |
| `JWT_ALGORITHM` | JWT algorithm, normally `HS256` |
| `JWT_EXPIRE_MINUTES` | Access-token lifetime |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `WEATHER_API_KEY` | Optional OpenWeatherMap API key |
| `AWS_ACCESS_KEY_ID` | Optional S3 access key |
| `AWS_SECRET_ACCESS_KEY` | Optional S3 secret |
| `AWS_REGION` | S3 region |
| `S3_BUCKET_NAME` | S3 bucket name |

### Production compose

| Variable | Description |
|---|---|
| `PUBLIC_SITE_URL` | Public HTTPS website origin used by operators and docs |
| `FRONTEND_PORT` | Host port for the Nginx frontend container |
| `MONGO_ROOT_USERNAME` | MongoDB root username for production compose |
| `MONGO_ROOT_PASSWORD` | MongoDB root password for production compose |
| `CORS_ORIGINS` | Exact deployed frontend origin, for example `https://paddymaster.example.com` |

### Frontend

```env
VITE_API_BASE_URL=/api/v1
```

## Project structure

```text
paddy-master/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # FastAPI route modules
│   │   ├── core/               # Settings, JWT, password security
│   │   ├── db/                 # MongoDB connection and indexes
│   │   ├── middleware/         # Authentication, roles, errors
│   │   ├── models/             # Pydantic request/domain models
│   │   ├── services/           # Business logic and integrations
│   │   ├── utils/              # Mongo and validation helpers
│   │   └── main.py             # FastAPI application
│   ├── scripts/                # Demo seeding/admin utility
│   ├── tests/                  # Backend automated tests
│   ├── uploads/                # Local image fallback
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI by feature
│   │   ├── context/            # Authentication state
│   │   ├── layouts/            # Public/auth/dashboard shells
│   │   ├── locales/            # English and Tamil translations
│   │   ├── pages/              # Route-level pages
│   │   ├── routes/             # Role-protected routing
│   │   └── services/           # Typed-by-convention API clients
│   ├── tests/                  # Frontend tests
│   ├── nginx.conf
│   └── Dockerfile
├── docs/
│   ├── ARCHITECTURE.md
│   └── PRODUCTION_CHECKLIST.md
├── .env.production.example
├── docker-compose.prod.yml
└── docker-compose.yml
```

## Verification performed

```bash
# Frontend
npm test
npm run build

# Deployment config
docker compose --env-file .env.production.example -f docker-compose.prod.yml config
```

Validated in this pass:

- Frontend: **30 tests passed**
- Frontend production build: passed
- Production Docker Compose config: rendered successfully

Run the backend test suite, dependency audit, container scan, and live MongoDB/S3/payment-provider checks in CI or the target deployment environment before release.

## Production requirements

Read [`docs/PRODUCTION_CHECKLIST.md`](docs/PRODUCTION_CHECKLIST.md) before deployment. At minimum, replace the JWT secret, configure restricted CORS, use HTTPS, secure MongoDB, configure S3 IAM, integrate a real payment gateway, add email/SMS delivery, enable monitoring, and establish backups.
