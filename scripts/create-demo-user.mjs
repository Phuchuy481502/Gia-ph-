#!/usr/bin/env node
/**
 * create-demo-user.mjs — Tạo tài khoản demo qua Supabase Auth Admin API
 *
 * Chạy SAU khi đã áp dụng schema.sql:
 *
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=sb_secret_... \
 *   node scripts/create-demo-user.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://<your-project-ref>.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.error('❌  Thiếu SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const users = [
  {
    email: 'demo@example.com',
    password: 'demo@123',
    user_metadata: { full_name: 'Tài Khoản Demo', role: 'admin' },
    label: 'Demo Admin',
  },
  {
    email: 'minhtuan@giapha-os.com',
    password: 'admin@123',
    user_metadata: { full_name: 'Minh Tuấn', role: 'admin' },
    label: 'Minh Tuấn (Admin)',
  },
]

for (const u of users) {
  process.stdout.write(`👤  Tạo user "${u.label}" (${u.email})... `)

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: u.user_metadata,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    if (data.msg?.includes('already been registered') || data.code === 'email_exists') {
      console.log('⚠️  Đã tồn tại (bỏ qua)')
    } else {
      console.log(`❌  Lỗi: ${data.msg || JSON.stringify(data)}`)
    }
    continue
  }

  const userId = data.id

  // Update profile role to admin (profiles has no full_name column)
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ role: 'admin' }),
    }
  )

  if (profileRes.ok) {
    console.log(`✅  OK (id: ${userId.slice(0, 8)}...)`)
  } else {
    console.log(`✅  User tạo OK nhưng lỗi cập nhật profile: ${profileRes.status}`)
  }
}

console.log('\n📋  Tài khoản demo:')
console.log('   Email   : demo@example.com')
console.log('   Password: demo@123')
console.log('\n🔗  Đăng nhập tại: https://giapha-os-rose.vercel.app/login')
