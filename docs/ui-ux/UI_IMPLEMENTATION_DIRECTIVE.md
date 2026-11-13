# CHỈ ĐẠO THI CÔNG GIAO DIỆN REACT (UI/UX IMPLEMENTATION DIRECTIVE)
## DỰ ÁN: JUNIOR ASTRONAUT MISSION TRAINER (NASA SPACE APPS 2026)

> **Người nhận:** Team Frontend React, UI/UX Designer & Game Developer.  
> **Tài liệu tham chiếu kỹ thuật:** [`UI_UX_SPECIFICATION.md`](UI_UX_SPECIFICATION.md), [`src/engine/ParsecsDecompiledEngine.ts`](src/engine/ParsecsDecompiledEngine.ts), [`WINDOWS_HANDOFF.md`](WINDOWS_HANDOFF.md).  
> **Mục tiêu:** Xây dựng buồng trạm không gian tương tác **Point-and-Click toàn màn hình** chuẩn mực, vận hành mượt mà 60 FPS, xóa bỏ hoàn toàn giao diện dạng "Dashboard/Bảng biểu kỹ thuật", đáp ứng tiêu chuẩn game thương mại để đưa vào CV.

---

## 1. BA NGUYÊN TẮC BẤT DI BẤT DỊCH (CORE PRINCIPLES)

1. **Bảo toàn Tỷ lệ Gốc 4:3 (Tối kỵ kéo dẹt hình ảnh)**:
   * Ảnh nền khoang tàu `Spaceship.webp` có kích thước **3840 x 2880 px (tỷ lệ 4:3)**.
   * **Bắt buộc:** Khung buồng trạm phải dùng `aspect-[4/3]`, đặt ở trung tâm màn hình. Khi hiển thị trên màn hình 16:9 của người dùng, hai bên mép sử dụng hiệu ứng viền mờ tối (`bg-slate-950` kèm hiệu ứng sao vũ trụ), **tuyệt đối không dùng `object-fill` kéo giãn làm bẹp khoang tàu**.
2. **Tuân thủ Tuyệt đối Luồng Game C# Gốc (`Assembly-CSharp-firstpass.dll`)**:
   * **Starlog Sự Cố:** Tự động mở ra khi bắt đầu Sol mới từ máy tính trung tâm trên bàn (`SpaceshipEvent.webp`), không bắt người chơi đi tìm nút mở.
   * **Cần Gạt Endday:** Khi click vào **phải mở Bảng Tổng Kết Cuối Ngày (`EndOfDayView`)** để chia súp (`RationingBars`) và xem lại quyết định trong ngày. Sau khi người chơi ấn nút xác nhận chốt ngày mới kích hoạt Cutscene chuyển Sol.
   * **Phi Hành Gia:** Click vào người chỉ mở **Hồ Sơ Cá Nhân (`CharacterSheetModal`)** để kiểm tra chỉ số sức khỏe/kỹ năng. Không chia súp ở đây.
3. **100% Sử dụng Tài nguyên Đồ họa Đã Trích Xuất**:
   * Toàn bộ 290 sprite WebP chất lượng cao đã nằm sẵn tại thư mục [`public/assets/parsecs/`](public/assets/parsecs/). Không tự ý vẽ placeholder hình học thay thế.

---

## 2. KIẾN TRÚC CÂY THÀNH PHẦN (COMPONENT HIERARCHY)

Team Frontend cần tổ chức lại thư mục component theo cấu trúc phân tầng rõ ràng:

```text
src/components/
├── ParsecsGameViewport.tsx         # [GỐC] Canvas buồng trạm 4:3 lồng trong 16:9 container
├── hud/
│   ├── TelemetryTopBar.tsx         # Thanh đo O₂, Nước, Pin, Lương thực, Phụ tùng trôi ở đỉnh
│   └── SolCounterLED.tsx           # Đồng hồ LED 3 số hiển thị Sol (gắn trên cần gạt)
├── cabin/
│   ├── ViewportPorthole.tsx        # Cửa sổ tròn nhìn ra ngoại cảnh hành tinh (Z-0)
│   ├── LeftEquipmentShelf.tsx      # Kệ đồ vách trái (6 trang bị cố định)
│   ├── CraftingStation3D.tsx       # Máy chế tạo 3D (thay đổi sprite theo Level 1..3)
│   ├── CentralConsoleTable.tsx     # Bàn điều khiển & Màn hình sự kiện nhấp nháy
│   ├── RightConsumableShelf.tsx    # Chồng hộp súp & Pin dự phòng vách phải
│   ├── ExpeditionSuitHatch.tsx     # Bộ giáp EVA Suit (Level 1..3) & Cửa thám hiểm
│   ├── EndDayLeverControl.tsx      # Cần gạt chuyển Sol (SpaceshipEndday.webp)
│   └── CrewCabinSeats.tsx          # 4 Ghế ngồi & Nhân vật PaperDoll biểu cảm
└── modals/
    ├── StarlogModal.tsx            # Popup Sự cố NASA DONKI & Quyết định A/B (Mở đầu ngày)
    ├── EndOfDayModal.tsx           # Bảng Tổng kết cuối ngày, Chia súp (RationingBars) & Chốt Sol
    ├── CharacterSheetModal.tsx     # Hồ sơ chi tiết phi hành gia (Chỉ số, Bệnh tật, Kỹ năng)
    ├── CraftingModal.tsx           # Bảng Chế tạo vật phẩm, Sửa chữa trạm & Tái chế
    ├── ExpeditionModal.tsx         # Bảng Chọn điểm đến & Phái người thám hiểm
    └── NightCutsceneModal.tsx      # Màn hình đen Typewriter NASA Science Brief
```

