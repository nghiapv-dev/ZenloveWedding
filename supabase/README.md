# Supabase scripts

- `migrations/`: Scripts cần chạy trong Supabase SQL Editor khi khởi tạo hoặc bổ sung tính năng cho môi trường mới.
- `recovery/`: Script khôi phục dữ liệu nhạc cũ. Chỉ chạy khi cần sửa sự cố dữ liệu; không chạy trong quy trình triển khai bình thường.

Thứ tự tối thiểu khi tạo môi trường mới:

1. `supabase-templates-setup.sql`
2. `supabase-zenlove-sync-migration.sql`
3. `supabase-music-setup.sql`
4. `supabase-showcase-setup.sql`
5. Các script còn lại theo tính năng cần bật.
