# QUY CHUẨN ĐỒ HỌA ASSET 2D BUỒNG TÀU (AEROMATTE 2050 ASSET SPEC)
> **Dự án**: Project Hail — Junior Astronaut Mission Trainer (2026 NASA Space Apps Challenge)  
> **Định dạng đồ họa**: 2.5D Cel-Shaded Sprite (Tỷ lệ 4:3, Transparent WebP, Nền trong suốt)  
> **Quy trình sản xuất**: 100% 2D Sprite-based (AI Generated + 2D Layering / Cutout)  

---

## 1. HỢP ĐỒNG PHONG CÁCH & THẨM MỸ (VISUAL CONTRACT)

Mọi asset trong game phải tuyệt đối tuân thủ ngôn ngữ thiết kế **Soft Aerospace 2050**:

* **Ngôn ngữ hình khối (Form Language)**:
  * Kết hợp giữa **góc vát thẳng chịu lực (structural chamfers)** và **bo tròn cục bộ (soft fillets)**.
  * Chi tiết công nghệ: Rãnh ghép module (*panel lines*), ốc siết lục giác chìm, khe tản nhiệt và quai xách công nghiệp.
  * Màn hình tích hợp: Kính phẳng mờ tràn viền, hiển thị đồ họa vector huỳnh quang (OLED HUD).
* **Nét vẽ & Ánh sáng (Line Art & NPR Shading)**:
  * Đường viền nét mực rõ ràng, dứt khoát (*Clean Bold Outlines 1.0 - 1.5px*), không bị răng cưa hay lem nhem.
  * Đổ bóng phẳng 2 mảng sáng - tối (*2-Tone Cel-Shading*), hướng sáng quy ước: Chếch 15° từ trên trần chiếu xuống.
* **Bảng màu quy chuẩn (AeroMatte 2050 Palette)**:
  * **Vỏ thiết bị chính**: Trắng ngà ấm (`#F5F2EB`) phối Xám nhạt (`#CFD8DC`).
  * **Khung cơ khí & Đế chịu lực**: Xám than chì đậm (`#2B2D42`).
  * **Điểm nhấn an toàn & Quai mở**: Cam cứu sinh hàng không vũ trụ (*Hazard Orange* `#FF5722`).
  * **Màn hình hiển thị & Vector HUD**: Xanh điện quang (*Aero Cyan* `#00E5FF`).
  * **Đèn cảnh báo / Hoạt động**: Vàng hổ phách (`#FFA000`) & Xanh lục sẵn sàng (`#00E676`).
* **Điều cấm tuyệt đối**:
  * ❌ KHÔNG bóng đổ xuống sàn buồng tàu (Contact shadow do CSS engine xử lý ở runtime).
  * ❌ KHÔNG hiệu ứng 3D CGI nhựa bóng lộn (không specular glare/plastic render).
  * ❌ KHÔNG để nền màu hoặc halo viền trắng khi tách nền.

---

## 2. QUY TRÌNH SẢN XUẤT 2D SIÊU TỐC (15-MINUTE PRODUCTION PIPELINE)

Quy trình 3 bước chuẩn thay thế hoàn toàn việc dựng 3D phức tạp:

### Bước 1: Tạo Base Asset bằng AI Prompt
Sử dụng công thức Prompt chuẩn (đã được kiểm nghiệm thực tế đạt độ hoàn thiện cao nhất):
```text
Clean 2D vector game asset of a futuristic [TÊN THIẾT BỊ], NASA Artemis 2050 outpost aesthetic.
Soft aerospace design, clean chamfered shell with rounded bevels, panel lines, hex screws, ventilation grilles.
Warm bone white (#F5F2EB) composite body, dark warm slate (#2B2D42) structural frame, hazard orange (#FF5722) safety accents.
Integrated recessed chamber, crisp cyan (#00E5FF) OLED HUD screen showing vector graphics.
Stylized 2-tone cel-shading, sharp clean ink outlines, orthographic 12-degree slight top-down angle.
Isolated on pure white background, no cast ground shadows, crisp vector illustration, video game sprite art.
```

