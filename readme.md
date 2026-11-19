# Apple.com Clone — ReactJS + NodeJS + MySQL

Bản clone trang chủ https://www.apple.com/ (nội dung lấy ngày 19/11/2026).
Toàn bộ nội dung (menu, hero, promo tile, carousel, footer) được lưu trong **MySQL** và trả về qua **API NodeJS**, **ReactJS** chỉ render.

| Tầng      | Công nghệ                                 | Cổng   |
|-----------|-------------------------------------------|--------|
| Frontend  | React 19 + Vite 8 (CSS thuần, không UI lib) | `5173` |
| Backend   | Node 20 + Express 5 + mysql2              | `4000` |
| Database  | MySQL 8.0 chạy trong Docker (`apple-mysql`) | `3306` |

> Cổng 5000 trên macOS bị AirPlay Receiver chiếm, nên backend dùng cổng **4000**.

## Chạy nhanh

```bash
npm run setup      # cài dependencies (root + backend + frontend) — chỉ lần đầu
npm run db:up      # bật MySQL trong Docker (docker compose)
npm run db:init    # tạo database + bảng + seed dữ liệu (chạy lại = reset dữ liệu)
npm run dev        # chạy đồng thời API (4000) và web (5173)
```

Mở http://localhost:5173

Dừng DB: `npm run db:down` · Build FE: `npm run build` (ra `frontend/dist`).

## Cấu trúc thư mục

```
vibe_code/
├── docker-compose.yml          # MySQL 8 (container apple-mysql, volume apple_mysql_data)
├── package.json                # script tiện ích chạy cả dự án
├── backend/
│   ├── .env                    # cấu hình DB/PORT (copy từ .env.example)
│   ├── sql/schema.sql          # định nghĩa bảng (DROP + CREATE)
│   ├── sql/seed.sql            # dữ liệu trang chủ Apple
│   ├── scripts/initDb.js       # tạo DB + chạy schema + seed (có retry chờ MySQL)
│   └── src/
│       ├── server.js           # entry, listen PORT
│       ├── app.js              # express app, mount routes
│       ├── config.js / db.js   # env + mysql2 pool
│       ├── services/content.js # query + gom dữ liệu (nav, sections, carousel, footer)
│       ├── routes/content.js   # GET /api/home, /nav, /carousel, /footer
│       ├── routes/sections.js  # CRUD /api/sections
│       └── middleware/errorHandler.js
└── frontend/
    ├── vite.config.js          # proxy /api -> http://localhost:4000
    └── src/
        ├── App.jsx             # bố cục trang
        ├── api.js, hooks/useHomeData.js
        ├── styles/global.css   # biến màu, font, button pill
        └── components/
            ├── GlobalNav       # thanh menu + flyout (hover) + search/bag + menu mobile
            ├── Section         # hero full-width & promo tile (light/dark/gradient)
            ├── EntertainmentCarousel  # slider Apple TV (autoplay, dots, swipe) + shelf
            ├── Footer          # footnotes, directory (accordion trên mobile), legal
            └── Icons
```

## API

| Method | Endpoint              | Mô tả |
|--------|-----------------------|-------|
| GET    | `/api/health`         | Kiểm tra API + kết nối DB |
| GET    | `/api/home`           | Toàn bộ dữ liệu trang chủ trong 1 request |
| GET    | `/api/nav`            | Menu + flyout links |
| GET    | `/api/carousel`       | `{ title, tv[], shelf[] }` |
| GET    | `/api/footer`         | footnotes, cột directory, legal links |
| GET    | `/api/sections`       | Danh sách section đang active (`?all=1` lấy cả inactive) |
| GET    | `/api/sections/:id`   | Theo id hoặc slug |
| POST   | `/api/sections`       | Tạo mới (bắt buộc `slug`, `type`, `headline`) |
| PUT    | `/api/sections/:id`   | Cập nhật một phần |
| DELETE | `/api/sections/:id`   | Xoá |
| GET    | `/api/iphones`        | Danh mục iPhone (`?q=` tìm theo tên/chip/tagline, `?status=` lọc) |
| GET    | `/api/iphones/:id`    | Chi tiết 1 mẫu |
| POST   | `/api/iphones`        | Tạo mới (bắt buộc `name`, `price_from`; `slug` tự tạo nếu trống) |
| PUT    | `/api/iphones/:id`    | Cập nhật một phần |
| DELETE | `/api/iphones/:id`    | Xoá |

## Trang iPhone (công khai)

Mở http://localhost:5173/iphone (menu **iPhone** trên trang chủ cũng trỏ về đây) — lưới sản phẩm kiểu apple.com:
đổi màu máy bằng chấm màu, lọc theo trạng thái, sắp xếp theo giá/mới nhất, bảng so sánh thông số.
Đọc cùng dữ liệu `GET /api/iphones`; mẫu ở trạng thái *Ngừng bán* bị ẩn. Code: `frontend/src/pages/IphoneLineup.jsx`.

## Trang quản lý iPhone

Mở http://localhost:5173/admin/iphones — thêm / sửa / xoá mẫu iPhone, tìm kiếm, lọc theo trạng thái,
thống kê tồn kho (cảnh báo khi < 20). Dữ liệu nằm ở bảng `iphones` (`storage_options`, `colors` là cột JSON).
Code: `frontend/src/admin/`, `backend/src/routes/iphones.js`.

Ví dụ thêm 1 tile mới:

```bash
curl -X POST localhost:4000/api/sections -H 'content-type: application/json' \
  -d '{"slug":"macbook-air","type":"promo","theme":"light","headline":"MacBook Air",
       "subheadline":"Sky blue color.","primary_cta_label":"Learn more",
       "primary_cta_url":"https://www.apple.com/macbook-air/","sort_order":10}'
```

## Database `apple_clone`

| Bảng               | Nội dung |
|--------------------|----------|
| `nav_items`        | 11 mục menu trên cùng |
| `nav_flyout_links` | link trong flyout (group_title, is_primary = chữ lớn) |
| `sections`         | hero (`type=hero`) & promo tile (`type=promo`); `theme` light/dark/gradient; `image_position` overlay/below |
| `iphones`          | danh mục iPhone cho trang `/admin/iphones` (giá, chip, dung lượng, màu, tồn kho, trạng thái) |
| `carousel_items`   | `group_name=tv` (slide lớn Apple TV) / `shelf` (Music, Fitness+, Arcade) |
| `footnotes`        | chú thích cuối trang (`number` NULL = không đánh số) |
| `footer_groups` / `footer_links` | directory footer, `column_index` 1–5 |
| `legal_links`      | Privacy, Terms, ... |

Kết nối trực tiếp: `docker exec -it apple-mysql mysql -uapple -papple123 apple_clone`
(root password: `root123`).

## Ghi chú

- Ảnh sản phẩm được load trực tiếp từ CDN của Apple (`www.apple.com/v/...`, `is1-ssl.mzstatic.com`). Nếu Apple đổi ảnh, chỉ cần cập nhật URL trong DB, không cần sửa code.
- Nội dung flyout menu là tự soạn (trang chủ không trả về nội dung flyout).
- Dự án dùng cho mục đích học tập; thương hiệu và hình ảnh thuộc về Apple Inc.