---

## 3. LỘ TRÌNH 4 BƯỚC THI CÔNG (STEP-BY-STEP WORK ORDER)

### BƯỚC 1: DỰNG KHUNG CANVAS CHUẨN 4:3 VÀ LỚP ÁNH XẠ NỀN
* **File chính:** `src/components/ParsecsGameViewport.tsx`
* **Công việc:**
  1. Tạo container ngoài cùng tràn viền màn hình (`w-screen h-screen bg-[#050811] flex items-center justify-center overflow-hidden`).
  2. Tạo khung canvas trung tâm: `relative w-full aspect-[4/3] max-h-screen max-w-[1440px] overflow-hidden shadow-2xl`.
  3. Lớp nền `z-0`: Render `SurvSpaceshuttlePlanet01View01.webp` (Mặt Trăng) hoặc `Planet02...` (Sao Hỏa).
  4. Lớp vỏ trạm `z-10`: Render `Spaceship.webp` (đã cắt thủng alpha ô cửa sổ tròn) phủ kín 100% canvas.

### BƯỚC 2: GẮN VẬT THỂ TƯƠNG TÁC (THEO ĐÚNG TỌA ĐỘ PIXEL GỐC)
* **Công việc:** Đưa các sprite tương tác vào đúng tọa độ phần trăm đã kiểm chứng trong [`UI_UX_SPECIFICATION.md`](UI_UX_SPECIFICATION.md):
  * **Máy Chế tạo 3D (`left: 29%, top: 20%, width: 11.5%, height: 23%`)**: Sprite đổi tự động theo `shipSystems.Crafting` (`Crafting.webp`, `Level2.webp`, `Level3.webp`). Hover có hiệu ứng phóng to nhẹ (`hover:scale-105`).
  * **Kệ Trái (`left: 11.5%, top: 19.5%, width: 13%, height: 29%`)**: Hiển thị các vật phẩm người chơi sở hữu. Item hỏng thì đổi sang sprite `*Damaged.webp`.
  * **Chồng Súp (`right: 14%, top: 33%, width: 9%, height: 14%`)**: Thay đổi sprite từ `Soup01` đến `Soup09` theo số lượng súp thực tế trong kho.
  * **Giáp EVA Suit (`right: 29.5%, top: 25.5%, width: 10%, height: 32%`)**: Sprite đổi theo `shipSystems.Suit`.
  * **Cần gạt ngày (`right: 0%, top: 24%, width: 11%, height: 34%`)**: Cần gạt màu vàng, hover sáng viền.
  * **Màn hình sự kiện bàn giữa (`left: 44%, bottom: 18%, width: 12%, height: 20%`)**: Có hiệu ứng nhấp nháy đèn mời gọi người chơi bấm vào.
  * **4 Ghế & Phi hành gia (`inset-x: 12%, bottom: 4%, height: 52%`)**: 4 cột ghế. Khi phi hành gia đi thám hiểm vắng mặt, hiện nhãn "Đang thám hiểm ngoài trạm" thay vì hiện nhân vật.

### BƯỚC 3: XÂY DỰNG 2 MODAL SỐNG CÒN CỦA VÒNG LẶP SOL
* **1. `StarlogModal.tsx` (Mở đầu ngày):**
  * Tự động hiển thị khi Sol mới bắt đầu.
  * Hiển thị sự cố hôm nay (Prompt), 2 nút chọn phương án A/B.
  * Có nút "Xem Lịch Sử Nhật Ký" để lật lại các sự kiện cũ.
  * Sau khi người chơi bấm chọn phương án $\rightarrow$ Đóng modal, hiển thị kết quả tóm tắt.
