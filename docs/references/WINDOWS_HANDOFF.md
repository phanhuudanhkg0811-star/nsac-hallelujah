# Project Hail — Bàn Giao Sang Windows (Windows Handoff & State Summary)

*Thời gian cập nhật: 2026-11-11*  
*Trạng thái hiện tại: Đã dịch ngược hoàn tất toàn bộ logic & trích xuất 100% đồ họa 2D gốc của 60 Parsecs! v1.3.2 lên Web.*

---

## ⚠️ NGUYÊN TẮC BẮT BUỘC: NGƯỠNG TỰ TIN 95% TRƯỚC KHI QUAY LẠI BÀN THIẾT KẾ HAIL

> [!IMPORTANT]
> **Chỉ tiếp tục thảo luận thiết kế Hail khi có căn cứ để tự tin ít nhất 95% về gameplay gốc của 60 Parsecs! 1.3.2.**  
> Nếu bằng chứng còn thiếu, báo chính xác điểm chưa xác minh. Tuyệt đối không tự ý suy đoán hay đưa quy tắc tạm vào engine, dữ liệu hoặc cốt truyện của Project Hail như một quyết định đã chốt.

### Hai câu hỏi ưu tiên bắt buộc kiểm chứng thực nghiệm khi mở game trên Windows:
1. **Ai được phân công khi mệt (`Tired`), bệnh (`Sick`), hoặc bị thương (`Hurt`)?**
   - Phân biệt rõ: người bị ẩn khỏi danh sách, người hiện nhưng bị khóa, hay người vẫn được cử đi nhưng với hiệu quả/rủi ro khác biệt?
   - Kiểm tra riêng cho từng hành động: thám hiểm ngoài tàu, lựa chọn chỉ định người trong sự kiện, và thao tác sửa chữa thiết bị.
2. **Chuỗi lựa chọn nào dẫn đến từng ending đã khảo sát?**
   - Theo ít nhất một nhánh ending từ lúc kích hoạt tới kết quả. Ghi nhận các lựa chọn, điều kiện tiên quyết, vật phẩm hoặc chuyến thám hiểm liên quan, ngày Sol và màn kết thúc.
   - Cập nhật bằng chứng với trạng thái: **(1) Quan sát trực tiếp trên game chạy ở Windows**, **(2) Đối chiếu từ dữ liệu nhị phân bản 1.3.2**, hoặc **(3) Chưa xác minh**.

---

## 1. Những Tiến Trình Đột Phá Đã Hoàn Thành (Linux Session Milestones)

### A. Dịch ngược & Tái lập Lõi Sinh Tồn (Decompiled Survival Core)
- **Tệp nguồn chính:** [`src/engine/ParsecsDecompiledEngine.ts`](src/engine/ParsecsDecompiledEngine.ts)
- **Cơ chế 10 bước qua ngày Sol (`EndOfDayManager` CIL `06002FE6`):**
  1. `ProcessFoodRationing`: Tiêu thụ súp, cập nhật đói/chết đói (`isStarving`, `isDead`).
  2. `ProcessHealthDecay`: Tính toán bệnh tật (`need_health`), chấn thương (`isInjured`), suy kiệt.
  3. `ProcessMoraleAndSanity`: Tính toán stress, suy sụp tinh thần (`isCrazy`), trầm cảm.
  4. `ExecuteActiveExpedition`: Đếm ngược thời gian thám hiểm ngoài hành tinh, đối chiếu trang bị bảo hộ với 4 loại hiểm họa (`Biohazard`, `Fauna`, `Environment`, `Darkness`), trả về chiến lợi phẩm tài nguyên/vật phẩm.
  5. `ResolvePendingEvent`: Đồ thị 582 sự kiện (`GenericDeck`, `PlanetDecks`), tính toán kiểm tra chỉ số (`Agility`, `Intelligence`, `Strength`), phân nhánh kết quả và áp dụng hiệu ứng trạng thái.
  6. `AdvanceCraftingQueue`: Tiến trình máy chế tạo 3D (sản xuất súp, vật phẩm, tái chế, nâng cấp hệ thống).
  7. `UpdateHysteresisTiers`: Máy trạng thái 5 bậc (Hysteresis `06002F05`) chống nhấp nháy trạng thái khi chỉ số dao động quanh ngưỡng.
  8. `ProcessRandomMalfunctions`: Xác suất hỏng hóc thiết bị và hệ thống trên tàu.
  9. `RecordStarlogEntry`: Lưu vết nhật ký sinh tồn qua từng Sol.
  10. `CheckGameOverConditions`: Kiểm tra điều kiện thất bại (toàn bộ phi hành đoàn hy sinh/mất trí) hoặc chiến thắng (hoàn thành chuỗi sự kiện cứu nạn).

