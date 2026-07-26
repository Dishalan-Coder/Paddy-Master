# System Architecture

## Request flow

```text
Browser
  │
  ▼
React/Vite application
  │  Axios + JWT bearer token
  ▼
Nginx or Vite proxy
  │
  ▼
FastAPI /api/v1
  ├── Authentication and role middleware
  ├── Endpoint validation (Pydantic)
  ├── Service-layer business rules
  ├── MongoDB persistence (Motor)
  ├── S3/local image storage
  └── Weather provider integration
```

## Role boundaries

### Farmer

Owns farms, crops, expenses, product listings, and fulfilment actions. Farmer-owned resources are queried with both resource ID and authenticated farmer ID to prevent cross-account access.

### Buyer

Can browse active listings, place orders, complete an MVP payment step, track purchases, and review delivered purchases. Buyers cannot purchase their own farmer listings.

### Administrator

Can view platform analytics, verify accounts, inspect users/orders/products, remove products/users, and maintain regional market prices. An administrator cannot delete their own account.

## Main collections

- `users`: credentials, role, verification, profile, rating, wallet
- `farms`: farmer-owned field information
- `crops`: crop cycle, stage, planting and expected harvest dates
- `expenses`: cost records linked to farm/crop
- `products`: marketplace listings and durable image keys
- `orders`: buyer/farmer transaction, fulfilment, and payment state
- `reviews`: delivered-order verified reviews
- `notifications`: user-specific event/reminder messages
- `market_prices`: daily regional paddy-price snapshots
- `messages`: conversation messages

## Image design

MongoDB stores only a durable reference:

- `s3://products/<object>` for Amazon S3
- `local://products/<object>` for local development

The API converts the reference to a usable URL at response time. S3 URLs are presigned and short-lived; local references resolve to `/uploads/...`.

## Authentication

1. Registration hashes the password with bcrypt.
2. Login accepts email or phone and verifies the hash.
3. FastAPI returns a signed JWT containing the user ID and role.
4. React stores the token locally and attaches it to API requests.
5. Endpoint dependencies load the current user and enforce permitted roles.

For high-risk production deployments, add refresh-token rotation, server-side revocation, device/session management, rate limiting, and optional multi-factor authentication.

## Order and stock lifecycle

1. Buyer selects a quantity from an active listing.
2. Backend validates listing ownership, status, and available stock.
3. Stock is reserved when the order is created.
4. Farmer advances valid order states.
5. Cancelling restores stock when applicable.
6. Delivery credits the farmer wallet once.
7. A delivered order is eligible for one verified buyer review.

## Recommendation engine

The MVP uses deterministic rules based on growth stage, expected harvest date, district weather, and generated agricultural alerts. The service boundary is isolated so it can later be replaced or supplemented by agronomist-authored rules, sensor data, or a machine-learning model.
