# Production Checklist

## Security

- Replace `JWT_SECRET` with a long secret from a secret manager.
- Restrict `CORS_ORIGINS` to deployed domains.
- Terminate HTTPS at a trusted reverse proxy/load balancer.
- Add API rate limiting, login throttling, and security headers.
- Add refresh-token rotation, logout/revocation, password reset, and email/phone verification.
- Run dependency and container-image scanning in CI.
- Never commit `.env`, cloud credentials, database dumps, or user uploads.

## Frontend and delivery

- Use `docker-compose.prod.yml` with `.env.production` for deployment-oriented defaults.
- Confirm the frontend health endpoint returns `200` at `/healthz`.
- Serve the site behind HTTPS and configure DNS, certificate renewal, CDN/WAF, and access logs.
- Keep `/api/v1` and `/uploads` same-origin through the Nginx proxy unless an external API gateway is intentionally configured.
- Validate social metadata, favicon, web manifest, robots rules, and cache headers after deployment.

## MongoDB

- Use authenticated TLS connections.
- Restrict network access and use least-privilege database credentials.
- Confirm indexes after deployment.
- Configure automated backups and test restore procedures.
- Add retention/archive policies for messages, notifications, and audit events.

## S3

- Keep the bucket private and block public access.
- Use a least-privilege IAM role rather than long-lived keys where possible.
- Add encryption, lifecycle rules, versioning, and malware/image validation as required.
- Configure object-size/content-type restrictions and upload observability.

## Payments

- Configure Stripe live-mode secret key, webhook secret, and role-specific recurring price IDs.
- Verify signed Stripe webhooks server-side.
- Confirm Checkout success/cancel URLs and Billing Portal return URLs use HTTPS production origins.
- Add reconciliation, refund, dispute, and audit workflows.
- Never store raw card details.

## Operations

- Add structured logs, error tracking, metrics, uptime checks, and alerts.
- Run backend tests, frontend tests, builds, linting, and migrations/index checks in CI/CD.
- Configure horizontal-scaling-safe file storage (S3, not local disk).
- Add a background-job system for email/SMS/push notifications and scheduled reminders.
- Add privacy policy, terms, consent, retention, and user-data export/deletion processes.

## Agriculture data

- Validate agronomy recommendations with qualified local experts.
- Label forecast/provider sources and stale-data timestamps.
- Add district-specific pest/disease advisories from authoritative sources.
- Treat alerts as decision support, not a guarantee of field outcomes.
