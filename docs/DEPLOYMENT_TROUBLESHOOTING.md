# Giapha OS - Deployment & Troubleshooting Guide

**Version:** 1.0  
**Last Updated:** March 7, 2026  
**Status:** Production Ready

Complete troubleshooting guide for deployment issues, common problems, and solutions.

---

## Quick Reference

| Issue | Symptom | Solution |
|-------|---------|----------|
| API not responding | 500 errors | Check server logs, verify database connection |
| Auth token invalid | 401 Unauthorized | Refresh token using /auth/refresh endpoint |
| Rate limited | 429 Too Many Requests | Wait according to Retry-After header |
| Account suspended | 403 Forbidden | Contact support, check account_status in database |
| Sync data incomplete | Missing records | Verify role-based filtering, check RLS policies |
| Database connection fails | Connection refused | Verify Supabase credentials in .env |
| Notifications not received | Push tokens inactive | Re-register device in /notifications/tokens |

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured (.env.local)
- [ ] Database migrations run
- [ ] SSL certificate valid
- [ ] API rate limiting configured
- [ ] Monitoring alerts configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] Staging environment tested

### Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Run migrations
npm run migrate:latest

# 3. Verify JWT_SECRET and other secrets
echo "CHECKING SECRETS..."
test -n "$JWT_SECRET" && echo "✓ JWT_SECRET set" || echo "✗ JWT_SECRET missing"
test -n "$SUPABASE_SERVICE_ROLE_KEY" && echo "✓ Service role set" || echo "✗ Service role missing"
test -n "$CRON_SECRET" && echo "✓ Cron secret set" || echo "✗ Cron secret missing"

# 4. Build
npm run build

# 5. Start server
npm run start

# 6. Run smoke tests (see section below)
curl http://localhost:3000/api/health
```

### Post-Deployment

- [ ] Health check passing
- [ ] Smoke tests succeed
- [ ] Error tracking configured
- [ ] Performance metrics visible
- [ ] Log aggregation working
- [ ] User notification sent
- [ ] Monitor logs for 1 hour

---

## Troubleshooting by Error

### 401 Unauthorized Errors

**Symptoms:**
- All API requests return 401
- "Invalid token" or "Token expired" in response

**Causes:**
- Access token expired (need refresh)
- Refresh token invalid or expired (need re-login)
- JWT_SECRET changed (invalidates all tokens)
- Token malformed or corrupted

**Solutions:**

```bash
# 1. Check if token is expired
TOKEN="eyJhbGc..."
echo $TOKEN | cut -d. -f2 | base64 -d | jq .exp
# Compare with current time: date +%s

# 2. Verify JWT_SECRET is correct
echo $JWT_SECRET | wc -c  # Should be 32+ characters

# 3. Try refreshing token
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"your-refresh-token"}'

# 4. If refresh fails, user must re-login
# In your app, catch 401 and redirect to login
if (response.status === 401) {
  clearStorage('access_token', 'refresh_token');
  navigateTo('/login');
}
```

### 403 Forbidden Errors

**Symptoms:**
- "Access Denied" or "Permission Denied"
- User can login but cannot access data
- Role-based filtering not working

**Causes:**
- User role not set correctly in database
- Account suspended or inactive
- Missing RLS policy
- Branch-level access restriction

**Solutions:**

```bash
# 1. Check user role in database
SELECT id, email, role, account_status FROM users WHERE email = 'user@example.com';
# Verify: role should be 'admin', 'editor', or 'member'
# Verify: account_status should be 'active'

# 2. Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'persons';

# 3. For members, check if they can access public data
SELECT * FROM persons WHERE is_public = true LIMIT 1;

# 4. Check branch assignment for editors
SELECT * FROM user_branches WHERE user_id = 'user-id' LIMIT 1;

# 5. Enable RLS debugging (if available)
-- In Supabase SQL editor
SET pgrst.jwt_secret = 'test-secret';
SELECT * FROM persons;  -- Should show RLS in action
```

### 429 Rate Limit Errors

**Symptoms:**
- 429 Too Many Requests
- Retry-After header present in response
- Sync endpoint becomes unresponsive

**Causes:**
- Too many requests in 1-hour window (>100)
- Automated process making excessive requests
- Mobile app syncing too frequently
- Malicious bot attack

**Solutions:**

```bash
# 1. Check current rate limit status
# Current implementation: 100 requests/hour per user
# In app, track request count:
const requestCount = requestTimes.filter(t => now - t < 3600000).length;
console.log(`${requestCount}/100 requests used`);