* **2. `EndOfDayModal.tsx` (Mở khi bấm cần gạt):**
  * Không chuyển ngày ngay! Modal này hiện lên gồm:
    * **Danh sách 4 thanh gạt chia súp (`RationingBars`):** Tích chọn cấp súp / nước cho ai hôm nay.
    * **Thẻ tóm tắt ngày (`ChoiceCards`):** Nhắc lại hôm nay đã quyết định xử lý sự cố thế nào.
    * **Tiến độ chế tạo:** Máy in 3D đang làm món gì, còn mấy ngày.
    * **Nút Xác Nhận Chốt Ngày (Nút đỏ trong lồng kính):** Bấm nút này mới chính thức chạy `executeParsecsEndOfDay`!

### BƯỚC 4: KẾT NỐI CUTSCENE CHUYỂN SOL (NASA SCIENCE BRIEF)
* Khi `executeParsecsEndOfDay` hoàn tất:
  * Kích hoạt `NightCutsceneModal.tsx` (`bg-black`, phủ toàn màn hình).
  * Hiển thị bảng tổng kết số liệu tiêu hao: O₂ tụt bao nhiêu kg, nước lọc được bao nhiêu lít, pin sạc bao nhiêu kWh.
  * Chạy chữ Typewriter hộp **💡 NASA Science Brief** (kiến thức khoa học vũ trụ tương ứng).
  * Nút `[ THỨC DẬY VÀO SOL MỚI ➔ ]`: Bấm vào sẽ fade-in lại buồng tàu, tự động mở `StarlogModal` của Sol tiếp theo.

---

## 4. MA TRẬN KẾT NỐI DỮ LIỆU VỚI ZUSTAND STORE (`useGameStore`)

Lập trình viên React kết nối trực tiếp các hành động giao diện với Store:

| Thao Tác UI | Component Kích Hoạt | Hàm / State Trong Store Cần Gọi |
| :--- | :--- | :--- |
| Chọn phương án sự cố A/B | `StarlogModal.tsx` | `chooseEventOption(choiceId)` |
| Sửa chữa hệ thống trạm | `CraftingModal.tsx` | `repairSystem(systemId)` |
| Nâng cấp hệ thống lên Cấp 2/3 | `CraftingModal.tsx` | `upgradeSystem(systemId)` |
| Bật/tắt cấp súp cho phi hành gia | `EndOfDayModal.tsx` | `toggleCrewRation(crewId, 'soup')` |
| Bật/tắt cấp nước sạch | `EndOfDayModal.tsx` | `updatePlan({ waterFraction: ... })` |
| Ấn nút chốt ngày trong lồng kính | `EndOfDayModal.tsx` | `endSol()` $\rightarrow$ Mở `NightCutsceneModal` |
| Chạm màn hình thức dậy Sol mới | `NightCutsceneModal.tsx` | `completeNightTransition()` |
| Gửi tin báo cáo về Houston | `CommsLogisticsModal.tsx` | `transmitRadio(message)` |
| Đặt tàu hàng tiếp tế quỹ đạo | `CommsLogisticsModal.tsx` | `requestResupply(cargoPayload)` |
| Phóng tàu sang Sao Hỏa (9 điều kiện)| `MissionLaunchModal.tsx`| `launchToMars()` |

---

## 5. TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE / DOD)

Team UI chỉ bàn giao thành công khi đạt đủ 6 tiêu chí kiểm thử sau:
1. [ ] **Không méo hình:** Buồng tàu hiển thị sắc nét tỷ lệ 4:3 ở trung tâm, không bị kéo giãn ngang khi co kéo trình duyệt.
2. [ ] **Đúng luồng chuyển ngày:** Bấm cần gạt Endday phải mở bảng `EndOfDayModal` chia súp trước, không được tự ý chuyển ngày ngay.
3. [ ] **Tự động mở Starlog:** Khi Sol mới bắt đầu, máy tính trung tâm tự động mở `StarlogModal` hiển thị sự cố.
4. [ ] **Xem hồ sơ cá nhân:** Click vào từng phi hành gia phải mở bảng `CharacterSheetModal` xem được chỉ số Máu, Đói, Khát, Stress, Mệt mỏi.
5. [ ] **Màn hình Cutscene chuẩn:** Kết thúc Sol phải tối đen màn hình và chạy hiệu ứng chữ Typewriter NASA Science Brief.
6. [ ] **Hiệu năng:** Đạt ổn định **60 FPS**, bundle size không phát sinh thêm thư viện nặng ngoài Tailwind và Zustand.
