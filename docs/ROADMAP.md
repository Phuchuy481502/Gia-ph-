# Giapha-OS — Lộ Trình Phát Triển (Roadmap)

> Cập nhật lần cuối: 2025 — Phản ánh trạng thái hiện tại sau khi hoàn thành các Phase 1–4.

---

## ✅ Đã Hoàn Thành

### Phase 0 — Nền Tảng (Stable)

| Tính Năng | Mô Tả |
|-----------|--------|
| **Quản Lý Thành Viên** | CRUD đầy đủ: tạo, xem, sửa, xoá; hỗ trợ avatar, ngày âm lịch, ghi chú, is_deceased, is_in_law, birth_order, generation |
| **Cây Gia Phả (Tree View)** | Hiển thị dạng cây phân cấp, hỗ trợ pan/zoom, filter (ẩn vợ/chồng, ẩn nam/nữ), toggle avatar |
| **Mindmap View** | Hiển thị dạng radial từ gốc |
| **List View** | Danh sách thành viên dạng bảng với tìm kiếm & lọc |
| **Quản Lý Quan Hệ** | Hôn nhân, con ruột, con nuôi, cha dượng/mẹ kế, anh chị em, anh chị em cùng cha/mẹ khác, cha đỡ đầu |
| **Tính Danh Xưng (Kinship)** | Tự động tính xưng hô tiếng Việt, hỗ trợ 9 cấp tổ tiên & 8 cấp con cháu |
| **Thống Kê Gia Đình** | Biểu đồ phân bố giới tính, thế hệ, độ tuổi |
| **Sự Kiện & Lịch** | Sinh nhật (dương lịch), giỗ (âm lịch), sự kiện tùy chỉnh; hiển thị 30 ngày tới trên Dashboard |
| **Xuất / Nhập Dữ Liệu** | JSON (full backup), GEDCOM (chuẩn quốc tế), CSV+ZIP |
| **Xác Thực & Phân Quyền** | Supabase Auth (email/password), 3 vai trò: Admin / Editor / Member; RLS policies |
| **Âm Lịch** | Chuyển đổi dương↔âm lịch cho ngày sinh nhật, ngày giỗ |

### Phase 1–4 — Hoàn Thiện & Mở Rộng (✅ Xong) — v1.0

Toàn bộ 22 issues Phase 1–4 đã merge. Xem Changelog.md.

### Phase 5 — Quản Lý Mồ Mả (✅ Xong) — v1.1

Issues #44–#49: Grave records, GPS map, photos, memorial page, reminders.

### Phase 6 — Hồ Sơ Mở Rộng & Bảo Mật (✅ Xong) — v1.2

Issues #57–#60: Thống kê nâng cao, hồ sơ cá nhân, bảo mật thông tin, quản lý chi/nhánh.

### Phase 7 — Public Dashboard (✅ Xong) — v1.3

Issue #74: Trang chủ công khai, thông báo ghim, dashboard nâng cao cho thành viên đăng nhập.

### Phase 8–10 — Auth, Invitations & Notifications (✅ Xong) — v1.4

| Issue | Tính Năng | PR |
|-------|-----------|-----|
| #65 | ✅ Admin Approval Workflow — duyệt/từ chối tài khoản, batch approve | #77 |
| #66 | 🪪 CCCD / National ID — lưu số căn cước, unique index | #76 |
| #61 | 📅 Family Events & Photos — CRUD sự kiện họ tộc, lọc theo chi | #78 |
| #62 | 📰 Activity Auto-Timeline — feed hoạt động tự động | #78 |
| #64 | 🔗 Invitation + Onboarding — link mời có nhánh/vai trò/hạn dùng | #79 |
| #63 | 📱 Telegram & Zalo Notifications — bot token, webhook, test | #80 |

---

## 🚧 Đang Lên Kế Hoạch / Chưa Triển Khai


### Issue #9 — Email Notifications (Priority: MEDIUM 🟡)

Gửi email nhắc nhở sinh nhật / giỗ qua Supabase Edge Functions.

**Yêu cầu:**
- Supabase Edge Function (Deno) + cron trigger
- Settings: bao nhiêu ngày trước, ai nhận thông báo
- Email provider (Resend/SendGrid) cần cấu hình bên ngoài
- Opt-in per user

**Ước lượng độ phức tạp:** Cao (cần Edge Functions, email provider, cron)

---

### Issue #17 — Đa Ngôn Ngữ (Priority: MEDIUM 🟡)

Hỗ trợ tiếng Anh và Hán-Nôm cho cộng đồng hải ngoại.

**Yêu cầu:**
- `next-intl` library
- Dịch toàn bộ UI (~200+ chuỗi)
- Hỗ trợ Hán-Nôm (phức tạp — font và keyboard input)
- Language switcher trong header

**Ước lượng độ phức tạp:** Cao (nhiều file cần cập nhật)

---

### Issue #20 — Map View (Priority: LOW 🟢)

Hiển thị gốc địa lý (quê quán, nơi sinh) trên bản đồ.

**Yêu cầu:**
- OpenStreetMap + Leaflet.js (hoặc react-leaflet)
- Geocoding quê quán → tọa độ
- Trang `/dashboard/map` với markers cho từng thành viên
- Lọc theo thế hệ/nhánh

**Ước lượng độ phức tạp:** Trung bình

---

## Ghi Chú Kỹ Thuật

- **Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase
- **RLS:** Mọi bảng mới cần RLS policies phù hợp với hệ thống vai trò (Admin/Editor/Member/anon)
- **Service Role Key:** `SUPABASE_SERVICE_ROLE_KEY` cần được cấu hình khi sử dụng REST API
- **PWA:** Service worker tại `public/sw.js`, manifest tại `public/manifest.json`
- **Dark Mode:** `@custom-variant dark` trong Tailwind CSS 4, anti-FOUC script trong `app/layout.tsx`
- **Audit Log:** Index trên `changed_at` và `person_id` để tránh chậm khi dữ liệu lớn
- **Photo Gallery:** Cần bật Supabase Storage bucket `person-photos`
- **Edge Functions:** Cần triển khai Supabase Edge Functions cho email notifications (#9)
