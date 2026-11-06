# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Frontend: Vite + React + TypeScript + Tailwind + shadcn/ui (alias @ -> ./src)
- Tests: Vitest + Testing Library (jsdom, custom setup at src/test/setup.ts)
- Backend: Node/Express demo API (in-memory), file uploads via Multer (backend/)
- Containerization: Multi-stage Dockerfile (frontend) + docker-compose services (frontend, backend, postgres, redis, nginx)

Core commands
Frontend (root)
- Install deps: npm install
- Dev server (Vite, port 8080): npm run dev
- Build: npm run build
- Preview built app: npm run preview
- Lint: npm run lint

Testing (Vitest)
- Run tests watch mode: npx vitest
- Run tests once with coverage: npx vitest run --coverage
- Run a single test file: npx vitest run src/path/to/Component.test.tsx
- Run tests matching a name: npx vitest -t "pattern"
Notes
- Test env is jsdom with global setup in src/test/setup.ts (mocks for fetch, localStorage, ResizeObserver, etc.).
- Coverage HTML is emitted at coverage/html/index.html (configured in vitest.config.ts).

Backend (backend/)
- Install deps: (cd backend && npm install)
- Dev (nodemon): (cd backend && npm run dev)
- Start: (cd backend && npm start)
Defaults
- PORT=3001, CORS origin expected http://localhost:3000 in docker-compose (see caveats below).

Docker
- Build frontend image: docker build -t blue-carbon-frontend .
- Run frontend container: docker run -p 3000:80 blue-carbon-frontend
- Full stack: docker compose up --build
Caveat: docker-compose.yml references ./nginx/nginx.conf but the repo has nginx.conf at repo root. Either move nginx.conf into ./nginx/nginx.conf or update the compose volume path before using the nginx service.

High-level architecture
Frontend
- Entry and routing
  - Entry: src/main.tsx; App root: src/App.tsx; routing via react-router (pages under src/pages/).
- UI and styling
  - Tailwind configured in tailwind.config.ts with extended theme tokens; shadcn/ui components under src/components/ui/.
- State and context
  - AuthContext at src/contexts/AuthContext.tsx manages user state, demo-mode seeding, and permissions utility (src/lib/permissions.ts). Tokens are stored in localStorage.
- Data access
  - Two API layers exist:
    1) src/lib/api.ts exports an ApiClient (authAPI/registryAPI/etc.) targeting http://localhost:3001 and handling auth token headers, JSON, and uploads; used by AuthContext and admin services.
    2) src/services/api.ts (ApiService) also wraps fetch against http://localhost:3001 (or production base) and is used by some components (e.g., VerificationDashboard).
  - Recommendation for agents: prefer a single API layer per feature; maintain consistency with the file that the feature already imports (do not switch layers mid-feature).
- Notable feature modules
  - Verification workflow: src/components/VerificationDashboard.tsx drives auditor flows (status transitions, notes, stats), pulling from the API service and transforming payloads for the UI.
  - Marketplace and project features live under src/pages/ (Marketplace, Projects, Submit, Verification, Admin, etc.), sharing UI primitives in src/components/ui and helper libs in src/lib/.
- Configuration
  - Vite server runs on port 8080 with host "::"; path alias @ points to ./src (vite.config.ts, tsconfig.json).

Backend (backend/)
- Express server (backend/server.js) provides demo endpoints for:
  - Auth: /api/auth/login, /api/auth/profile
  - Projects: /api/projects (list/detail/create), status updates, and pending verifications
  - Admin: /api/admin/stats, /api/admin/users
  - Marketplace: listings, purchase, transactions, retire
  - Uploads: /api/upload serving static files in backend/uploads (Multer)
- Storage is in-memory for demo/development; uploads are written to backend/uploads.

Integration notes
- Frontend expects the backend at http://localhost:3001 in development; both src/lib/api.ts and src/services/api.ts encode this.
- AuthContext seeds a demo user/token if none exist, enabling the app to function without a running backend for basic flows. When the backend is running, profile is fetched and local state is updated.

Caveats and repo-specific quirks
- Port expectations differ by environment:
  - Vite dev server: 8080 (open http://localhost:8080)
  - Docker frontend container: exposes 80, commonly mapped to host 3000 in examples
- docker-compose.yml services include postgres and redis, but the current backend implementation is in-memory and does not connect to them.
- Nginx path mismatch in docker-compose.yml (./nginx/nginx.conf) vs repo file (nginx.conf at root). Adjust before using the nginx service.
