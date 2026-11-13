# TÀI LIỆU ĐẶC TẢ GIAO DIỆN & TỌA ĐỘ CHUẨN XÁC TỪ 60 PARSECS! (UI/UX SPECIFICATION)
## DỰ ÁN: JUNIOR ASTRONAUT MISSION TRAINER (NASA SPACE APPS 2026)

> **Căn cứ đối chiếu:** Trích xuất thực nghiệm từ tệp ảnh nền gốc `Spaceship.webp` (3840 x 2880px) và mã nguồn đã ánh xạ tọa độ pixel tại [`src/components/ParsecsSurvivalBench.tsx`](src/components/ParsecsSurvivalBench.tsx).  
> **Cam kết liêm chính kỹ thuật:** Toàn bộ vị trí, tỷ lệ và tên sprite dưới đây được **khớp 1:1 từ tài nguyên nhị phân của game gốc 60 Parsecs! v1.3.2**, tuyệt đối không dùng số liệu phỏng đoán.

---

## 1. KIẾN TRÚC TỶ LỆ KHUNG HÌNH (CANVAS VIEWPORT 4:3 ➔ 16:9)

Trong Unity gốc, khoang tàu `Spaceship.webp` có kích thước gốc là **3840 x 2880px** (tỷ lệ chuẩn **4:3**).  
Để hiển thị chuẩn mực trên màn hình Web 16:9 hiện đại:
* Khung chứa sử dụng `aspect-ratio: 4 / 3` (hoặc đặt lồng trong container 16:9 với nền vũ trụ hai bên letterbox/pillarbox).
* Ô cửa sổ tròn (Porthole) ở giữa vách sau được cắt thủng kênh Alpha trong suốt, để lộ ngoại cảnh bề mặt hành tinh (Mặt Trăng / Sao Hỏa) nằm ở lớp nền dưới cùng.

```text
+-----------------------------------------------------------------------------------------+
|                                 PHÂN LỚP HIỂN THỊ (Z-INDEX)                             |
+-----------------------------------------------------------------------------------------+
|  Z-50: Các Modal Popup tương tác (Starlog, Chế tạo, Thám hiểm, Khẩu phần)               |
|  Z-40: Màn hình sự kiện trên bàn (SpaceshipEvent.webp) & HUD đếm Sol                    |
|  Z-30: Cần gạt ngày (Endday), Ghế ngồi & 4 Phi hành gia Astrocitizens                   |
|  Z-20: Máy Chế tạo 3D, Giáp EVA Suit, Kệ đồ vật phẩm, Chồng súp, Bàn Console            |
|  Z-10: Vỏ khoang tàu Spaceship.webp (3840 x 2880 có ô cửa sổ cắt thủng alpha)           |
|  Z-0 : Ngoại cảnh hành tinh ngoài cửa sổ (SurvSpaceshuttlePlanet*.webp)                 |
+-----------------------------------------------------------------------------------------+
```

---

## 2. BẢNG TỌA ĐỘ VẬT THỂ & SPRITE GỐC CHÍNH XÁC 100% (PIXEL-PERFECT MAPPING)

Tất cả các thông số dưới đây được lấy trực tiếp từ các bộ điều khiển trong `ParsecsSurvivalBench.tsx` (dòng 365–540):