### Bước 2: Tách nền trong suốt chuẩn Pixel (Auto-Alpha Cutout)
Chạy lệnh ImageMagick để khử sạch nền trắng và xuất WebP nén nhẹ (< 30 kB):
```bash
magick input_raw.png -fuzz 8% -transparent white -trim +repage output.webp
```

### Bước 3: Tạo 3 Trạng thái Hoạt động (State Layering)
* **IDLE (Nghỉ)**: Máy ở chế độ chờ, khay trống, màn hình hiển thị `IDLE` (Cyan).
* **WORKING (Hoạt động)**: Màn hình đổi sang cam `WORKING 67%`, khoang in xuất hiện tia laser và chi tiết đang gia công.
* **DAMAGED (Sự cố)**: Kính nứt nhẹ, vệt khói xám bốc lên, màn hình báo đỏ `ERR_OFFLINE`.

---

## 3. MA TRẬN TỌA ĐỘ VỊ TRÍ GẮN BUỒNG TÀU (SPATIAL REFERENCE)

Khung buồng tàu cố định tỷ lệ **4:3** (Native Canvas: **1600 × 1200 px**). Tọa độ gắn trên CSS:

| Tên Thiết Bị (AeroMatte 2050) | Vị trí Slot Buồng Tàu | Tọa độ Canvas (Left % / Top %) | Kích thước tham chiếu (W × H px) | Tầng hiển thị (`z-index`) |
| :--- | :--- | :---: | :---: | :---: |
| **Cửa sổ quang học Cupola** | Giữa trạm, nhìn ra vũ trụ | `left: 41.0%` / `top: 26.0%` | ~690 × 660 px | `z-index: 0` (Ngoại cảnh) |
| **Vỏ buồng tàu (Cabin Shell)** | Toàn khung trạm | `left: 0.0%` / `top: 0.0%` | 1600 × 1200 px | `z-index: 10` (Khung vỏ) |
| **Hệ thống tái sinh nước WRS & Khí ECLSS** | Vách trái cao | `left: 11.5%` / `top: 19.5%` | ~500 × 800 px | `z-index: 20` (Thiết bị vách) |
| **Trạm chế tạo vật tư 3D Fabricator** | Vách trái giữa | `left: 26.0%` / `top: 20.0%` | ~450 × 650 px | `z-index: 20` (Thiết bị vách) |
| **Giá đồ bảo hộ & Cửa Airlock** | Vách phải giữa | `left: 59.7%` / `top: 30.4%` | ~370 × 820 px | `z-index: 20` (Thiết bị vách) |
| **2 Ghế hàng sau (Back Row Pods)** | Sau bàn Console (Scale 0.63) | Trái `29.4%` / Phải `55.5%` | ~550 × 630 px | `z-index: 22` (Khuất sau bàn) |
| **2 Ghế hàng trước (Front Row Pods)** | Hai bên tiền cảnh (Scale 1.0) | Trái `13.0%` / Phải `63.8%` | ~875 × 1000 px | `z-index: 30` (Tiền cảnh) |
| **Cần gạt chuyển Sol (Safety Throttle)** | Vách cực phải | `left: 89.5%` / `top: 18.0%` | ~400 × 900 px | `z-index: 30` (Tiền cảnh) |
| **Bàn Telemetry Console trung tâm** | Chính giữa tiền cảnh | `left: 36.1%` / `top: 54.1%` | ~1036 × 960 px | `z-index: 35` (Bàn chính) |
| **Màn hình Starlog Event tương tác** | Gắn trên mặt bàn Console | `left: 44.4%` / `top: 61.6%` | ~405 × 475 px | `z-index: 40` (Tương tác đỉnh) |