### B. Trích Xuất & Giải Mã 290 Sprite 2D Nguyên Bản (Unity Binary Extraction)
- **Nguồn nhị phân:** `60.Parsecs.v1.3.2/.../60Parsecs_Data/StreamingAssets/Windows/`
- **Bộ giải mã tự viết:** Đã viết và biên dịch thư viện C giải mã nén texture phần cứng GPU **`BC7` (DXGI_FORMAT_BC7_UNORM, đủ 8 modes 0..7)** và **`RGBA32`** từ các khối UnityFS (`LZ4` metadata + `LZMA` data blocks), ánh xạ qua bảng tọa độ `SpriteAtlas` (`ClassID 687078895`).
- **Kho tài nguyên WebP chuẩn hóa:** Đã xuất **290 sprite WebP chất lượng cao** vào:
  - [`public/assets/parsecs/`](public/assets/parsecs/)
  - [`dist/assets/parsecs/`](dist/assets/parsecs/)
- **Danh mục tài nguyên gồm:**
  - Nền khoang tàu [`Spaceship.webp`](public/assets/parsecs/Spaceship.webp) (3840x2880, vùng cắt alpha trong suốt ở ô cửa sổ tròn).
  - 5 Bề mặt ngoại cảnh hành tinh nhìn qua cửa sổ (`SurvSpaceshuttlePlanet01View01.webp` $\rightarrow$ `05`).
  - 6 Nhân vật Astrocitizens (`April`, `Baby`, `Deedee`, `Emmet`, `Maegan`, `Tom`) với đầy đủ các bộ phận cơ thể và biểu cảm.
  - Kệ đồ vật lý tương tác: 16 loại vật phẩm với đủ 3 trạng thái (`Lv1`, `Upgraded Lv2`, `Broken`).
  - Máy chế tạo 3D (`CraftingLv1`..`Lv3`), Bộ đồ EVA (`SuitLv1`..`Lv3`), chồng súp (`Soup1`..`Soup5`), Cần gạt ngày (`EndofdayButton.webp`).
  - Toàn bộ **36 bức tranh minh họa địa điểm thám hiểm hành tinh** (`Planet01ExpeditionDestination*.webp` $\rightarrow$ `Planet05...`).
  - Toàn bộ icon sự kiện, mối nguy, tài nguyên, nâng cấp hệ thống và ảnh thẻ nhân vật.

### C. Giao diện Web Hiện Tại & Bản Dựng
- Giao diện tích hợp máy trạng thái và đồ họa 2D: [`src/components/ParsecsSurvivalBench.tsx`](src/components/ParsecsSurvivalBench.tsx)
- Đã kiểm tra `tsc --noEmit` đạt **0 lỗi TypeScript**.
- Đã đóng gói thành công bản dựng production trong thư mục [`dist/`](dist/).
- Đã chụp ảnh màn hình kiểm chứng rendered UI thực tế: `06_parsecs_authentic_2d_graphics.png`.

---

## 2. Thảo Luận Thiết Kế Mới Nhất & Quyết Định Cần Triển Khai

### Vấn đề người dùng đặt ra:
> *"Vì sao ta chỉ tái hiện được giao diện như thế này mà không phải khung cảnh đầy đủ của game? Có điểm nghẽn nào hả"*