```text
0% -------------------------------------------------------------------------------- 100% (X)
|                                                                                            |
|                                [--- Ô CỬA SỔ TRÒN ---]                                     |
|                                (Cắt thủng alpha trên Spaceship.webp)                       |
|                                                                                            |
|   [KỆ VẬT PHẨM TRÁI]       [MÁY CHẾ TẠO 3D]          [GIÁ TREO SUIT & HATCH]  [CẦN GẠT NGÀY]|
|   L: 11.5%, T: 19.5%       L: 29%, T: 20%            R: 29.5%, T: 25.5%       R: 0, T: 24% |
|   W: 13%, H: 29%           W: 11.5%, H: 23%          W: 10%, H: 32%           W: 11%, H: 34%|
|                                                                               (Endday)     |
|   [SỔ TREO VÁCH TRÁI]                                [CHỒNG HỘP SÚP]                       |
|   L: 0%, T: 30%                                      R: 14%, T: 33%                        |
|   W: 13%, H: 49%                                     W: 9%, H: 14%                         |
|   (SpaceshipStarlog)                                 (SpaceshipItemSoup)                   |
|                                                                                            |
|                         [-------- BÀN ĐIỀU KHIỂN TRUNG TÂM --------]                       |
|                         L: 35%, Bottom: 3%, W: 30%, H: 45% (Console)                       |
|                         L: 44%, Bottom: 18%, W: 12%, H: 20% (Event Screen)                 |
|                                                                                            |
|   [-- GHẾ 1 / CỘT 1 --]  [-- GHẾ 3 / CỘT 2 --]  [-- GHẾ 4 / CỘT 3 --]  [-- GHẾ 2 / CỘT 4 --]|
|   [-- PHI HÀNH GIA 1 -]  [-- PHI HÀNH GIA 3 -]  [-- PHI HÀNH GIA 4 -]  [-- PHI HÀNH GIA 2 -]|
|   Khung chân đế ghế: Inset-X: 12%, Bottom: 4%, Height: 52% (Grid 4 cột tỷ lệ đều)         |
100% (Y) ----------------------------------------------------------------------------------+
```

### Bảng Đối Chiếu Mã Sprite & Tọa Độ CSS Tuyệt Đối:

