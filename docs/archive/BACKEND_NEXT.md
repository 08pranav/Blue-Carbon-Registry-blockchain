# Backend upgrade plan (Postgres + Prisma + JWT)

This plan describes the migration from the demo backend to a production-ready stack.

1) Stack
- DB: Postgres (docker-compose already present)
- ORM: Prisma
- Auth: JWT (access + refresh), argon2 password hashing
- Storage: uploads to backend/uploads (or S3 in prod)
- CORS: restrict to local dev origin(s)

2) Schema (Prisma)
- User(id, name, email, role, org, passwordHash, createdAt)
- Project(id, title, description, ecosystem, location, latitude, longitude, area, carbonCreditsEstimated, carbonCreditsIssued, status, submitterId, createdAt, updatedAt)
- EvidenceFile(id, projectId, url, filename, size, mimeType, createdAt)
- Verification(id, projectId, auditorId, status, notes, createdAt)
- Listing(id, projectId, pricePerCredit, status, createdAt)
- Transaction(id, projectId, quantity, totalAmount, buyerId, txHash, retired, createdAt)

3) Routes
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile (JWT), POST /api/auth/refresh
- Projects: GET/POST /api/projects; GET/DELETE /api/projects/:id; PATCH /api/projects/:id/status
- Evidence: POST /api/projects/:id/evidence (multer)
- Admin: GET /api/admin/users; PATCH /api/admin/users/:id; GET /api/admin/stats
- Blockchain (server-side signer): POST /api/blockchain/mint, POST /api/blockchain/retire; GET /api/blockchain/transactions

4) Steps
- Add Prisma: npm i prisma @prisma/client && npx prisma init
- Define schema.prisma with models above; run npx prisma migrate dev
- Replace in-memory arrays with Prisma queries
- Implement JWT middleware
- Replace mocked blockchain endpoints with ethers signer calls (Sepolia)

5) Observability
- Request logging (morgan/pino), error handling, rate limiting

6) Security
- Helmet, CORS allow-list, input validation (zod), secret management