# 2. Implement exponential backoff
function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    
    const tryRequest = () => {
      fn()
        .then(resolve)
        .catch(error => {
          if (error.status === 429 && attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`Rate limited. Retrying in ${delay}ms...`);
            setTimeout(tryRequest, delay);
            attempt++;
          } else {
            reject(error);
          }
        });
    };
    
    tryRequest();
  });
}

# 3. Reduce sync frequency in mobile app
// Instead of syncing every 30 seconds:
setInterval(() => sync(), 30 * 1000);

// Sync only when:
- App comes to foreground (useAppState)
- User manually refreshes
- Network connectivity changes
- 5 minutes have passed

# 4. Monitor rate limit usage
// Add to every sync response:
{
  "rate_limit_remaining": 95,
  "rate_limit_reset_at": "2026-03-07T18:08:32Z"
}
```

### 500 Internal Server Error

**Symptoms:**
- Generic "Internal Server Error" 500 response
- No detailed error message
- Happens randomly or consistently

**Causes:**
- Unhandled exception in route handler
- Database connection lost
- External API call failed
- Out of memory or resource exhaustion
- TypeScript/JavaScript runtime error

**Solutions:**

```bash
# 1. Check server logs
# In Next.js dev mode:
npm run dev  # Check console output

# In production:
tail -f logs/app.log | grep -i error

# 2. Enable detailed error logging
// In your route handler:
try {
  // ... code
} catch (error) {
  console.error('Detailed error:', {
    message: error.message,
    stack: error.stack,
    code: error.code,
    timestamp: new Date().toISOString()
  });
  
  return Response.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}

# 3. Check database connection
SELECT 1;  # In Supabase SQL editor

# 4. Monitor resource usage
ps aux | grep node  # Check memory/CPU
df -h  # Check disk space

# 5. Enable error tracking (Sentry example)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://xxx@xxx.ingest.sentry.io/xxx'
});