### Kết luận & Phân tích:
- **Không có bất kỳ điểm nghẽn kỹ thuật nào.** Toàn bộ sprite và logic đã sẵn sàng.
- Hiện trạng giao diện trông giống "Dashboard kỹ thuật (Testbench)" vì các bảng điều khiển sự kiện, chế tạo, thám hiểm và danh sách phi hành đoàn đang hiển thị dưới dạng các thẻ HTML nằm bên dưới buồng tàu để phục vụ debug/kiểm thử.
- Trong game gốc, **100% diện tích màn hình là khoang tàu (Game Viewport 16:9 tràn viền)**. Các thao tác đều là **Point-and-Click trực tiếp vào các vật thể trong phòng**:
  - Click vào Cuốn sổ/Bàn $\rightarrow$ Mở popup Nhật ký sự kiện (Starlog).
  - Click vào Máy chế tạo (vách trái) $\rightarrow$ Mở popup Chế tạo/Nâng cấp/Tái chế.
  - Click vào Cửa thám hiểm $\rightarrow$ Mở popup Chọn điểm đến & cử người đi thám hiểm.
  - Click vào từng Phi hành gia $\rightarrow$ Mở popup Khẩu phần súp / Cứu thương.
  - Click vào Cần gạt bên phải $\rightarrow$ Gạt cần, tắt đèn chuyển Sol.

### Hướng triển khai đã thống nhất (Phương án A):
Chuyển đổi giao diện sang **Full-screen Point-and-Click Game Viewport**:
1. Buồng tàu mở rộng toàn màn hình (responsive canvas/box cố định tỉ lệ 16:9).
2. Tạo các vùng bấm tương tác (interactive hotspots/invisible hitboxes) trực tiếp trên các vật thể trong buồng tàu.
3. Khi bấm vào vật thể nào, hiển thị modal/popup theo phong cách retro-futuristic/glassmorphism phủ lên giữa màn hình.
4. Giữ một nút nhỏ ở góc (hoặc phím tắt `F12`/`~`) để mở khay Debug/Dev Panel nếu cần kiểm tra thông số chi tiết.

---

## 3. Hướng Dẫn Chạy & Kiểm Thử Ngay Khi Sang Windows

Dự án nằm tại phân vùng dùng chung (NTFS / ExFAT): `Data/Project Hail`.

### Cách 1: Chạy bản dựng `dist` có sẵn (Nhanh nhất)
Mở PowerShell hoặc Command Prompt tại thư mục dự án:
```cmd
cd "D:\Project Hail"   :: (hoặc đường dẫn ổ đĩa tương ứng trên Windows)
npx serve dist -l 4173
:: hoặc nếu máy có Python:
python -m http.server 4173 --directory dist
```
Truy cập trình duyệt: `http://localhost:4173`

### Cách 2: Chạy chế độ phát triển (Dev Mode)
```cmd
cd "D:\Project Hail"
npm install
npm run dev
```
Truy cập trình duyệt: `http://localhost:5173`

---

## 4. Việc Cần Làm Tiếp Theo Ngay Khi Bắt Đầu Trên Windows
1. Mở [`src/components/ParsecsSurvivalBench.tsx`](src/components/ParsecsSurvivalBench.tsx) (hoặc tạo component viewport mới `ParsecsGameViewport.tsx`).
2. Tái cấu trúc layout: Đưa buồng tàu [`Spaceship.webp`](public/assets/parsecs/Spaceship.webp) chiếm trọn màn hình 16:9.
3. Gắn các tương tác click trực tiếp (hotspots) vào:
   - Cuốn sổ nhật ký giữa phòng $\rightarrow$ Popup `StarlogModal`.
   - Máy chế tạo bên trái $\rightarrow$ Popup `CraftingModal`.
   - 4 Phi hành gia $\rightarrow$ Popup `RationingModal`.
   - Cần gạt ngày $\rightarrow$ Kích hoạt `End of Day` animation.
4. Chạy `npm run dev` và trải nghiệm game sinh tồn trực tiếp trên trình duyệt Windows!
