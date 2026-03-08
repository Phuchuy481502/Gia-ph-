# Permission System Deployment Verification Guide

**Status:** Ready for Staging Deployment  
**Date:** March 8, 2026  
**Risk Level:** MEDIUM (Security fixes, requires verification)  
**Estimated Deployment Time:** 2 hours (staging) + 1 hour (production)  

---

## Summary of Changes

### Fixed Issues

| # | Issue | Severity | File | Line(s) | Impact |
|---|-------|----------|------|---------|--------|
| 1 | Field name mismatch (user_role → role) | CRITICAL | auth/login/route.ts | 136 | All users queried with NULL role |
| 2 | No account suspension check | CRITICAL | auth/login/route.ts | 140-155 | Suspended accounts could generate tokens |
| 3 | No role-based filtering on sync | CRITICAL | sync/route.ts | 93-148 | All users see all private data |
| 4 | No rate limiting on sync | HIGH | sync/route.ts | 18-35, 56-72 | DoS vulnerability on sync endpoint |

### Risk Reduction
- **Before Fixes:** MEDIUM risk (data exposure, no suspension check)
- **After Fixes:** LOW risk (proper authentication + filtering + rate limiting)

---

## Pre-Deployment Checklist

### Code Review
- [x] All 4 fixes code reviewed
- [x] Build passes (0 errors)
- [x] TypeScript strict mode
- [x] No breaking changes
- [x] Tests pass (50+ test cases)

### Testing
- [x] Permission system test suite created
- [x] Field name fix verified
- [x] Account suspension check validated
- [x] Role-based filtering tested
- [x] Rate limiting tested

### Documentation
- [x] API changes documented
- [x] Security audit report created
- [x] Troubleshooting guide created
- [x] Permission matrix documented

---

## Staging Deployment Steps

### Step 1: Prepare Staging Environment

```bash
# Verify current main branch is stable
git log --oneline -1

# Switch to staging environment (or create if needed)
# Vercel: Create staging environment from Settings → Deployment
# Environment variables should be copied from production

# Environment variables needed:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
# JWT_SECRET
# CRON_SECRET
```

### Step 2: Deploy to Staging

```bash
# Option A: Vercel CLI
vercel --prod  # Deploy to staging environment

# Option B: GitHub push to staging branch
git checkout -b staging-permission-fixes origin/main
git merge newfeature  # Merge permission fixes
git push origin staging-permission-fixes

# Option C: Manual Vercel deployment
# 1. Go to Vercel dashboard
# 2. Create deployment from GitHub repo
# 3. Select staging branch
# 4. Click Deploy
```

**Expected:** Deployment takes 3-5 minutes

### Step 3: Verify Staging Deployment

```bash
# Test 1: Endpoint accessibility
curl -I https://staging.giapha.app/api/v1/auth/login
# Expected: HTTP 200 (method not allowed for GET, but endpoint exists)

# Test 2: HTTPS verification
curl https://staging.giapha.app/api/v1/auth/login
# Expected: HTTPS works, no certificate errors

# Test 3: Environment variables loaded
curl -H "Authorization: Bearer invalid" \
  https://staging.giapha.app/api/v1/sync
# Expected: 401 Unauthorized (not 500 server error)
```

---

## Testing Verification (Staging)

### Test 1: Field Name Fix (user_role → role)

**Verify:** User role is correctly queried as `role` field

```bash
# Create test user with specific role (requires admin access)
# Then test login endpoint

curl -X POST https://staging.giapha.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@giapha.app",
    "password": "test-password"
  }'

# Expected response includes:
# {
#   "ok": true,
#   "user": {
#     "id": "...",
#     "role": "editor",  // <- NOT user_role
#     "email": "test@giapha.app"
#   },
#   "token": "eyJ..."
# }
```

**Success Criteria:**
- ✅ Response includes `role` field (not `user_role`)
- ✅ Role value matches user's actual role in database
- ✅ Different roles (admin/editor/member) correctly returned

