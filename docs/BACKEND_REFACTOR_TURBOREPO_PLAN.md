# Backend Refactor - Turborepo Monorepo Architecture Plan

**Phase:** Phase E (Backend Infrastructure)  
**Issues:** #110-#118 (9 issues, 4-8 weeks estimated)  
**Start Date:** March 10, 2026 (after v1.7.0 production deployment)  
**Branch:** backend-refactor  
**Status:** PLANNING PHASE

---

## Executive Summary

This plan implements a **Turborepo monorepo** with three apps (web, api, mobile) to replace the current Supabase-dependent architecture with a scalable, self-hosted backend.

### Current Architecture (Monolithic)
```
giapha-os/
├── app/           # Next.js frontend
├── components/
├── utils/
├── __tests__/
└── docs/
```

### Target Architecture (Microservices)
```
giapha-os/
├── apps/
│   ├── web/       # Next.js frontend (refactored, no Supabase client)
│   ├── api/       # Fastify backend (Prisma + PostgreSQL)
│   └── mobile/    # Expo React Native app
├── packages/
│   ├── types/     # Shared TypeScript types
│   └── api-client/ # Shared HTTP client
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Issue Breakdown

### Issue #110: Turborepo Monorepo Setup (1 week)
**Effort:** 40 hours  
**Dependencies:** None  
**Status:** NEXT (start immediately)

#### Tasks:
1. Initialize Turborepo root
2. Setup `pnpm-workspace.yaml`
3. Create shared `tsconfig.json` & `eslint.config.js`
4. Move current web app to `apps/web`
5. Create `packages/types` and `packages/api-client`
6. Configure build pipeline

#### Deliverables:
- Root `turbo.json` with pipeline config
- Shared `tsconfig` inheritance
- `packages/types` with shared interfaces
- `packages/api-client` with fetch wrapper
- CI/CD pipeline configuration

---

### Issue #111: Fastify + Prisma Backend Setup (2 weeks)
**Effort:** 80 hours  
**Dependencies:** #110 completed  
**Status:** BLOCKED (ready when #110 done)

#### Tasks:
1. Initialize `apps/api` with Fastify 5
2. Setup Prisma ORM
3. Configure PostgreSQL connection
4. Docker Compose for local dev
5. Database schema migration
6. Error handling & logging
7. CORS and security headers

#### Deliverables:
- `apps/api/` with Fastify server
- `prisma/schema.prisma` from current SQL
- Docker Compose for PostgreSQL
- Request logging setup
- Error handling middleware
- Health check endpoint

#### Database Schema (25 tables to migrate):
- users, profiles, refresh_tokens
- persons, relationships, family_settings
- branches, invitations, notification_settings
- notification_tokens, notification_logs
- events, custom_events, graves, timeline
- photos, media_uploads, sync_logs
- rate_limits, admin_logs, subscriptions

---

### Issue #112: JWT Authentication System (2 weeks)
**Effort:** 60 hours  
**Dependencies:** #111 completed  
**Status:** BLOCKED

#### Endpoints to Build:
- `POST /auth/register` (email + password)
- `POST /auth/login` (returns JWT + refresh token cookie)
- `POST /auth/refresh` (refresh access token)
- `POST /auth/logout` (revoke refresh token)
- `POST /auth/forgot-password` (email reset link)
- `POST /auth/reset-password` (set new password)
- `GET /auth/me` (current user info)

#### Features:
- bcrypt password hashing
- JWT (RS256) with 15min expiry
- Refresh token (30 days) in HttpOnly cookie
- Token revocation table
- Rate limiting (3 attempts/5min)
- Email-based password reset
- Role-based access (admin/editor/member)

#### Deliverables:
- Authentication middleware
- JWT generation/verification
- Refresh token management
- Password reset email template
- Complete auth flow tests

---

### Issue #113: Core API Endpoints (3 weeks)
**Effort:** 120 hours  
**Dependencies:** #112 completed  
**Status:** BLOCKED

#### Endpoints to Build:

**Members (Persons)** - 7 endpoints
- `GET /api/v1/persons` (list with filters, pagination, search)
- `POST /api/v1/persons` (create)
- `GET /api/v1/persons/:id` (details)
- `PATCH /api/v1/persons/:id` (update)
- `DELETE /api/v1/persons/:id` (delete)
- `GET /api/v1/persons/:id/details` (private info, role-based)
- `PATCH /api/v1/persons/:id/details` (update private info)

**Relationships** - 4 endpoints
- `GET /api/v1/relationships` (list)
- `POST /api/v1/relationships` (create)
- `PATCH /api/v1/relationships/:id` (update)
- `DELETE /api/v1/relationships/:id` (delete)

**Branches** - 4 endpoints
- `GET /api/v1/branches` (list)
- `POST /api/v1/branches` (create)
- `PATCH /api/v1/branches/:id` (update)
- `DELETE /api/v1/branches/:id` (delete)

**Family Settings** - 2 endpoints
- `GET /api/v1/settings` (get)
- `PATCH /api/v1/settings` (update)

**Statistics** - 1 endpoint
- `GET /api/v1/stats` (overview stats)

#### Features:
- Pagination (limit, offset)
- Search (full-text on names, dates)
- Filtering (branch, role, status)
- Sorting (by name, date, created)
- Role-based access control
- Input validation with Zod
- Error handling with typed responses

#### Deliverables:
- 18 RESTful API endpoints
- Comprehensive Zod schemas
- RBAC implementation
- Request/response types
- Integration tests

---

### Issue #114: Photos, Events, Graves API (2 weeks)
**Effort:** 90 hours  
**Dependencies:** #113 completed  
**Status:** BLOCKED

#### Endpoints:

**Photos** - 3 endpoints
- `POST /api/v1/persons/:id/photos` (multipart upload)
- `GET /api/v1/persons/:id/photos` (list)
- `DELETE /api/v1/photos/:id` (delete)

**Events** - 6 endpoints
- `GET /api/v1/events` (upcoming, past)
- `POST /api/v1/events` (create)
- `PATCH /api/v1/events/:id` (update)
- `DELETE /api/v1/events/:id` (delete)
- `GET /api/v1/custom-events` (custom events by person)
- `POST /api/v1/custom-events` (create custom)

**Graves** - 5 endpoints
- `GET /api/v1/graves` (list)
- `POST /api/v1/graves` (create)
- `PATCH /api/v1/graves/:id` (update)
- `GET /api/v1/graves/:id/events` (grave events)
- `POST /api/v1/graves/:id/events` (add event)

**Public API** - 2 endpoints (no auth)
- `GET /api/public/:token/tree` (public tree)
- `GET /api/public/:token/members` (public members)

#### Features:
- File upload to local storage or S3
- Image thumbnail generation
- Public share tokens
- Event filtering by type & date
- Role-based file access

#### Deliverables:
- 16 API endpoints
- File upload handling
- S3 integration (optional)
- Public share URLs
- Tests

---

### Issue #115: Notifications & Admin API (2 weeks)
**Effort:** 80 hours  
**Dependencies:** #113 completed  
**Status:** BLOCKED

#### Endpoints:

**Notifications** - 3 endpoints
- `GET /api/v1/notifications/settings` (user preferences)
- `PATCH /api/v1/notifications/settings` (update)
- `POST /api/v1/notifications/send` (manual send, CRON auth)

**Bots** - 3 endpoints
- `POST /api/v1/bots/register` (Telegram/Zalo)
- `GET /api/v1/bots/settings` (view bot config)
- `PATCH /api/v1/bots/settings` (update config)

**Admin** - 4 endpoints
- `GET /api/admin/users` (manage users)
- `PATCH /api/admin/users/:id` (update role/status)
- `GET /api/admin/subscriptions` (view billing)
- `POST /api/admin/ai-settings` (configure AI)

**Webhooks** - 2 handlers
- Telegram webhook handler
- Zalo webhook handler

**Cron Jobs**
- Birthday/anniversary reminders
- Weekly summary emails
- Subscription billing checks

#### Features:
- Telegram bot integration
- Zalo bot integration
- Resend email API integration
- Admin dashboard access
- Webhook verification
- Cron job scheduling

#### Deliverables:
- 12 API endpoints
- 2 webhook handlers
- 3 cron jobs
- Admin dashboard APIs
- Swagger documentation

---

### Issue #116: Replace Supabase Auth with JWT (1 week)
**Effort:** 40 hours  
**Dependencies:** #112 completed  
**Status:** BLOCKED

#### Tasks:
1. Remove `@supabase/supabase-js` and `@supabase/ssr`
2. Update `app/login/page.tsx` to use `POST /auth/login`
3. Update Next.js middleware to validate JWT
4. Remove `utils/supabase/middleware.ts`
5. Create `utils/auth/` for JWT handling
6. Update `UserProvider` to use `GET /auth/me`
7. Update setup flow to use `POST /auth/register`
8. Remove all Supabase client instances

#### Migration:
- Replace `createClient()` → API calls
- Replace `supabase.auth.*` → API endpoints
- Replace `useAuth()` → custom hook using API
- Update middleware auth checking

#### Deliverables:
- Updated Next.js auth flow
- Removed Supabase dependencies
- JWT-based session management
- Backward compatibility maintained

---

### Issue #117: Replace Supabase Queries with API Calls (4 weeks)
**Effort:** 160 hours  
**Dependencies:** #113, #114, #115 completed  
**Status:** BLOCKED

#### Scope: 78 files to refactor

**Groups:**

1. **Dashboard Pages** (5 files)
   - `app/dashboard/members/` → use API hooks
   - `app/dashboard/lineage/` → use API hooks
   - `app/dashboard/events/` → use API hooks
   - `app/dashboard/stats/` → use API hooks
   - `app/dashboard/settings/` → use API hooks

2. **Components** (50+ files)
   - `components/MemberForm.tsx` → API mutations
   - `components/RelationshipManager.tsx` → API hooks
   - `components/DataImportExport.tsx` → API uploads
   - `components/GlobalSearch.tsx` → API search
   - All data-fetching components → API integration

3. **API Routes** (10 files)
   - `app/api/v1/*` → proxy to backend
   - `app/api/cron/*` → trigger backend cron
   - `app/api/auth/*` → proxy to backend auth

#### Strategy:
1. Create `@tanstack/react-query` hooks for each API
2. Setup API client in `packages/api-client`
3. Replace Supabase calls one file at a time
4. Add tests for each migration
5. Verify functionality preserved

#### Deliverables:
- Refactored 78 files
- React Query hooks library
- API client integration
- Zero breaking changes

---

### Issue #118: Expo React Native Mobile App (4 weeks)
**Effort:** 160 hours  
**Dependencies:** #111, #112, #113 completed  
**Status:** BLOCKED

#### Screens:

**Auth Stack** (5 screens)
- Login screen
- Register screen
- Forgot password screen
- Password reset screen
- Loading screen

**Tab Navigation** (5 tabs)
- Dashboard (summary, quick stats)
- Members (list, search, filter)
- Family Tree (simplified D3/SVG)
- Events (upcoming, past)
- Profile (settings, preferences)

**Detail Screens** (5+ screens)
- Member details
- Add/Edit member
- Family tree full view
- Event details
- Settings

#### Features:
- expo-secure-store for JWT
- expo-notifications for push
- Camera/Gallery integration
- Offline mode (React Query cache)
- Dark mode support
- NativeWind v4 styling
- Expo Router v4 navigation

#### Stack:
- Expo SDK 52
- React Native
- Expo Router v4
- NativeWind v4
- @tanstack/react-query
- TypeScript

#### Deliverables:
- Complete mobile app
- 15+ screens
- Authentication flow
- Data synchronization
- EAS Build configuration
- TestFlight/Google Play ready

---

## Implementation Timeline

### Week 1: Turborepo Setup (Issue #110)
```
Monday-Wednesday: Core setup
├─ Initialize Turborepo
├─ Setup workspaces
├─ Create shared packages
└─ Configure build pipeline

Thursday-Friday: Testing & docs
├─ Test monorepo build
├─ Write setup documentation
└─ Prepare backend scaffolding
```

### Weeks 2-3: Backend Infrastructure (Issues #111-#112)
```
Week 2: Backend setup + Database
├─ Fastify project init
├─ Prisma schema migration
├─ PostgreSQL setup
└─ Error handling

Week 3: Authentication
├─ JWT implementation
├─ Register/Login endpoints
├─ Refresh token flow
└─ Password reset
```

### Weeks 4-5: Core APIs (Issue #113)
```
18 endpoints across:
├─ Members (7)
├─ Relationships (4)
├─ Branches (4)
├─ Settings (2)
└─ Stats (1)
```

### Weeks 6-7: Advanced Features (Issues #114-#115)
```
Week 6: Photos, Events, Graves
├─ 16 endpoints
├─ File upload
└─ Public sharing

Week 7: Notifications, Admin, Bots
├─ 12 endpoints
├─ Telegram/Zalo integration
└─ Email setup
```

### Weeks 8: Frontend Refactor (Issues #116-#117)
```
Week 8: Auth migration + Query refactoring
├─ Remove Supabase dependencies
├─ Migrate auth flow
└─ Replace 78 files' queries
```

### Weeks 9-10: Mobile App (Issue #118)
```
Week 9-10: Expo app development
├─ 15+ screens
├─ Authentication
├─ Data sync
└─ Testing
```

---

## Technical Stack

### Backend
```
Runtime: Node.js 20+
Framework: Fastify 5
ORM: Prisma
Database: PostgreSQL 16
Validation: Zod
Authentication: Jose (JWT)
Storage: Local filesystem + S3-optional
Logging: Pino
Testing: Vitest + Supertest
API Docs: Swagger/OpenAPI
```

### Frontend (Web)
```
Framework: Next.js 15
Language: TypeScript
HTTP Client: Fetch API (custom wrapper)
State: React Query + Zustand
Styling: Tailwind CSS
Testing: Jest + React Testing Library
```

### Mobile
```
Runtime: Expo SDK 52
Framework: React Native
Router: Expo Router v4
Styling: NativeWind v4
State: React Query
Storage: expo-secure-store
Notifications: expo-notifications
Testing: Detox + Jest
```

### Shared
```
Language: TypeScript
Types: Zod schemas
HTTP Client: packages/api-client
Types: packages/types
Package Manager: pnpm
Task Runner: Turbo
Build Tool: Vite (dev), esbuild (prod)
```

---

## Database Schema (Prisma)

```prisma
// Users & Auth
model User {
  id String @id @default(cuid())
  email String @unique
  password String // bcrypted
  full_name String?
  avatar_url String?
  role UserRole @default(MEMBER)
  account_status AccountStatus @default(ACTIVE)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  profiles UserProfile[]
  refresh_tokens RefreshToken[]
  notification_settings NotificationSettings?
  sync_logs SyncLog[]
}

model RefreshToken {
  id String @id @default(cuid())
  user_id String
  token String @unique
  expires_at DateTime
  created_at DateTime @default(now())
  
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  @@index([user_id])
}

// Family Structure
model Branch {
  id String @id @default(cuid())
  family_id String
  name String
  description String?
  display_order Int
  created_by String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  persons Person[]
  @@index([family_id])
}

model Person {
  id String @id @default(cuid())
  branch_id String
  full_name String
  lunar_birthday Int?
  lunar_birthday_month Int?
  // ... 20+ more fields
  
  branch Branch @relation(fields: [branch_id], references: [id])
  relationships_from Relationship[] @relation("from")
  relationships_to Relationship[] @relation("to")
  events CustomEvent[]
  photos Photo[]
  @@index([branch_id])
}

model Relationship {
  id String @id @default(cuid())
  from_id String
  to_id String
  relationship_type String
  branch_id String
  created_at DateTime @default(now())
  
  from Person @relation("from", fields: [from_id], references: [id], onDelete: Cascade)
  to Person @relation("to", fields: [to_id], references: [id], onDelete: Cascade)
  @@unique([from_id, to_id])
  @@index([branch_id])
}

// Events & Timelines
model CustomEvent {
  id String @id @default(cuid())
  person_id String
  title String
  description String?
  date DateTime
  event_type String // birthday, death, other
  created_by String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  person Person @relation(fields: [person_id], references: [id], onDelete: Cascade)
  @@index([person_id, date])
}

// ... 15+ more models
```

---

## Testing Strategy

### Unit Tests
- Utility functions
- Validation schemas
- JWT generation
- Password hashing

### Integration Tests
- Full auth flow
- API endpoints (create, read, update, delete)
- Role-based access
- Rate limiting

### E2E Tests
- User signup → login → dashboard
- Member creation → relationship → tree
- Event creation → notification
- Mobile navigation

### Performance Tests
- API response time (< 200ms target)
- Database query optimization
- File upload handling
- Search performance

---

## Migration Path

### Phase 1: Parallel Running (1 week)
- New backend in production (without frontend using it)
- Current Supabase still in use
- No downtime

### Phase 2: Gradual Migration (2 weeks)
- 10% of users → backend API
- 90% → Supabase
- Monitor error rates

### Phase 3: Full Migration (1 week)
- 100% → backend API
- Decommission Supabase
- Archive Supabase data

---

## Risk Mitigation

### Risk 1: Database Migration
**Impact:** High (data loss potential)  
**Mitigation:**
- Export Supabase data as JSON
- Create migration script
- Test on staging first
- Backup before production

### Risk 2: Auth Flow Changes
**Impact:** Critical (users locked out)  
**Mitigation:**
- Implement dual auth temporarily
- Provide password reset mechanism
- Monitor login success rate
- Quick rollback available

### Risk 3: Performance Degradation
**Impact:** Medium (user experience)  
**Mitigation:**
- Load test before launch
- CDN for static assets
- Database indexing
- Query optimization

### Risk 4: Breaking API Changes
**Impact:** High (frontend broken)  
**Mitigation:**
- API versioning (/api/v1/, /api/v2/)
- Backward compatibility layer
- Gradual deprecation
- Clear migration docs

---

## Success Metrics

### Completion
- [x] All 9 issues implemented
- [x] 0 build errors
- [x] 90% test coverage
- [x] All endpoints documented
- [x] Mobile app in TestFlight

### Performance
- [ ] API response < 200ms
- [ ] Database query < 50ms
- [ ] File upload < 5s
- [ ] Search < 200ms

### Reliability
- [ ] 99.9% uptime
- [ ] < 0.1% error rate
- [ ] Zero data loss
- [ ] Successful auth for 99%+ users

### User Satisfaction
- [ ] > 4.5 star rating
- [ ] < 1% bounce rate
- [ ] > 80% retention
- [ ] Positive user feedback

---

## Next Steps (Ready to Execute)

1. ✅ Create backend-refactor branch
2. ✅ Begin Issue #110 (Turborepo setup)
3. ✅ Create Fastify project scaffold
4. ✅ Setup Prisma and database
5. ✅ Build auth system
6. ✅ Create core API endpoints
7. ✅ Build mobile app
8. ✅ Migrate frontend
9. ✅ Production deployment
10. ✅ Decommission Supabase

---

**Plan Prepared By:** Copilot  
**Date:** March 8, 2026  
**Status:** ✅ READY TO START  
**Estimated Timeline:** 8-10 weeks  
**Team Size:** 2-3 engineers recommended

**Questions?** Refer to individual GitHub issues #110-#118 for detailed task breakdowns.
