# PROJECT HAIL MARY — CABIN LAYOUT STAGE DESIGNER

> **Công cụ tương tác trực quan (Interactive Visual Studio) phục vụ dàn dựng bố cục buồng tàu, thử nghiệm và hoán đổi asset 2.5D cho dự án NASA Space Apps Challenge 2026.**

---

## 1. Giới thiệu tổng quan (Overview)

**Project Hail Mary** là phân nhánh độc lập được phát triển để giải quyết bài toán dàn dựng không gian buồng tàu không gian (*Space Station Cockpit*).

Thay vì phải chỉnh sửa tọa độ CSS thủ công trong mã nguồn, công cụ này cung cấp một **Studio kéo thả trực quan** trên khung hình chuẩn **tỷ lệ 4:3 (1600 × 1200 px)**:
* Toàn bộ các trạm chức năng và vật phẩm được trừu tượng hóa thành các **khối hình học (Wireframe Bounding Boxes)** có nhãn tiêu đề, mã màu nhận diện và thông số z-index.
* Tích hợp sẵn bộ 20 asset chuẩn phong cách **AeroMatte 2050 (Cel-Shaded NPR)**.
* Cho phép thử nghiệm, căn chỉnh tỷ lệ pixel-perfect và **xuất ngược mã JSON / React CSS** sang dự án game chính.

---

## 2. Hướng dẫn khởi chạy nhanh (Quick Start)

### Yêu cầu hệ thống
* **Node.js**: v18.x hoặc v20.x trở lên.
* **Trình quản lý gói**: `npm` hoặc `pnpm` / `bun`.

### Cài đặt và chạy Dev Server
```bash
# 1. Di chuyển vào thư mục dự án
cd "Project Hail Marry"

# 2. Cài đặt dependencies (nếu chưa cài)
npm install

# 3. Khởi động máy chủ phát triển
npm run dev
```

Sau khi chạy lệnh, mở trình duyệt tại:
* 🌐 **Local**: `http://localhost:5173/`
* 📡 **Mạng nội bộ / Thiết bị di động**: `http://<IP_MAY_BAN>:5173/`

*(Lưu ý: Ở góc dưới cùng bên trái màn hình có nút `⇄ Xem Game View` để bạn chuyển đổi qua lại giữa Studio và chế độ mô phỏng game gốc).*

---

## 3. Hướng dẫn sử dụng Canvas Editor

```
┌────────────────────────────────────────────────────────────────────────┐
│ [HM] Project Hail Marry | [Khối Wireframe] [Lồng Ảnh] [Render] | Snap: 0.5% │
├──────────────────────────────────────────┬─────────────────────────────┤
│                                          │  [Thuộc Tính] [Layers] [+]  │
│                                          ├─────────────────────────────┤
│                                          │ Tên: Máy Chế Tạo 3D         │
│          CANVAS BUỒNG TÀU 4:3            │ Ảnh: eq_fabricator_idle     │
│             (1600 × 1200)                │ Left: 26.0%  Top: 20.0%     │
│                                          │ Width: 16%   Height: 30%    │
│  [Kéo thả di chuyển - 8 neo co giãn]     │ Layer z-index: 20           │
│                                          │                             │
└──────────────────────────────────────────┴─────────────────────────────┘
```

### 3.1. Ba chế độ hiển thị (View Modes)
1. **Khối Wireframe (`FileCode`)**: 
   * Tối giản 100% hình ảnh phức tạp.
   * Hiển thị các khối màu có viền dạ quang, nhãn chức năng và thông số tọa độ thời gian thực.
2. **Lồng Ảnh / Hybrid (`Image`)**:
   * Hiển thị khung viền chỉnh sửa đồng thời render ảnh sprite AeroMatte tương ứng bên trong với `object-fit: contain`.
   * Giúp kiểm tra xem hình ảnh có bị méo, lệch mộng hay mất tỷ lệ hay không.
3. **Render Buồng Tàu (`Sparkles`)**:
   * Ẩn toàn bộ viền wireframe và thanh thước đo.
   * Chiêm ngưỡng buồng tàu hoàn chỉnh ở trạng thái runtime thực tế.

### 3.2. Thao tác điều khiển & Phím tắt
* **Click chọn**: Bấm vào khối bất kỳ để chọn và kích hoạt khung viền dạ quang cyan.
* **Kéo thả (Drag)**: Nhấn giữ chuột trái trong thân khối để di chuyển vị trí.
* **Co giãn (Resize)**: Nắm và kéo 8 điểm neo màu xanh lục quanh mép khối.
* **Lưới & Bám dính (Snap to Grid)**: 
  * Bật/tắt lưới tọa độ 5% trên thanh công cụ.
  * Tùy chọn bước nhảy Snap: `Tắt`, `0.25%`, `0.5%`, `1.0%`, `2.5%`, `5.0%`.
* **Phím tắt bàn phím**:
  * `↑` `↓` `←` `→`: Dịch chuyển khối đang chọn một khoảng tinh chỉnh $\pm 0.5\%$.
  * `Shift` + `Mũi tên`: Dịch chuyển nhanh $\pm 2.0\%$.
  * `Delete` hoặc `Backspace`: Xóa khối đang chọn (yêu cầu mở khóa trước khi xóa).
  * `Ctrl + Z` / `Cmd + Z`: Hoàn tác (Undo).
  * `Ctrl + Y` hoặc `Ctrl + Shift + Z`: Làm lại (Redo).
  * `Esc`: Bỏ chọn khối hiện tại.

