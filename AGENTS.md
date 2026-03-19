# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Global IP Intelligence Platform — a full-stack web application for intellectual property intelligence with role-based access (User, Analyst, Admin). Built with Spring Boot 3.5 (Java 17) backend and React 19 + Vite frontend. Uses JWT authentication with access/refresh token pairs and Google OAuth2 support. Database is Supabase-hosted PostgreSQL.

## Build & Run Commands

### Backend (from `backend/` directory)

```
# Run the backend (port 8081)
./mvnw.cmd spring-boot:run

# Build without running
./mvnw.cmd clean package -DskipTests

# Run tests
./mvnw.cmd test

# Run a single test class
./mvnw.cmd test -Dtest=IpBackendApplicationTests
```

### Frontend (from `frontend/` directory)

```
# Install dependencies
npm install

# Dev server (port 5173)
npm run dev

# Lint
npm run lint

# Production build
npm run build
```

## Environment Configuration

The backend loads environment variables from `backend/.env` via `DotenvConfig.java` (cdimascio dotenv-java). Required variables:
- `SUPABASE_DB_HOST`, `SUPABASE_DB_PORT`, `SUPABASE_DB_NAME`, `SUPABASE_DB_USERNAME`, `SUPABASE_DB_PASSWORD` — PostgreSQL connection
- `JWT_SECRET` — HMAC signing key (min 32 chars)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — OAuth2
- `MAIL_USERNAME`, `MAIL_PASSWORD` — SMTP (Gmail)

The frontend hardcodes the backend URL in `frontend/src/config.js` (`BACKEND_URL`).

## Architecture

### Three Separate Entity Models

Users, Analysts, and Admins are **completely separate entities** stored in different database tables (`users`, `analysts`, `admins`). They do NOT share a base class or common table. Each has its own:
- JPA entity (`model/User.java`, `model/Analyst.java`, `model/Admin.java`)
- Repository
- Service layer
- Controller with distinct `/api/user/`, `/api/analyst/`, `/api/admin/` prefixes

### Authentication Flow

- JWT tokens carry `role` (e.g. `ROLE_USER`) and `subjectType` (`USER`|`ANALYST`|`ADMIN`) claims.
- `JwtAuthenticationFilter` extracts these from the `Authorization: Bearer` header and sets Spring Security context.
- Refresh tokens are DB-backed (`refresh_tokens` table) and polymorphic — `subjectType` + `subjectId` link to the correct entity table.
- `SecurityConfig.java` defines all endpoint access rules — public vs. role-gated. Method-level security (`@PreAuthorize`) is also used on admin endpoints.

### Analyst Approval Workflow

Analyst registration is a multi-step approval process:
1. Analyst submits registration via multipart form (includes identity document upload stored as `bytea` in PostgreSQL).
2. Status starts as `PENDING` — analyst **cannot login**.
3. Admin reviews via `/api/admin/analysts/...` endpoints (list pending, view document, approve/reject).
4. Only `APPROVED` analysts can authenticate.

### Admin Account

The admin account is **seeded automatically** on first startup by `DataInitializer.java` (default: `admin` / `admin@123`). Admins do not register — they are created via the seed or directly in the database.

### Cross-table Uniqueness

`UserService` enforces username/email uniqueness across BOTH the `users` and `analysts` tables during registration. When adding new registration flows, maintain this cross-table check.

### Frontend Structure

- **Routing**: React Router v7 in `App.jsx` — routes map to role-specific dashboards (`/user`, `/analyst`, `/admin`)
- **API layer**: Axios instance in `services/api.js` auto-attaches JWT from `localStorage` via interceptor
- **Token storage**: Access token stored under `ip_access_token` key in localStorage (defined in `config.js`)
- **Styling**: Tailwind CSS v4 (via Vite plugin), dark mode via `class` strategy with `ThemeContext`
- **Notifications**: react-toastify globally configured in `App.jsx`
- **Legacy auth utils**: `utils/auth.js` contains localStorage-based mock auth (admin init, session management) — this is legacy code coexisting with the real JWT flow in `utils/tokenService.js` and `services/api.js`

### Key Conventions

- Backend uses manual getters/setters on entities (Lombok is a dependency but not used on model classes via `@Data` — only for annotation processing setup)
- Controllers accept and return `Map<String, Object>` rather than typed DTOs
- `AuthException` is a custom runtime exception handled by `GlobalExceptionHandler`
- Password validation rules: min 8 chars, at least 1 uppercase, at least 1 number