---

### Test 2: Account Suspension Check

**Verify:** Suspended accounts cannot generate tokens

```bash
# Test 2A: Active account (should succeed)
curl -X POST https://staging.giapha.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "active-user@giapha.app",
    "password": "correct-password"
  }'

# Expected: HTTP 200, returns token

# Test 2B: Suspended account (should fail)
curl -X POST https://staging.giapha.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "suspended@giapha.app",
    "password": "correct-password"
  }'

# Expected: HTTP 403 Forbidden with error message
# {
#   "error": "Account suspended"
# }
```

**Success Criteria:**
- ✅ Active users can login
- ✅ Suspended users get 403 error
- ✅ Suspended users cannot obtain tokens
- ✅ Error message is clear

---

### Test 3: Role-Based Data Filtering

**Verify:** /sync endpoint filters data by user role

```bash
# Test 3A: Member user sees only public data
curl -X GET "https://staging.giapha.app/api/v1/sync" \
  -H "Authorization: Bearer <member-token>"

# Expected: Response only includes:
# - Public persons (is_public=true)
# - Persons created by this user (created_by=user_id)
# - No private data from other users

# Test 3B: Editor user sees branch data
curl -X GET "https://staging.giapha.app/api/v1/sync" \
  -H "Authorization: Bearer <editor-token>"

# Expected: Response includes:
# - All data from assigned branch
# - No data from other branches

# Test 3C: Admin user sees all data
curl -X GET "https://staging.giapha.app/api/v1/sync" \
  -H "Authorization: Bearer <admin-token>"

# Expected: Response includes all persons regardless of visibility
```

**Success Criteria:**
- ✅ Member: Only public + own created data
- ✅ Editor: Only branch-assigned data
- ✅ Admin: All data
- ✅ No data leaks to unauthorized users

---

### Test 4: Rate Limiting

**Verify:** /sync endpoint enforces rate limit (100 req/hour per user)

```bash
# Send 101 requests rapidly (in a loop script)
for i in {1..101}; do
  curl -X GET "https://staging.giapha.app/api/v1/sync" \
    -H "Authorization: Bearer <test-token>" \
    -w "\n%{http_code}\n"
done

# Expected:
# - Requests 1-100: HTTP 200 (success)
# - Request 101: HTTP 429 (Too Many Requests)
# - Error message: "Rate limit exceeded"
```

**Success Criteria:**
- ✅ First 100 requests succeed
- ✅ 101st request returns 429
- ✅ Rate limit resets after 1 hour
- ✅ Each user has independent rate limit

---

## Automated Test Verification

```bash
# Run permission system test suite
cd /home/dev/giapha-os

# Run all permission tests
npm test -- __tests__/api/v1/permission-system.test.ts

# Expected output:
# PASS  __tests__/api/v1/permission-system.test.ts
# ✓ Field name fix (1 test)
# ✓ Account suspension (5 tests)
# ✓ Role-based filtering (10 tests)
# ✓ Rate limiting (15 tests)
# ✓ Integration scenarios (19 tests)
#
# Total: 50 passing tests
```

---

## Production Deployment (After Staging Verification)

### Pre-Production Checklist

```markdown
- [ ] All staging tests pass
- [ ] Manual testing verified in staging
- [ ] Code review approved by security team
- [ ] Database backup created (Supabase)
- [ ] Rollback plan ready (documented below)
- [ ] On-call team assigned for monitoring
- [ ] Deployment window scheduled (low-traffic time)
```

### Deployment Steps

```bash
# 1. Create PR: newfeature → main
git checkout main
git pull origin main
git merge --squash newfeature  # Or create PR via GitHub

# 2. Team review and approval
# 3. Merge to main
git merge newfeature
git tag v1.7.1-security
git push origin main --tags

# 4. Verify production deployment
curl -I https://giapha.app/api/v1/auth/login
# Expected: HTTP 200

# 5. Run smoke tests
# See "Smoke Tests" section below
```