### 3.3. Bảng điều khiển thanh bên (Sidebar Inspector)
* **Tab Thuộc Tính (`Maximize2`)**:
  * Đổi tên nhãn tiêu đề và chọn phân loại (*background, structure, equipment, seats, props, custom*).
  * Chọn màu sắc nhận diện khối (Color picker).
  * Menu dropdown gán hình ảnh liên kết từ thư mục asset.
  * Form nhập số chính xác đến $0.1\%$ cho: `Left`, `Top`, `Width`, `Height`.
  * Bộ điều khiển Layer Z-Index: Tăng/giảm 1 lớp, đưa lên đỉnh (`Bring to Front`), đưa xuống đáy (`Send to Back`).
* **Tab Layers (`Layers`)**:
  * Liệt kê toàn bộ các khối theo thứ tự độ sâu Z-Index từ cao xuống thấp.
  * Nút 🔒 **Khóa**: Ngăn việc kéo thả nhầm đối với các mảng nền lớn (như Cabin Shell).
  * Nút 👁 **Ẩn/Hiện**: Tạm thời ẩn khối khỏi canvas để quan sát các lớp bên dưới.
* **Tab Thư Viện (`Plus`)**:
  * Thêm khối trống tùy chỉnh mới.
  * Danh mục 20 linh kiện buồng tàu AeroMatte có sẵn: Click một nút là linh kiện tự động xuất hiện giữa sân khấu.

---

## 4. Quy trình thử nghiệm & Thay thế Asset mới (Asset Pipeline)

### Bước 1: Chuẩn bị hình ảnh
* **Định dạng tối ưu**: Khuyến nghị dùng file **WebP** hoặc **PNG** tách nền trong suốt (RGBA).
* **Quy chuẩn tỷ lệ**: Asset không nên có contact shadow gắn cứng ở chân đế (runtime sẽ xử lý).
* **Vị trí lưu trữ**:
  Đặt các file ảnh mới vào thư mục:
  ```text
  Project Hail Marry/public/AeroMatte_Sprites_PNG/
  ├── background/   # Ảnh nền không gian, cupola, vỏ tàu
  ├── equipment/    # Máy móc, trạm chế tạo, cần gạt, bàn console, ghế
  └── props/        # Vật phẩm nhỏ (pin, máy quét, hộp y tế, dụng cụ)
  ```

### Bước 2: Đăng ký asset vào danh mục Editor (Tùy chọn)
Mở file [`src/components/editor/types.ts`](src/components/editor/types.ts), thêm định nghĩa vào mảng `AEROMATTE_SPRITES_CATALOGUE`:
```typescript
{
  path: '/AeroMatte_Sprites_PNG/equipment/ten_asset_moi.png',
  name: 'Tên Thiết Bị Mới',
  category: 'equipment',
  defaultWidth: 16,
  defaultHeight: 30,
  defaultZIndex: 20,
  color: '#8B5CF6',
}
```

### Bước 3: Gán vào khối trên Canvas
1. Mở giao diện Canvas trên trình duyệt.
2. Chọn khối cần thay ảnh.
3. Tại ô **"Hình ảnh liên kết (AeroMatte)"**, chọn file ảnh mới vừa thêm.
4. Chuyển sang chế độ **"Lồng Ảnh (Hybrid)"** hoặc **"Render Buồng Tàu"** để kiểm tra độ vừa vặn và canh chỉnh lại kích thước.

---

## 5. Xuất tọa độ tích hợp sang Game chính (Export Workflow)

Sau khi hoàn thiện dàn dựng bố cục trên Canvas:

1. Bấm nút **"Xuất Tọa Độ"** (`Download`) ở thanh công cụ góc trên bên phải.
2. Hộp thoại cung cấp 2 định dạng:
   * **Mã JSON Layout**: Dùng để sao chép lưu trữ hoặc gửi cho đồng đội bấm nút **Nhập (Upload)** để khôi phục chính xác 100% bố cục của bạn.
   * **Mã React CSS Styles**: Đoạn mã sẵn sàng paste vào file stylesheet hoặc component React:
     ```typescript
     export const CABIN_LAYOUT_STYLES = {
       'box_fabricator': {
         position: 'absolute',
         left: '26.00%',
         top: '20.00%',
         width: '16.00%',
         height: '30.00%',
         zIndex: 20,
       },
       // ... các thành phần khác
     };
     ```

---

## 6. Hướng dẫn đóng gói & Đẩy lên GitHub (Push to GitHub)

Để đẩy dự án lên GitHub cá nhân của bạn, hãy chạy các lệnh sau trong terminal:

```bash
# 1. Di chuyển vào thư mục Project Hail Marry
cd "/run/media/acheron/Data/Project Hail Marry"

# 2. Tạo repository mới trên GitHub (https://github.com/new), sau đó liên kết remote:
git remote add origin https://github.com/<username-cua-ban>/<ten-repo>.git

# 3. Đẩy toàn bộ mã nguồn lên nhánh main:
git push -u origin main
```

*(Thư mục `node_modules` và các file build tạm đã được cấu hình tự động loại trừ trong `.gitignore`, đảm bảo repository luôn nhẹ và tải lên cực nhanh).*

---

## 7. Giấy phép & Bản quyền (License)
* Dự án phát triển phục vụ **2026 NASA Space Apps Challenge** ("Junior Astronaut Mission Trainer").
* 100% tài nguyên đồ họa AeroMatte và mã nguồn được tạo mới, tuân thủ nguyên tắc không chứa mã hay asset độc quyền từ bên thứ ba.