try {
  // ... code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### "Cannot find column" Errors

**Symptoms:**
- "column \"user_role\" does not exist"
- "column \"branch\" does not exist"
- Database schema mismatch

**Causes:**
- Code references wrong column name
- Migration not run
- Database schema outdated

**Solutions:**

```bash
# 1. Verify column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

# 2. Check migrations applied
SELECT version FROM migrations ORDER BY version DESC LIMIT 1;

# 3. Run pending migrations
npm run migrate:latest

# 4. Verify schema against code
# In your route handler, log actual columns:
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(1);

console.log('Available columns:', Object.keys(data[0]));

# 5. Fix common naming issues
// ❌ Wrong:
.select('user_role')  // Column doesn't exist

// ✓ Correct:
.select('role')  // Actual column name
```

### Connection Refused / Cannot Reach API

**Symptoms:**
- "ECONNREFUSED"
- "Network request failed"
- "Cannot reach http://localhost:3000"

**Causes:**
- Server not running
- Wrong URL/port
- Firewall blocking
- DNS resolution failed
- CORS configuration

**Solutions:**

```bash
# 1. Verify server is running
curl http://localhost:3000  # Should get response
# or
lsof -i :3000  # Check port 3000 is open

# 2. Check environment variables
echo $NEXT_PUBLIC_API_URL
echo $API_BASE_URL

# 3. Verify network connectivity
ping -c 1 google.com  # Check internet
curl -v http://localhost:3000/api/health  # Verbose output

# 4. Check CORS headers (if calling from browser)
curl -i http://localhost:3000/api/v1/sync
# Should have: Access-Control-Allow-Origin: *

# 5. Verify correct URL format
// ❌ Wrong:
fetch('http://localhost:3000/api/sync')

// ✓ Correct:
fetch('http://localhost:3000/api/v1/sync')

# 6. Start server explicitly
npm run dev  # For development
npm run build && npm run start  # For production

# 7. Check firewall rules
# macOS: System Preferences → Security & Privacy → Firewall
# Linux: sudo ufw status
# Windows: Windows Defender Firewall
```

### Database Timeout / Slow Queries

**Symptoms:**
- Queries take >5 seconds
- "Query timeout" errors
- "Deadlock detected"

**Causes:**
- Large dataset being fetched
- Missing database index
- Lock contention
- Inefficient query

**Solutions:**

```bash
# 1. Identify slow queries
-- In Supabase, enable query logging:
SELECT query_time, query FROM pg_stat_statements 
ORDER BY query_time DESC LIMIT 10;

# 2. Add indexes for common queries
CREATE INDEX idx_persons_branch_id ON persons(branch_id);
CREATE INDEX idx_persons_updated_at ON persons(updated_at);
CREATE INDEX idx_users_role ON users(role);

# 3. Optimize queries
// ❌ Slow: Fetch all data then filter
const { data: allPersons } = await supabase
  .from('persons')
  .select('*');
const filtered = allPersons.filter(p => p.branch_id === 'xxx');

// ✓ Fast: Filter in database query
const { data: filtered } = await supabase
  .from('persons')
  .select('*')
  .eq('branch_id', 'xxx');

# 4. Use pagination for large result sets
// ❌ Slow: Fetch 10,000 rows
.select('*').limit(10000)

// ✓ Fast: Use pagination
.select('*').limit(100).offset(page * 100)

# 5. Monitor connection pool
-- Check active connections:
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

# 6. Set reasonable timeouts
fetch(url, { timeout: 10000 })  // 10 second timeout
```

---

## Performance Tuning

### Response Time Targets

| Endpoint | Target | Acceptable | Critical |
|----------|--------|-----------|----------|
| /auth/login | <200ms | <500ms | >1000ms |
| /auth/refresh | <100ms | <300ms | >500ms |
| /sync | <500ms | <2000ms | >5000ms |
| /notifications/tokens | <200ms | <500ms | >1000ms |

### Optimization Strategies

```typescript
// 1. Use query select to limit fields
// ❌ Fetches all 50 columns
.select('*')

// ✓ Fetches only needed fields
.select('id, name, email')

// 2. Use RLS for automatic filtering
// ❌ Fetch all, filter in code
const all = await supabase.from('persons').select('*');
const filtered = all.filter(p => p.is_public || p.created_by === userId);

// ✓ RLS filters automatically
const filtered = await supabase.from('persons').select('*');

// 3. Cache frequently accessed data
const cache = new Map<string, CacheEntry>();

function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < 60000) {  // 1 minute
    return entry.value;
  }
  cache.delete(key);
  return null;
}

function cacheSet<T>(key: string, value: T): void {
  cache.set(key, { value, timestamp: Date.now() });
}

// 4. Use batch operations for sync
// ❌ Update one at a time (N queries)
for (const person of persons) {
  await supabase.from('persons').update(person).eq('id', person.id);
}

// ✓ Batch update (1 query)
await supabase.from('persons').upsert(persons);
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

```typescript
// 1. API Response Time
// Track in your monitoring system:
{
  endpoint: '/api/v1/sync',
  responseTime: 234,  // milliseconds
  statusCode: 200,
  timestamp: new Date().toISOString()
}

// 2. Error Rate
// Alert if > 1% of requests fail:
errorRate = (errorCount / totalRequests) * 100

// 3. Rate Limit Hits
// Alert if > 10% of users hit rate limit:
rateLimitHits = (rateLimitedRequests / totalRequests) * 100

// 4. Authentication Failures
// Alert if > 5% of logins fail:
loginFailureRate = (failedLogins / totalLogins) * 100

// 5. Database Performance
// Alert if queries > 1 second:
queryTime > 1000ms
```

### Example Monitoring Setup (Datadog)

```typescript
import { StatsD } from 'node-statsd';

const statsd = new StatsD();

// In your route handler:
const startTime = Date.now();

try {
  const response = await supabase
    .from('persons')
    .select('*');
  
  const duration = Date.now() - startTime;
  
  statsd.timing('api.response_time', duration);
  statsd.increment('api.requests.success');
  
} catch (error) {
  const duration = Date.now() - startTime;
  
  statsd.timing('api.response_time', duration);
  statsd.increment('api.requests.error');
  statsd.gauge('api.error_count', 1);
  
  throw error;
}
```

---

## Rollback Plan

If issues occur after deployment:

### Immediate Actions (1-5 minutes)

```bash
# 1. Check if issue is widespread
curl https://api.giapha-os.app/api/health

# 2. Check error tracking for error spike
# Review Sentry/error logs for patterns

# 3. Determine if rollback needed
# If error rate > 5% or critical service down → ROLLBACK
```

### Execute Rollback (5-10 minutes)

```bash
# 1. Identify last known good commit
git log --oneline | head -5

# 2. Revert to previous version
git revert HEAD
# or
git reset --hard <previous-commit>

# 3. Deploy rollback version
git push origin main
# Vercel/staging platform will auto-deploy

# 4. Verify rollback successful
curl https://api.giapha-os.app/api/health
# Run smoke tests
npm run test:smoke

# 5. Notify users if necessary
# Send notification: "We detected an issue and rolled back. Service restored."
```

### Post-Rollback Analysis

```bash
# 1. Gather logs
# Review error logs, check for patterns

# 2. Identify root cause
# Was it code? Database? External service?

# 3. Fix in dev environment
# Create fix branch: git checkout -b fix/issue-name
# Make changes
# Run full test suite

# 4. Deploy fix
# Create PR for review
# Merge after approval
# Deploy to staging first

# 5. Document incident
# Add to INCIDENTS.md log
```

---

## Health Checks & Monitoring Scripts

```bash
#!/bin/bash
# health-check.sh - Monitor API health

API_URL="https://api.giapha-os.app"
ALERT_EMAIL="ops@giapha-os.app"

# Check API responds
if ! curl -f $API_URL/api/health > /dev/null 2>&1; then
  echo "CRITICAL: API not responding"
  # Send alert
  mail -s "API Health Alert" $ALERT_EMAIL << EOF
API Health Check Failed
API URL: $API_URL
Time: $(date)
Status: CRITICAL
EOF
  exit 1
fi

# Check auth endpoint
if ! curl -f -X POST $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' > /dev/null 2>&1; then
  echo "WARNING: Auth endpoint not responding"
fi

# Check sync endpoint (requires valid token)
TOKEN=$(get_test_token)
if ! curl -f -X GET "$API_URL/api/v1/sync?since=2026-03-01T00:00:00Z" \
  -H "Authorization: Bearer $TOKEN" > /dev/null 2>&1; then
  echo "WARNING: Sync endpoint not responding"
fi

echo "Health check passed at $(date)"
```

Run periodically:
```bash
# Add to crontab
*/5 * * * * /path/to/health-check.sh
```

---

## Common Fixes

### Fix #1: Clear Stale Tokens

```sql
-- Clear refresh tokens older than 7 days
DELETE FROM refresh_tokens 
WHERE created_at < NOW() - INTERVAL '7 days';

-- Clear expired notification tokens
DELETE FROM notification_tokens 
WHERE last_used_at < NOW() - INTERVAL '30 days';
```

### Fix #2: Reset Rate Limiter (In-Memory)

```typescript
// If using in-memory rate limiter that gets stale:
syncLimiters.clear();  // Clear all rate limit entries

// Or selective reset:
syncLimiters.delete('user-id-here');  // Reset for specific user
```

### Fix #3: Rebuild Search Indexes

```sql
-- Rebuild full-text search index
REINDEX INDEX idx_persons_full_text_search;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY persons_by_family;
```

### Fix #4: Force Sync of Family Data

```sql
-- Update all persons' updated_at to current time
UPDATE persons SET updated_at = NOW() WHERE family_id = 'family-id';

-- This forces all clients to re-sync
```

---

## Emergency Contacts

- **On-Call Engineer:** ops-on-call@giapha-os.app
- **DevOps Lead:** devops@giapha-os.app
- **Security Team:** security@giapha-os.app

---

**Last Updated:** March 7, 2026  
**Version:** 1.0  
**Maintainer:** DevOps Team
