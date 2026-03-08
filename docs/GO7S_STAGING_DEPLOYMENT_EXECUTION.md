# Go7s Staging Deployment - Complete Execution Guide

**Project:** Go7s News Portal (Vietnamese News Aggregation Platform)  
**Phase:** Phase 3 - Staging Deployment Execution  
**Status:** Ready to Begin  
**Estimated Timeline:** 6 days (Day 1-6)  
**Team:** DevOps + QA + Backend + Frontend  

---

## 🎯 Mission

Deploy Go7s News Portal to staging environment with full verification before production release.

---

## 📋 Pre-Deployment Requirements

### Repository Access
- GitHub: minhtuancn/start (main branch)
- Latest commit: Stable, all tests passing
- Build status: ✅ Green

### Infrastructure Requirements
- Staging database (separate from production)
- SSL certificate (HTTPS required)
- Environment variables (52 total)
- Third-party API keys (news APIs, CDN, analytics)

### Team Availability
- DevOps: 2 days
- QA: 3 days
- Backend: 1 day
- Frontend: 1 day

---

## 📊 Phase 3 Roadmap (6 Days)

### Day 1: Platform Selection & Setup

**Tasks:**
1. ✅ **go7s-platform-select** - Choose hosting platform
2. **go7s-env-config** - Configure 52 environment variables
3. **go7s-trigger-deploy** - Initial deployment

**Deliverables:**
- Staging environment created
- GitHub connected
- Environment variables configured
- Initial build/deploy successful

**Acceptance Criteria:**
- Staging URL accessible
- HTTPS working
- Build logs show success
- Status page shows "Deployed"

---

### Day 2: Initial Testing

**Tasks:**
1. **go7s-smoke-tests** - 5 critical tests
2. **go7s-security-check** - Security verification
3. **go7s-perf-audit** - Performance audit

**Deliverables:**
- Homepage loads
- CSS renders
- Security headers present
- Lighthouse score >85
- Response time <3s

**Acceptance Criteria:**
- All 5 smoke tests pass
- No security issues found
- Performance target met

---

### Day 3-4: Comprehensive Testing

**Tasks:**
1. **go7s-functional-test** - Navigate, search, categories, auth
2. **go7s-full-tests** - 117 unit tests
3. **go7s-monitor-logs** - Error monitoring setup

**Deliverables:**
- All features tested
- 117 unit tests pass
- Error monitoring configured
- Daily log review schedule

**Acceptance Criteria:**
- Zero critical bugs
- >85% test pass rate
- Error logs monitored

---

### Day 5-6: Final Approval

**Tasks:**
1. **go7s-final-approval** - Team sign-off
2. Prepare production deployment

**Deliverables:**
- Security audit complete
- Performance verified
- Team approval obtained
- Production deployment plan ready

**Acceptance Criteria:**
- All stakeholders sign-off
- No blockers remaining
- Ready for production

---

## 🚀 Day 1: Platform Selection & Setup

### Task 1: go7s-platform-select - Select Platform

**Options:**

| Platform | Pros | Cons | Recommended |
|----------|------|------|-------------|
| **Vercel** | Auto-deploys from GitHub, excellent performance, included CDN, best DX | Limited to Next.js, expensive at scale | ✅ RECOMMENDED |
| **Railway** | Simple UI, generous free tier, good for startups | Smaller community, less mature | Good alternative |
| **DigitalOcean** | Affordable, powerful, great docs | More setup required, manual monitoring | For experienced teams |
| **Render** | Good balance, auto-deploys, PostgreSQL included | Smaller ecosystem | Alternative |

**RECOMMENDATION: Use Vercel**

**Why Vercel:**
- Seamless Next.js deployment (Go7s is built with Next.js)
- Automatic deployments on push to main
- Built-in performance analytics
- Global CDN for fast content delivery
- Free tier sufficient for staging
- 1-click rollback if needed

### Setup Steps

**Step 1: Create Vercel Project**

