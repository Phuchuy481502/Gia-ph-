#!/usr/bin/env node
/**
 * apply-schema.mjs — Áp dụng schema + seed demo vào Supabase
 *
 * Yêu cầu:  Node.js 18+  và  npm install postgres
 *
 * Cách dùng (chạy trên máy LOCAL, không chạy trong môi trường không có IPv6):
 *
 *   node scripts/apply-schema.mjs \
 *     "postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres" \
 *     [--seed]
 *
 *   # Hoặc qua biến môi trường:
 *   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
 *     node scripts/apply-schema.mjs --seed
 *
 *   # Sau đó tạo tài khoản demo:
 *   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> \
 *     node scripts/create-demo-user.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

const dbUrl = process.argv.find(a => a.startsWith('postgresql')) ?? process.env.DATABASE_URL
const withSeed = process.argv.includes('--seed')

if (!dbUrl) {
  console.error('❌  Thiếu DATABASE_URL.\n')
  console.error('Cách dùng:')
  console.error('  node scripts/apply-schema.mjs "postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres" [--seed]')
  process.exit(1)
}

let sql
try {
  const { default: postgres } = await import('postgres')
  sql = postgres(dbUrl, { ssl: 'require', max: 1, connect_timeout: 10 })
} catch {
  console.error('❌  Thiếu package "postgres". Chạy: npm install postgres')
  process.exit(1)
}

console.log('🔗  Đang kết nối...')
try {
  await sql`SELECT 1`
  console.log('✅  Kết nối thành công!\n')
} catch (e) {
  console.error('❌  Kết nối thất bại:', e.message)
  await sql.end()
  process.exit(1)
}

const schemaPath = join(__dir, '../docs/schema.sql')
console.log('📄  Áp dụng schema...')
try {
  await sql.unsafe(readFileSync(schemaPath, 'utf8'))
  console.log('✅  Schema áp dụng thành công!\n')
} catch (e) {
  console.error('❌  Lỗi schema:', e.message)
  await sql.end()
  process.exit(1)
}

if (withSeed) {
  const seedPath = join(__dir, '../docs/seed-demo.sql')
  console.log('🌱  Seed dữ liệu demo...')
  try {
    if (existsSync(seedPath)) {
      await sql.unsafe(readFileSync(seedPath, 'utf8'))
      console.log('✅  Seed hoàn tất! (6 thế hệ, 16 thành viên)\n')
    } else {
      console.log('⚠️   Không tìm thấy docs/seed-demo.sql\n')
    }
  } catch (e) {
    console.warn('⚠️   Lỗi seed (có thể dữ liệu đã tồn tại):', e.message)
  }
}

await sql.end()
console.log('🎉  Hoàn tất! Bước tiếp theo:')
console.log('   1. Chạy: node scripts/create-demo-user.mjs   (tạo tài khoản demo)')
console.log('   2. Truy cập: https://giapha-os-rose.vercel.app/login')
console.log('   3. Đăng nhập: demo@example.com / demo@123')
