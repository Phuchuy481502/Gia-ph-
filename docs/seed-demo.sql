-- ==========================================
-- GIAPHA-OS DEMO SEED DATA
-- ==========================================
-- Chạy SAU khi đã áp dụng schema.sql
-- Cột đúng theo docs/schema.sql:
--   family_settings: setting_key, setting_value
--   branches: id, name, description, display_order
--   persons: không có branch_id ở đây (thêm sau ALTER TABLE)
--   relationships: person_a, person_b, type (enum: marriage/biological_child/...)
--   announcements: title, content, is_pinned, expires_at
--   family_events: title, event_type (gio_ho|wedding|funeral|reunion|ceremony|other)
-- ==========================================

-- Demo family settings (public dashboard ON)
INSERT INTO public.family_settings (setting_key, setting_value) VALUES
  ('family_name',               'Họ Nguyễn - Demo'),
  ('family_description',        'Dữ liệu gia phả mẫu để trải nghiệm Gia Phả OS'),
  ('public_dashboard_enabled',  'true'),
  ('founding_year',             '1850'),
  ('origin_location',           'Ninh Bình, Việt Nam'),
  ('contact_email',             'demo@example.com'),
  ('site_locale',               'vi')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Demo branches (dòng họ)
-- branches: id, name, description, display_order (no is_main column)
INSERT INTO public.branches (id, name, description, display_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Chi Trưởng',   'Dòng trưởng họ Nguyễn', 1),
  ('00000000-0000-0000-0000-000000000002', 'Chi Thứ Hai',  'Dòng thứ hai họ Nguyễn', 2),
  ('00000000-0000-0000-0000-000000000003', 'Chi Thứ Ba',   'Dòng thứ ba họ Nguyễn', 3)
ON CONFLICT (id) DO NOTHING;

-- Demo persons (branch_id added via ALTER TABLE so column exists)
INSERT INTO public.persons (
  id, full_name, other_names, gender,
  birth_year, birth_month, birth_day,
  death_year, death_month, death_day,
  is_deceased, generation, birth_order, branch_id, note
) VALUES
  -- Đời 1
  ('10000000-0000-0000-0000-000000000001','Nguyễn Văn Tiên','Tiên Công','male',
   1850,NULL,NULL, 1920,NULL,NULL, true,1,1,'00000000-0000-0000-0000-000000000001','Ông tổ họ Nguyễn, gốc Ninh Bình'),
  ('10000000-0000-0000-0000-000000000002','Trần Thị Lan','Bà Tiên','female',
   1855,NULL,NULL, 1925,NULL,NULL, true,1,1,'00000000-0000-0000-0000-000000000001','Bà tổ, quê Hoa Lư, Ninh Bình'),
  -- Đời 2
  ('10000000-0000-0000-0000-000000000003','Nguyễn Văn Đức',NULL,'male',
   1880,3,NULL, 1950,NULL,NULL, true,2,1,'00000000-0000-0000-0000-000000000001','Trưởng chi trưởng'),
  ('10000000-0000-0000-0000-000000000004','Lê Thị Hoa',NULL,'female',
   1882,NULL,NULL, 1955,NULL,NULL, true,2,1,'00000000-0000-0000-0000-000000000001',NULL),
  ('10000000-0000-0000-0000-000000000005','Nguyễn Văn Tài',NULL,'male',
   1885,NULL,NULL, 1960,NULL,NULL, true,2,2,'00000000-0000-0000-0000-000000000002','Trưởng chi thứ'),
  -- Đời 3
  ('10000000-0000-0000-0000-000000000006','Nguyễn Văn Hùng',NULL,'male',
   1910,5,15, 1975,NULL,NULL, true,3,1,'00000000-0000-0000-0000-000000000001',NULL),
  ('10000000-0000-0000-0000-000000000007','Nguyễn Thị Mai',NULL,'female',
   1912,NULL,NULL, NULL,NULL,NULL, false,3,2,'00000000-0000-0000-0000-000000000001','Hiện sống tại Hà Nội'),
  ('10000000-0000-0000-0000-000000000008','Phạm Thị Thu',NULL,'female',
   1912,NULL,NULL, 1980,NULL,NULL, true,3,1,'00000000-0000-0000-0000-000000000001',NULL),
  -- Đời 4
  ('10000000-0000-0000-0000-000000000009','Nguyễn Văn Nam',NULL,'male',
   1940,8,20, 2010,3,15, true,4,1,'00000000-0000-0000-0000-000000000001',NULL),
  ('10000000-0000-0000-0000-000000000010','Nguyễn Thị Lan','Lan Anh','female',
   1942,NULL,NULL, NULL,NULL,NULL, false,4,2,'00000000-0000-0000-0000-000000000001',NULL),
  ('10000000-0000-0000-0000-000000000011','Hoàng Thị Bích',NULL,'female',
   1942,NULL,NULL, 2015,NULL,NULL, true,4,1,'00000000-0000-0000-0000-000000000001',NULL),
  -- Đời 5
  ('10000000-0000-0000-0000-000000000012','Nguyễn Minh Tuấn',NULL,'male',
   1970,12,18, NULL,NULL,NULL, false,5,1,'00000000-0000-0000-0000-000000000001','Kỹ sư phần mềm, Ninh Bình'),
  ('10000000-0000-0000-0000-000000000013','Nguyễn Thị Hương',NULL,'female',
   1973,NULL,NULL, NULL,NULL,NULL, false,5,2,'00000000-0000-0000-0000-000000000001',NULL),
  ('10000000-0000-0000-0000-000000000014','Trần Thị Ngọc',NULL,'female',
   1972,NULL,NULL, NULL,NULL,NULL, false,5,1,'00000000-0000-0000-0000-000000000001',NULL),
  -- Đời 6
  ('10000000-0000-0000-0000-000000000015','Nguyễn Minh Khoa',NULL,'male',
   2000,3,5, NULL,NULL,NULL, false,6,1,'00000000-0000-0000-0000-000000000001','Sinh viên đại học'),
  ('10000000-0000-0000-0000-000000000016','Nguyễn Thị Bảo Châu',NULL,'female',
   2003,7,12, NULL,NULL,NULL, false,6,2,'00000000-0000-0000-0000-000000000001','Học sinh THPT')
ON CONFLICT (id) DO NOTHING;

-- Quan hệ (person_a, person_b — KHÔNG phải person1_id/person2_id)
-- type: marriage | biological_child | adopted_child | step_parent | sibling | half_sibling | godparent
INSERT INTO public.relationships (person_a, person_b, type) VALUES
  -- Hôn nhân đời 1
  ('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','marriage'),
  -- Con đời 2 (person_a=con, person_b=cha/mẹ)
  ('10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','biological_child'),
  ('10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','biological_child'),
  -- Hôn nhân đời 2
  ('10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','marriage'),
  -- Con đời 3
  ('10000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000003','biological_child'),
  ('10000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000003','biological_child'),
  -- Hôn nhân đời 3
  ('10000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000008','marriage'),
  -- Con đời 4
  ('10000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000006','biological_child'),
  ('10000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000006','biological_child'),
  -- Hôn nhân đời 4
  ('10000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000011','marriage'),
  -- Con đời 5
  ('10000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000009','biological_child'),
  ('10000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000009','biological_child'),
  -- Hôn nhân đời 5
  ('10000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000014','marriage'),
  -- Con đời 6
  ('10000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000012','biological_child'),
  ('10000000-0000-0000-0000-000000000016','10000000-0000-0000-0000-000000000012','biological_child')
ON CONFLICT DO NOTHING;

-- Sự kiện gia đình (event_type: gio_ho|wedding|funeral|reunion|ceremony|other)
INSERT INTO public.family_events (title, description, event_date, event_type, is_public) VALUES
  ('Giỗ họ năm 2024',     'Giỗ ông tổ Nguyễn Văn Tiên',        '2024-03-15', 'gio_ho',   true),
  ('Họp mặt đầu xuân',    'Họp mặt gia đình Tết Giáp Thìn',    '2024-02-10', 'reunion',  true),
  ('Đám cưới Minh Khoa',  'Lễ kết hôn của Nguyễn Minh Khoa',   '2025-06-15', 'wedding',  true)
ON CONFLICT DO NOTHING;

-- Thông báo (announcements: title, content, is_pinned — KHÔNG có is_published/published_at)
INSERT INTO public.announcements (title, content, is_pinned) VALUES
  ('Chào mừng đến với Gia Phả OS!',
   'Đây là dữ liệu mẫu. Bạn có thể xem cây gia phả, danh sách thành viên và các tính năng khác.',
   true),
  ('Họp mặt gia đình tháng 2/2024',
   'Gia đình sẽ họp mặt ngày 10/2/2024 (Mùng 1 Tết Giáp Thìn) tại nhà thờ họ, Ninh Bình.',
   false)
ON CONFLICT DO NOTHING;