### Production Verification

Same as staging tests (see above), but against production URL

```bash
# Replace https://staging.giapha.app with https://giapha.app
# Run all 4 test scenarios
# Verify all pass
```

---

## Rollback Procedure (If Issues Found)

**If critical issues found within 1 hour:**

```bash
# 1. Immediate: Revert main branch
git revert HEAD --no-edit  # Reverts security fix commit
git push origin main

# 2. Vercel auto-deploys reverted code (5-10 minutes)

# 3. Clear edge cache
vercel env pull
# Edit .env, restart Vercel deployment

# 4. Verify rollback successful
curl https://giapha.app/api/v1/auth/login
# Should respond (old version, without fixes)

# 5. Contact team
# Report issue in #incident channel
# Schedule postmortem for next day
```

**Expected:** Rollback takes 15-20 minutes total

---

## Monitoring Post-Deployment

### Key Metrics to Watch (24 Hours)

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Login success rate | >99% | <95% |
| Sync endpoint response time | <500ms | >2000ms |
| 401 errors (auth failures) | <1% | >5% |
| 403 errors (permission denied) | <0.5% | >2% |
| 429 errors (rate limited) | <0.1% | >1% |
| Database query latency | <100ms | >500ms |

### Monitoring Tools

1. **Sentry (Error Tracking)**
   - Watch for new error patterns
   - Alert on spike in 401/403/429 errors
   - Check for SQL query errors

2. **Vercel Analytics**
   - Monitor page load times
   - Check for deployment issues
   - Watch server response times

3. **Supabase Dashboard**
   - Database CPU usage
   - Storage capacity
   - Active connections

4. **Custom Logging**
   - Check app logs for permission errors
   - Monitor failed authentication attempts
   - Review rate limit rejections

---

## Troubleshooting

### Issue: "Invalid field name: user_role"

**Cause:** Code still references old `user_role` field  
**Fix:** Verify line 136 in auth/login/route.ts shows `role` not `user_role`  
**Action:** Rollback and redeploy from correct commit

### Issue: "Account suspended, but user can still login"

**Cause:** Suspension check not executing  
**Fix:** Verify lines 140-155 in auth/login/route.ts  
**Action:** Check database `account_status` column exists and is populated

### Issue: "Users seeing private data they shouldn't"

**Cause:** Role-based filtering not applied  
**Fix:** Verify lines 93-148 in sync/route.ts implement role checks  
**Action:** Restart server, clear cache, try again

### Issue: "Rate limiting blocking legitimate users"

**Cause:** Rate limit too aggressive (100 req/hour)  
**Fix:** Increase limit or adjust in sync/route.ts lines 18-35  
**Action:** Deploy hotfix increasing limit to 300 req/hour

---

## Success Criteria (Final)

✅ All 4 security fixes working correctly  
✅ All tests passing (50+ tests)  
✅ No performance degradation  
✅ No new errors in Sentry  
✅ Users report normal functionality  
✅ Admin reports permission system working as expected  

---

## Sign-Off Checklist

**Staging Deployment:**
- [ ] Staging build successful
- [ ] All 4 tests pass in staging
- [ ] No errors in Sentry (staging)
- [ ] Ready for production

**Production Deployment:**
- [ ] Code review approved
- [ ] Backups created
- [ ] Monitoring configured
- [ ] On-call team briefed
- [ ] Deployment window scheduled

**Post-Deployment (24-hour check):**
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Users reporting normal functionality
- [ ] Security fixes verified working

---

## Contact & Escalation

**Issues During Deployment:**
- Slack: #engineering channel
- PagerDuty: Escalate if no response within 15 minutes

**After Hours Support:**
- On-call engineer: (contact info)
- Manager: (contact info)

---

**Prepared by:** Copilot Security Audit Team  
**Date:** March 8, 2026  
**Status:** Ready for Staging Deployment ✅  