1. Go to [vercel.com](https://vercel.com)
2. Sign up or login with GitHub account
3. Click "Add New..." → "Project"
4. Select "GitHub" as source
5. Import repository: `minhtuancn/start`
6. Click "Import"

**Step 2: Configure Project Settings**

1. **Project Name:** `go7s-staging`
2. **Framework:** Next.js (auto-detected)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `npm install` (default)

**Step 3: Environment Variables (52 total)**

See "Task 2: Configure Environment Variables" below

**Expected Time:** 10-15 minutes

**Success Indicators:**
- ✅ Project created in Vercel dashboard
- ✅ GitHub connected and authorized
- ✅ Main branch selected for deployment
- ✅ Environment variables form displayed

---

### Task 2: go7s-env-config - Configure Environment Variables

**52 Environment Variables Required:**

#### Core App Settings (5 variables)
```bash
APP_ENV=staging
APP_NAME=Go7s News Portal
APP_VERSION=1.0.0-beta
APP_URL=https://go7s-staging.vercel.app
APP_DEBUG=true
```

#### Database (5 variables)
```bash
DB_HOST=postgresql.staging.example.com
DB_PORT=5432
DB_NAME=go7s_staging
DB_USER=go7s_user
DB_PASS=<secure-password>
```

#### API Keys (15 variables)
```bash
NEWS_API_KEY=<from newsapi.org>
GUARDIAN_API_KEY=<from theguardian.com>
NYT_API_KEY=<from nyt.com>
BBC_API_KEY=<from bbc.com>
RAPIDNEWS_API_KEY=<from rapidapi.com>
# ... and 10 more for various news sources
```

#### Authentication (8 variables)
```bash
JWT_SECRET=<generate-random-64-chars>
JWT_EXPIRES_IN=7d
SESSION_SECRET=<generate-random-64-chars>
OAUTH_GITHUB_ID=<from github.com/settings>
OAUTH_GITHUB_SECRET=<secure>
OAUTH_GOOGLE_ID=<from google cloud console>
OAUTH_GOOGLE_SECRET=<secure>
ENCRYPTION_KEY=<generate-random-64-chars>
```

#### External Services (12 variables)
```bash
CLOUDFLARE_API_KEY=<api key>
CLOUDFLARE_ACCOUNT_ID=<account id>
SENDGRID_API_KEY=<api key>
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=staging
REDIS_URL=redis://staging.example.com:6379
ELASTICSEARCH_HOST=elasticsearch.staging.example.com
ELASTICSEARCH_PORT=9200
S3_BUCKET=go7s-staging-bucket
S3_REGION=ap-southeast-1
```

#### CORS & Security (5 variables)
```bash
CORS_ORIGIN=https://go7s-staging.vercel.app
ALLOWED_HOSTS=go7s-staging.vercel.app,admin.go7s-staging.vercel.app
CSRF_TOKEN_SECRET=<generate-random-32-chars>
X_API_KEY=<staging-api-key>
RATE_LIMIT_WINDOW=900000
```

#### Feature Flags (2 variables)
```bash
FEATURE_ADVANCED_SEARCH=true
FEATURE_USER_COMMENTS=false
```

### Configuration Steps

**Step 1: Collect All Variables**

Create a spreadsheet with:
- Variable name
- Value (or <placeholder> if sensitive)
- Source (e.g., newsapi.org)
- Responsible person
- Status (obtained / pending)

**Step 2: Enter in Vercel Dashboard**

1. Go to Project Settings → Environment Variables
2. For each variable:
   - Variable name (e.g., `DB_HOST`)
   - Value (e.g., `postgresql.staging.example.com`)
   - Environments: **Staging** (check only)
   - Click "Add"
3. After adding all 52 variables, scroll down and verify count

**Step 3: Verify All Variables Loaded**

After variables configured:
1. Go to "Deployments" tab
2. Trigger manual deployment
3. Check build logs for variable loading
4. Verify no "undefined" errors in logs

**Expected Time:** 30-45 minutes (first time), 10-15 minutes (subsequent)

**Success Indicators:**
- ✅ All 52 variables shown in dashboard
- ✅ Deployment builds successfully with variables
- ✅ No "undefined" or "missing variable" errors in logs
- ✅ Application starts without errors

---

### Task 3: go7s-trigger-deploy - Initial Deployment

**Deployment Methods:**

**Option A: GitHub Auto-Deploy (Recommended)**
1. Vercel is already connected to GitHub
2. Push any commit to `main` branch
3. Vercel automatically detects change
4. Automatic build and deploy starts
5. Check Deployments tab to monitor

```bash
git push origin main
# Vercel will automatically deploy within 30 seconds
```

**Option B: Vercel CLI Deploy**

```bash
npm install -g vercel
vercel --prod --env-file .env.staging
# Vercel CLI will prompt for environment variables
```

**Option C: Manual Vercel Dashboard Deploy**
1. Go to Vercel dashboard → Project
2. Click "Deployments" tab
3. Click "Redeploy" on latest commit
4. Click "Redeploy" button to confirm

### Monitoring Deployment

**During Build (3-5 minutes):**
1. Watch "Deployments" tab
2. Build progress shows in logs
3. Look for:
   - ✅ "Installing dependencies"
   - ✅ "Building application"
   - ✅ "Generating static pages"
   - ❌ NO TypeScript errors
   - ❌ NO build warnings

**After Build (2-3 minutes):**
1. Promotion to production (staging environment)
2. URL becomes active
3. CDN caches resources
4. Status should show "Ready"

**Expected Time:** 5-10 minutes total (build + deployment)

**Success Indicators:**
- ✅ "Deployment Successful" message shown
- ✅ Staging URL provided (e.g., go7s-staging.vercel.app)
- ✅ URL loads in browser (see below)
- ✅ No build errors in logs

### Verification (Manual)

```bash
# Test 1: Homepage loads
curl -I https://go7s-staging.vercel.app/
# Expected: HTTP 200, Content-Type: text/html

# Test 2: CSS loads
curl -I https://go7s-staging.vercel.app/_next/static/css/...
# Expected: HTTP 200, Content-Type: text/css

# Test 3: API endpoint works
curl https://go7s-staging.vercel.app/api/news
# Expected: HTTP 200, JSON response

# Test 4: HTTPS enforces
curl -I http://go7s-staging.vercel.app/
# Expected: HTTP 301 redirect to HTTPS
```

---

## ✅ End of Day 1 Checklist

**Required:**
- [ ] Platform selected (Vercel)
- [ ] Project created in Vercel
- [ ] 52 environment variables configured
- [ ] Initial deployment successful
- [ ] Staging URL accessible via HTTPS
- [ ] Basic homepage load verified

**Optional:**
- [ ] Team notified of staging URL
- [ ] Status page updated
- [ ] Slack notification sent

**Next Step:** Day 2 - Smoke tests and security checks

---

## 🧪 Day 2: Smoke Tests & Security

### Task 1: go7s-smoke-tests - 5 Critical Tests

**Purpose:** Verify core functionality is working

**Test 1: Homepage Loads (HTTP 200)**
```bash
curl -I https://go7s-staging.vercel.app/
# Expected: HTTP 200
# Check: Status line shows "200 OK"
```

**Test 2: CSS Renders (No Styling Issues)**
```bash
# Open https://go7s-staging.vercel.app/ in browser
# Check:
# - Logo visible
# - Navigation menu styled
# - Colors correct
# - Fonts loaded
# - Layout is responsive
```

**Test 3: Security Headers Present**
```bash
curl -I https://go7s-staging.vercel.app/
# Look for headers:
# - Content-Security-Policy: ✅
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Strict-Transport-Security: ✅
```

**Test 4: Database Responds**
```bash
# Check admin panel or API
curl https://go7s-staging.vercel.app/api/articles?limit=1
# Expected: HTTP 200, JSON with articles
# Check: Article count > 0
```

**Test 5: HTTPS Redirect**
```bash
curl -I http://go7s-staging.vercel.app/
# Expected: HTTP 301 or 307 redirect to HTTPS
# Check: Redirects to https://...
```

**Expected Time:** 15 minutes

**Pass Criteria:** All 5 tests ✅

---

### Task 2: go7s-security-check - Verify Security

**Check 1: HTTPS/TLS**
```bash
nslookup go7s-staging.vercel.app
# Should resolve to Vercel IP
openssl s_client -connect go7s-staging.vercel.app:443
# Should show valid certificate
```

**Check 2: Security Headers**
```bash
curl -v https://go7s-staging.vercel.app/ 2>&1 | grep -i "^<"
# Must have:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY or SAMEORIGIN
# - Content-Security-Policy: (configured)
# - Strict-Transport-Security: max-age=...
```

**Check 3: CORS Configuration**
```bash
curl -H "Origin: https://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -v https://go7s-staging.vercel.app/api/articles
# Check: CORS headers match .env CORS_ORIGIN
```

**Check 4: Rate Limiting**
```bash
# Send 101 requests in quick succession
for i in {1..101}; do
  curl -s https://go7s-staging.vercel.app/api/articles \
    -w "%{http_code}\n" -o /dev/null
done | tail -1
# Should show 429 (Too Many Requests) at some point
```

**Check 5: No Data Exposure**
```bash
# Check for:
# - No API keys in HTML source
# - No internal IPs exposed
# - No database credentials visible
# - No debug information in errors
curl https://go7s-staging.vercel.app/api/invalid
# Should return generic error, not stack trace
```

**Expected Time:** 10-15 minutes

**Pass Criteria:**
- ✅ HTTPS works
- ✅ Security headers present
- ✅ CORS correct
- ✅ Rate limiting works
- ✅ No data exposure

---

### Task 3: go7s-perf-audit - Performance Check

**Using Lighthouse (Google's Performance Tool):**

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://go7s-staging.vercel.app/articles \
  --view \
  --chromeFlags="--headless"
```

**Or use Vercel Analytics:**
1. Go to Vercel Dashboard → Project
2. Click "Analytics" tab
3. Check Core Web Vitals:
   - Largest Contentful Paint (LCP): < 2.5s ✅
   - First Input Delay (FID): < 100ms ✅
   - Cumulative Layout Shift (CLS): < 0.1 ✅

**Target Scores:**
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

**Check Page Load Time:**
```bash
curl -w "Total time: %{time_total}s\n" \
  https://go7s-staging.vercel.app/articles
# Target: < 3 seconds
```

**Check Search Performance:**
```bash
time curl "https://go7s-staging.vercel.app/api/articles?q=vietnam&limit=20"
# Target: < 200ms
```

**Expected Time:** 15-20 minutes

**Pass Criteria:**
- ✅ Lighthouse score > 85
- ✅ Page load < 3 seconds
- ✅ Search response < 200ms
- ✅ Core Web Vitals green

---

## 🎭 Day 3-4: Comprehensive Testing

### Task 1: go7s-functional-test (Day 3)

**Navigation Tests:**
- [ ] Homepage loads
- [ ] Main menu items clickable
- [ ] Category pages load
- [ ] Archive pages work
- [ ] Search page accessible

**Search Functionality:**
- [ ] Search box visible
- [ ] Can type search query
- [ ] Search returns results
- [ ] Results paginate
- [ ] Can click article from search

**Category Tests:**
- [ ] Each category shows articles
- [ ] Category count correct
- [ ] Filter works (by source, date)
- [ ] Sort works (by date, relevance)

**Authentication (if available):**
- [ ] Login form works
- [ ] Can create account
- [ ] Can logout
- [ ] Dashboard accessible after login
- [ ] Bookmarks save correctly

**Admin Panel:**
- [ ] Admin login works
- [ ] Can view all articles
- [ ] Can publish/unpublish
- [ ] Can manage categories
- [ ] Can view analytics

**Check for Errors:**
```bash
# Open browser console (F12 → Console tab)
# Check for:
# - No JavaScript errors (red messages)
# - No 404 errors in Network tab
# - No CORS errors
# - No authentication failures
```

**Expected Time:** 30-60 minutes

**Pass Criteria:**
- ✅ All main features working
- ✅ No broken links
- ✅ No console errors
- ✅ No missing images
- ✅ Mobile-friendly rendering

---

### Task 2: go7s-full-tests (Day 3-4)

**Run 117 Unit Tests:**

```bash
# Navigate to project directory
cd go7s-project

# Run tests
npm test

# Expected output:
# PASS  __tests__/api/articles.test.ts (12 tests)
# PASS  __tests__/api/categories.test.ts (8 tests)
# PASS  __tests__/utils/parser.test.ts (15 tests)
# PASS  __tests__/components/NewsCard.test.ts (8 tests)
# ... (more test files)
#
# Test Suites: 12 passed, 12 total
# Tests: 117 passed, 117 total
# Time: 45.3s
```

**Coverage Report:**
```bash
npm test -- --coverage
# Expected:
# Statements: > 80%
# Branches: > 75%
# Functions: > 80%
# Lines: > 80%
```

**Expected Time:** 20-30 minutes

**Pass Criteria:**
- ✅ All 117 tests pass
- ✅ Code coverage > 75%
- ✅ No test warnings
- ✅ Tests complete in < 1 minute

---

### Task 3: go7s-monitor-logs (Day 4)

**Set up Error Monitoring:**

**Option A: Sentry (Recommended)**
```bash
# Already in code (from newError tracking)
# Verify in dashboard:
# 1. Go to sentry.io
# 2. Login with team account
# 3. Select "go7s-staging" project
# 4. Check Issues tab
# 5. Should be empty (no errors)
```

**Option B: Vercel Error Tracking**
```bash
# Automatic in Vercel
# Check:
# 1. Vercel Dashboard → Project
# 2. Click "Monitoring" tab
# 3. View "Error Count"
# 4. Should be 0 or very low
```

**Create Monitoring Schedule:**
```markdown
# Daily Log Review (For Team Lead)
Time: 10:00 AM daily
Duration: 10 minutes
Actions:
1. Check Sentry dashboard
2. Review error logs
3. Check database performance
4. Check API response times
5. Report findings to team
```

**Expected Time:** 10-15 minutes setup

**Success Indicators:**
- ✅ Error monitoring configured
- ✅ Alerts set up (email/Slack)
- ✅ Team knows how to check logs
- ✅ Log review schedule published

---

## ✅ Day 4-5 Completion

**Checklist:**
- [ ] All smoke tests passed
- [ ] Security verification complete
- [ ] Performance targets met
- [ ] All 117 unit tests pass
- [ ] Error monitoring configured
- [ ] Team familiar with staging environment
- [ ] Daily log review schedule active

**Ready for:** Day 5-6 Final Approval

---

## 👥 Day 5-6: Final Approval

### Task: go7s-final-approval

**Team Reviews:**

1. **QA Lead Review** (30 min)
   - [ ] All tests documented
   - [ ] No critical bugs found
   - [ ] Performance acceptable
   - [ ] Security verified
   - [ ] User experience good

2. **Tech Lead Review** (30 min)
   - [ ] Code quality acceptable
   - [ ] Architecture sound
   - [ ] No technical debt blocking release
   - [ ] Monitoring adequate
   - [ ] Scalability considered

3. **Product Lead Review** (30 min)
   - [ ] Features complete
   - [ ] User feedback positive
   - [ ] Content quality good
   - [ ] UI/UX polished
   - [ ] Ready for users

4. **Security Lead Review** (30 min)
   - [ ] No security vulnerabilities found
   - [ ] HTTPS enforced
   - [ ] API keys secured
   - [ ] RLS/RBAC working
   - [ ] Compliant with requirements

5. **DevOps Lead Review** (30 min)
   - [ ] Infrastructure stable
   - [ ] Deployment process automated
   - [ ] Rollback procedures ready
   - [ ] Monitoring and alerting working
   - [ ] Disaster recovery plan documented

**Sign-Off Form:**

```markdown
## Go7s Staging Deployment Sign-Off

Date: March 13, 2026
Status: ✅ APPROVED FOR PRODUCTION

Team Members:
- [ ] QA Lead: __________________ Date: ____
- [ ] Tech Lead: ________________ Date: ____
- [ ] Product Lead: _____________ Date: ____
- [ ] Security Lead: ____________ Date: ____
- [ ] DevOps Lead: ______________ Date: ____

Approval Notes:
- All systems tested and verified
- No critical blockers remaining
- Ready for production deployment
- Rollback procedures documented and tested

Next Step: Production deployment scheduled for March 13, 2026
```

**Expected Time:** 2-3 hours (all reviews)

**Success Criteria:**
- ✅ All stakeholders approve
- ✅ Sign-off document completed
- ✅ No blockers for production
- ✅ Production deployment plan ready

---

## 📈 Success Metrics Summary

**By End of Day 6:**

| Metric | Target | Status |
|--------|--------|--------|
| Homepage loads | < 3s | ✅ |
| Search latency | < 200ms | ✅ |
| Lighthouse score | > 85 | ✅ |
| Security headers | All present | ✅ |
| Unit tests | 117/117 pass | ✅ |
| Code coverage | > 75% | ✅ |
| Error rate | 0 critical | ✅ |
| Uptime | 99.9% | ✅ |
| Team approval | All 5 leads | ✅ |

---

## 🚀 Next Phase: Production Deployment

Once Day 6 complete and all approvals obtained, schedule production deployment:

1. **Production Environment Setup** (1 day)
   - Create Vercel production project
   - Configure production database
   - Set production environment variables

2. **Production Deployment** (2-3 hours)
   - Merge staging → main (if not already)
   - Deploy to production
   - Run smoke tests on production
   - Monitor for 24 hours

3. **User Announcement**
   - Publish blog post
   - Send emails to beta testers
   - Update status page
   - Share on social media

---

**Status: Ready for Team Execution**  
**Estimated Completion: March 13, 2026**  
**Next Review: Daily standups at 10:00 AM**  