| STT | Tên Thành Phần Trong Game | Tên Tệp Sprite WebP Gốc (`public/assets/parsecs/`) | Tọa Độ CSS Thực Nghiệm Trong Code | Hành Động Kích Hoạt Thực Tế (Khớp C# Gốc) |
| :--: | :--- | :--- | :--- | :--- |
| **1** | **Khung Khoang Tàu** | `Spaceship.webp` | `absolute inset-0 w-full h-full object-fill z-10` | Nền khoang chính có lỗ thủng alpha ở ô cửa sổ (3840x2880, tỷ lệ 4:3). |
| **2** | **Ngoại Cảnh Cửa Sổ** | `SurvSpaceshuttlePlanet01View01.webp` $\rightarrow$ `05` | Nằm dưới lớp `Spaceship.webp` (`z-0`) | Hiển thị bề mặt Mặt Trăng hoặc Sao Hỏa. |
| **3** | **Sổ Hướng Dẫn Vách Trái** | `SpaceshipStarlog.webp` | `left: 0%, top: 30%, width: 13%, height: 49%` (`z-20`) | Click xem sổ tay cẩm nang trạm / lịch sử sứ mệnh. |
| **4** | **Máy Chế Tạo 3D** | `SpaceshipCrafting.webp` (Cấp 1)<br/>`SpaceshipCraftingLevel2.webp` (Cấp 2)<br/>`SpaceshipCraftingLevel3.webp` (Cấp 3) | `left: 29%, top: 20%, width: 11.5%, height: 23%` (`z-20`) | Click mở Menu Chế tạo, Tái chế và Nâng cấp trạm. |
| **5** | **Kệ Trái (6 Trang Bị)** | `SpaceshipShelfLeftClosed0.webp` + Các sprite item (`SpaceshipItem*.webp`) | `left: 11.5%, top: 19.5%, width: 13%, height: 29%` (`z-20`) | Kệ cố định hiển thị các đồ vật (súng, sách, mặt nạ...). |
| **6** | **Kệ Phải (Súp & Pin)** | `SpaceshipItemSoup01.webp` $\rightarrow$ `09` (tùy số lượng) | `right: 14%, top: 33%, width: 9%, height: 14%` (`z-20`) | Kệ 3 tầng chứa thực phẩm và pin dự phòng. |
| **7** | **Bộ Giáp EVA & Cửa Đi** | `SpaceshipItemSuit.webp` (Cấp 1)<br/>`SpaceshipItemSuitLevel2.webp` (Cấp 2)<br/>`SpaceshipItemSuitLevel3.webp` (Cấp 3) | `right: 29.5%, top: 25.5%, width: 10%, height: 32%` (`z-20`) | Click mở Menu Phái người đi Thám hiểm. |
| **8** | **Cần Gạt Chốt Sol** | `SpaceshipEndday.webp` | `right: 0%, top: 24%, width: 11%, height: 34%` (`z-30`) | Click để mở **Bảng Tổng Kết Cuối Ngày (`EndOfDayView`)** chứa thanh chia súp và thẻ quyết định. |
| **9** | **Đồng Hồ Đếm Sol** | Render text số Sol (font LED/Mono) | Đặt ngay phía trên cần gạt ngày (`right: 1.5%, top: 17%`) | Hiển thị số Sol 3 chữ số (`001`, `012`...). |
| **10**| **Bàn Điều Khiển Giữa** | `SpaceshipConsole.webp` | `left: 35%, bottom: 3%, width: 30%, height: 45%` (`z-20`) | Bàn điều khiển trước mặt phi hành đoàn. |
| **11**| **Màn Hình Máy Tính Starlog** | `SpaceshipEvent.webp` | `left: 44%, bottom: 18%, width: 12%, height: 20%` (`z-40`) | Tự động mở khi Sol mới bắt đầu (`WAIT_TIME_BEFORE_OPEN_ON_NEW_DAY`) hoặc click mở lại Sự Cố. |
| **12**| **Ghế Ngồi Thuyền Trưởng** | `SpaceshipChairCaptain.webp` | Cột thứ 3 trong grid 4 ghế (`bottom: 2%, w: 78%, h: 78%`) | Ghế đặc thù có biểu tượng thuyền trưởng. |
| **13**| **Ghế Ngồi Thuyền Viên** | `SpaceshipChair.webp` | Cột 1, 2, 4 trong grid 4 ghế | 3 ghế tiêu chuẩn cho phi hành gia. |
| **14**| **4 Phi Hành Gia (Figures)** | Render ghép từ PaperDoll (`CadetIcon_*.webp`, biểu cảm mắt, miệng, râu tóc) | Nằm trong khung `inset-x: 12%, bottom: 4%, height: 52%` (`z-30`) | Click để mở **Hồ Sơ Cá Nhân (`CharacterPanelController`)** kiểm tra chỉ số và tình trạng sức khỏe. |

---

## 3. CƠ CHẾ NỐI VỚI HỆ THỐNG KHOA HỌC NASA CỦA PROJECT HAIL

Từ các vùng bấm vật lý gốc trên, ta tích hợp các tính năng khoa học NASA đã thống nhất:

1. **Màn hình máy tính trung tâm (`SpaceshipEvent.webp`)**:
   * Tự động mở ra khi Sol mới bắt đầu: Hiển thị **Sự cố NASA DONKI** (Bão mặt trời, Rò rỉ khóa khí, Bụi regolith) và cho người chơi chọn phương án xử lý A/B.
2. **Máy chế tạo 3D (`SpaceshipCrafting.webp`)**:
   * Mở Bảng Kỹ thuật: Sửa chữa và Nâng cấp 4 hệ thống sống còn (**Scrubber, WRS Recycler, Solar, Airlock**).
3. **Cửa thám hiểm / Giáp EVA (`SpaceshipItemSuit.webp`)**:
   * Mở Bảng Thám hiểm: Cử phi hành gia ra ngoài khảo sát băng nước miệng núi lửa Shackleton hoặc mẫu đất Sao Hỏa.
4. **Click vào Phi hành gia (Ghế ngồi)**:
   * Mở Bảng Hồ Sơ Cá Nhân: Xem chi tiết Máu, Đói, Khát, Stress, Mệt mỏi, Kỹ năng và lịch sử trạng thái (Khỏe/Bệnh/Thương).
5. **Cần gạt chuyển Sol (`SpaceshipEndday.webp`)**:
   * Mở **Bảng Tổng Kết Cuối Ngày (`EndOfDayView`)**: 
     - Phân bổ khẩu phần súp/nước đêm (`RationingBars`).
     - Tóm tắt các quyết định đã chọn trong ngày (`_choiceCardsController`).
     - Báo cáo tiến độ chế tạo và thám hiểm.
     - Sau khi người chơi chốt phân bổ và ấn xác nhận chốt ngày $\rightarrow$ Kích hoạt `executeParsecsEndOfDay` $\rightarrow$ Màn hình tối đen Cutscene xuất hiện dòng chữ Typewriter **NASA Science Brief**!

---

## 4. CODE MẪU SỬ DỤNG TRỰC TIẾP TỌA ĐỘ NGUYÊN BẢN (READY TO USE)

```tsx
// Trích xuất trực tiếp từ logic đang chạy tại src/components/ParsecsSurvivalBench.tsx
<div className="relative w-full aspect-[4/3] max-w-[1440px] mx-auto bg-black overflow-hidden select-none">
  {/* LỚP 0: NGOẠI CẢNH NGOÀI CỬA SỔ */}
  <img 
    src="/assets/parsecs/SurvSpaceshuttlePlanet01View01.webp" 
    alt="Planet" 
    className="absolute inset-0 w-full h-full object-cover z-0" 
  />

  {/* LỚP 1: VỎ BUỒNG TÀU GỐC (3840x2880) */}
  <img 
    src="/assets/parsecs/Spaceship.webp" 
    alt="Cabin Interior" 
    className="relative z-10 w-full h-full object-fill pointer-events-none" 
  />

  {/* LỚP 2: CÁC VẬT THỂ TƯƠNG TÁC THEO TỌA ĐỘ GỐC */}
  {/* Sổ nhật ký treo vách */}
  <button 
    style={{ left: '0%', top: '30%', width: '13%', height: '49%' }}
    className="absolute z-20 cursor-pointer hover:scale-105 transition-transform"
    onClick={() => openModal('starlog')}
  >
    <img src="/assets/parsecs/SpaceshipStarlog.webp" alt="Starlog" className="w-full h-full object-contain" />
  </button>

  {/* Máy chế tạo 3D */}
  <button 
    style={{ left: '29%', top: '20%', width: '11.5%', height: '23%' }}
    className="absolute z-20 cursor-pointer hover:scale-105 transition-transform"
    onClick={() => openModal('crafting')}
  >
    <img src="/assets/parsecs/SpaceshipCrafting.webp" alt="Crafting" className="w-full h-full object-contain" />
  </button>

  {/* Bộ giáp EVA Suit */}
  <button 
    style={{ right: '29.5%', top: '25.5%', width: '10%', height: '32%' }}
    className="absolute z-20 cursor-pointer hover:scale-105 transition-transform"
    onClick={() => openModal('expedition')}
  >
    <img src="/assets/parsecs/SpaceshipItemSuit.webp" alt="EVA Suit" className="w-full h-full object-contain" />
  </button>

  {/* Cần gạt chuyển Sol */}
  <button 
    style={{ right: '0%', top: '24%', width: '11%', height: '34%' }}
    className="absolute z-30 cursor-pointer hover:scale-105 transition-transform active:translate-y-2"
    onClick={() => triggerEndOfSol()}
  >
    <img src="/assets/parsecs/SpaceshipEndday.webp" alt="End Sol Lever" className="w-full h-full object-contain" />
  </button>

  {/* Bàn Console & Màn hình sự kiện trung tâm */}
  <img 
    src="/assets/parsecs/SpaceshipConsole.webp" 
    alt="Console" 
    className="absolute z-20 pointer-events-none object-contain" 
    style={{ left: '35%', bottom: '3%', width: '30%', height: '45%' }} 
  />
  <button 
    style={{ left: '44%', bottom: '18%', width: '12%', height: '20%' }}
    className="absolute z-40 cursor-pointer hover:brightness-125 transition-all"
    onClick={() => openModal('event')}
  >
    <img src="/assets/parsecs/SpaceshipEvent.webp" alt="Event Terminal" className="w-full h-full object-contain" />
  </button>
</div>
```
