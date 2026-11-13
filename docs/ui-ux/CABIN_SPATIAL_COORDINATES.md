# MA TRẬN TỌA ĐỘ KHÔNG GIAN BUỒNG TÀU (CABIN SPATIAL COORDINATES MATRIX)
> **Dự án**: Junior Astronaut Mission Trainer (2026 NASA Space Apps Challenge)  
> **Nguồn trích xuất nhị phân**: Dữ liệu cấu trúc scene Unity `level3` và tệp gói tài nguyên `sharedassets3.assets` (*60 Parsecs! v1.3.2*)  
> **Hệ quy chiếu chuẩn**: Orthographic Viewport 4:3, Pixels Per Unit (PPU) = 100, Canvas gốc **3840 × 2880 px** (Stage Width = 38.4 units, Height = 28.8 units)  
> **Tệp dữ liệu ánh xạ gốc**: [`src/data/parsecsSceneCoordinates.json`](file:///e:/Project%20Hail/src/data/parsecsSceneCoordinates.json)  
> **Tài liệu tham chiếu liên quan**: [`GRAPHIC_ASSET_MAPPING_GUIDE.md`](file:///e:/Project%20Hail/GRAPHIC_ASSET_MAPPING_GUIDE.md), [`UI_UX_SPECIFICATION.md`](file:///e:/Project%20Hail/UI_UX_SPECIFICATION.md), [`UI_IMPLEMENTATION_DIRECTIVE.md`](file:///e:/Project%20Hail/UI_IMPLEMENTATION_DIRECTIVE.md)

---

## 1. HỆ QUY CHIẾU KHÔNG GIAN & CÔNG THỨC CHUYỂN ĐỔI CHUẨN (4:3 VIEWPORT)

### 1.1. Tham số Không Gian Unity Orthographic Scene (`level3`)
Trong engine Unity của game gốc, toàn bộ trạm vũ trụ được dựng trong một không gian 2.5D trực giao (Orthographic Camera) cố định:
- **Tâm máy quay (Camera Center)**: $(X = 0, Y = 0, Z = -10)$. Trục $Z$ quay hướng vào mặt phẳng buồng tàu.
- **Bán chiều cao trực giao (Orthographic Size)**: $14.4\text{ units}$.
- **Kích thước vật lý không gian (World Units)**:
  * Chiều rộng (Stage Width): **$38.4\text{ units}$** (biên độ từ $X = -19.2$ đến $X = +19.2$).
  * Chiều cao (Stage Height): **$28.8\text{ units}$** (biên độ từ $Y = -14.4$ đến $Y = +14.4$).
  * Tỉ lệ khung hình (Aspect Ratio): $\frac{38.4}{28.8} = \frac{4}{3} \approx 1.333333$.
- **Mật độ điểm ảnh (Pixels Per Unit - PPU)**: **$100\text{ px / unit}$**.
- **Kích thước Canvas đồ họa gốc (Native Pixel Space)**:
  * Chiều rộng: $38.4 \times 100 = \mathbf{3840\text{ px}}$.
  * Chiều cao: $28.8 \times 100 = \mathbf{2880\text{ px}}$.
  * Gốc tọa độ Unity $(0, 0)$ nằm chính xác tại tâm ảnh Canvas: $(X = 1920\text{ px}, Y = 1440\text{ px})$.

### 1.2. Công thức toán học chuyển đổi hai chiều (Unity World $\longleftrightarrow$ CSS Canvas %)
Để đảm bảo hiển thị pixel-perfect trên mọi độ phân giải màn hình thông qua CSS/HTML5, tọa độ được chuyển đổi theo hệ thức vi phân sau:

#### Chiều từ Unity World $\rightarrow$ Canvas CSS & Pixel:
$$\text{Center}_X = (\text{wx} + 19.2) \times 100 \quad (\text{px})$$
$$\text{Center}_Y = (14.4 - \text{wy}) \times 100 \quad (\text{px})$$
$$\text{Width}_{\text{px}} = \text{width\_pct} \times 38.40 = \text{width\_units} \times |\text{sx}| \times 100 \quad (\text{px})$$
$$\text{Height}_{\text{px}} = \text{height\_pct} \times 28.80 = \text{height\_units} \times |\text{sy}| \times 100 \quad (\text{px})$$

Tọa độ đỉnh trên-trái (Top-Left Bounding Box):
$$\text{Left}_{\text{px}} = \text{Center}_X - \frac{\text{Width}_{\text{px}}}{2} = \frac{\text{left\_pct}}{100} \times 3840$$
$$\text{Top}_{\text{px}} = \text{Center}_Y - \frac{\text{Height}_{\text{px}}}{2} = \frac{\text{top\_pct}}{100} \times 2880$$

Quy đổi ra phần trăm Canvas phục vụ CSS:
$$\text{left}\% = \frac{\text{Left}_{\text{px}}}{3840} \times 100\% = \left(\frac{\text{wx} + 19.2 - \frac{\text{Width}_{\text{units}} \times |\text{sx}|}{2}}{38.4}\right) \times 100\%$$
$$\text{top}\% = \frac{\text{Top}_{\text{px}}}{2880} \times 100\% = \left(\frac{14.4 - \text{wy} - \frac{\text{Height}_{\text{units}} \times |\text{sy}|}{2}}{28.8}\right) \times 100\%$$

### 1.3. Bảng phân tầng chiều sâu (Unity Sorting Layer & Order $\longleftrightarrow$ CSS z-index)
Hệ thống đồ họa Unity tổ chức chiều sâu qua **Sorting Layer** và **Sorting Order in Layer**. Bảng đối chiếu dưới đây là quy chuẩn bắt buộc để không bị lỗi chồng lớp:

| Unity Sorting Layer | Ý nghĩa trong Unity Scene | Thứ tự hiển thị trong Scene | Đối chiếu CSS `z-index` đề xuất | Đối tượng đại diện tiêu biểu |
| :---: | :--- | :---: | :---: | :--- |
| **Layer 0** | Nền sâu vũ trụ (Background) | Đáy cùng | `z-index: 0` | Nền không gian `SpaceshipSpacesBackground` ngoài cửa sổ |
| **Layer 1** | Ngoại cảnh hành tinh & Vỏ buồng tàu | Lớp 1 | `z-index: 10` | Hành tinh `SurvSpaceshuttlePlanet*`, Vỏ tàu chính `Spaceship.webp` (có lỗ alpha) |
| **Layer 2** | Giá đồ & Vật phẩm kệ vách | Lớp 2 | `z-index: 20` | 9 lon súp, Súng, Sách, Băng dính, Giáp EVA treo tường |
| **Layer 3** | Trạm chức năng vách & **Ghế hàng sau** | Lớp 3 | `z-index: 22` | Máy chế tạo, Ăng-ten thám hiểm, Cánh tủ kệ, **SeatBackLeft, SeatBackRight** |
| **Layer 4** | Hao mòn hư hại ghế hàng sau | Lớp 4 | `z-index: 23` | Vết rách nệm `Seat3WearTear`, `Seat4WearTear` |
| **Layer 5** | Khách ghé thăm trạm phía sau | Lớp 5 | `z-index: 24` | Nhân vật NPC viếng thăm phía sau (Chuột Judy, Sheila...) |
| **Layer 6** | **Ghế hàng trước**, Cần gạt ngày, Đồng hồ | Lớp 6 | `z-index: 30` | **SeatCaptain, SeatRight**, Đòn bẩy `SpaceshipEndday`, Đồng hồ Sol |
| **Layer 7** | Hao mòn hư hại ghế hàng trước | Lớp 7 | `z-index: 31` | Vết rách nệm `Seat1WearTear`, `Seat2WearTear` |
| **Layer 9** | **Bàn Console trung tâm**, Máy tính sự kiện, Điện thoại | Lớp 7 (Tiền cảnh cao) | `z-index: 35` (Console) / `z-index: 40` (Event) | Bàn `SpaceshipConsole`, Máy tính `SpaceshipEvent`, Điện thoại bàn, Cổ vật Artifact |
| **Layer 10**| Sự kiện kết thúc cốt truyện | Gần đỉnh | `z-index: 45` | Nhân vật khách kết thúc game (Hải tặc, Robot...) |
| **Layer 12**| Hoạt ảnh đổ bộ Cutscene | Đỉnh buồng lái | `z-index: 48` | Animation hạ cánh tàu xuống bề mặt hành tinh |

> [!IMPORTANT]
> **Quy luật chiều sâu quan trọng**:
> - Bàn điều khiển trung tâm nằm ở **Layer 9** (`z-index: 35`).
> - Hàng ghế sau (`SeatBackLeft`, `SeatBackRight`) nằm ở **Layer 3** (`z-index: 22`) với tỉ lệ scale $0.63$. Do đó, **hàng ghế sau luôn nằm khuất sau bàn Console**.
> - Hàng ghế trước (`SeatCaptain`, `SeatRight`) nằm ở **Layer 6** (`z-index: 30`) với tỉ lệ scale $1.00$. Hai ghế này nằm ở hai bên cánh gà tiền cảnh (Captain bên trái $X = -9.85$, Right bên phải $X = +9.67$), không bị bàn Console ($X = -0.14$) che khuất.

---

## 2. MA TRẬN 4 VỊ TRÍ GHẾ PHI HÀNH ĐOÀN (CREW SEATS & SLOTS)

### 2.1. Phân Tích Kỹ Thuật Bố Trí Ghế Ngồi
Bốn phi hành gia trong buồng tàu được phân bố thành 2 hàng ghế so le phối cảnh:
1. **Hàng Ghế Trước (Front Row - Scale 1.00)**:
   * **Ghế Thuyền Trưởng (`SeatCaptain`)**: Nằm bên trái góc nhìn, là chiếc ghế bọc da có đệm đỡ đầu màu đỏ đặc trưng. Tọa độ trung tâm $wx = -9.850, wy = -4.190$. Điểm gắn nhân vật tương ứng là `Slots/CharacterSlot0` ($wx = -9.880, wy = -4.850$, scale $-1.00$ lật mặt nhìn vào trung tâm buồng lái).
   * **Ghế Phải Hàng Trước (`SeatRight`)**: Nằm bên phải góc nhìn, ghế tiêu chuẩn màu xanh lam xám. Tọa độ trung tâm $wx = 9.670, wy = -4.840$. Điểm gắn nhân vật tương ứng là `Slots/CharacterSlot1` ($wx = 9.670, wy = -4.840$, scale $1.00$).
2. **Hàng Ghế Sau (Back Row - Scale 0.63)**:
   * **Ghế Trái Hàng Sau (`SeatBackLeft`)**: Nằm lùi sâu về sau, phía bên trái bàn máy tính. Tọa độ $wx = -5.140, wy = -1.920$, scale đồng nhất $0.63$. Thuộc Layer 3 nên **nằm hoàn toàn sau mặt bàn Console (Layer 9)**. Điểm gắn nhân vật `Slots/CharacterSlot2` ($wx = -5.140, wy = -1.920$, scale $-0.63$).
   * **Ghế Phải Hàng Sau (`SeatBackRight`)**: Nằm lùi sâu về sau, phía bên phải bàn máy tính. Tọa độ $wx = 4.860, wy = -1.890$, scale đồng nhất $0.63$. Thuộc Layer 3, nằm sau bàn Console. Điểm gắn nhân vật `Slots/CharacterSlot3` ($wx = 4.860, wy = -1.890$, scale $0.63$).

### 2.2. Bảng Tọa Độ Chuẩn 4 Ghế Ngồi (Seats)
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Ghế Thuyền trưởng (Captain) | `SpaceshipChairCaptain` | 6 | 0 | -9.850 | -4.190 | 1.00 | Không | 12.9557% | 44.9826% | 22.7865% | 39.1319% | 497.50, 1295.50 | 875.00 × 1127.00 | Hàng trước trái, biểu tượng trưởng tàu |
| Ghế Phải hàng trước (Seat Right) | `SpaceshipChair` | 6 | 0 | 9.670 | -4.840 | 1.00 | Không | 63.7630% | 49.5139% | 22.8385% | 34.5833% | 2448.50, 1426.00 | 877.00 × 996.00 | Hàng trước phải, ghế tiêu chuẩn |
| Ghế Trái hàng sau (Back Left) | `SpaceshipChair` | 3 | 0 | -5.140 | -1.920 | 0.63 | Có | 29.4204% | 45.7729% | 14.3883% | 21.7875% | 1129.74, 1318.26 | 552.51 × 627.48 | Hàng sau trái, lùi xa sau bàn Console |
| Ghế Phải hàng sau (Back Right) | `SpaceshipChair` | 3 | 0 | 4.860 | -1.890 | 0.63 | Không | 55.4621% | 45.6687% | 14.3883% | 21.7875% | 2129.74, 1315.26 | 552.51 × 627.48 | Hàng sau phải, lùi xa sau bàn Console |

### 2.3. Bảng Điểm Neo Gắn Nhân Vật (Character Slots)
Bảng điểm gắn gốc Transform của phi hành gia ngồi trên ghế (trích xuất trực tiếp từ các GameObject Slot trong `level3`):
| Slot ID | World X (wx) | World Y (wy) | Scale (sx, sy) | Đảo trục (Flip) | Tỷ lệ Canvas (X%, Y%) | Điểm Neo Pixel (X, Y) | Vị trí Ghế Ngồi Tương Ứng |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Slots/CharacterSlot0 | -9.880 | -4.850 | -1.00, 1.00 | Có (sx < 0) | 24.2708% / 66.8403% | 932.00 px / 1925.00 px | Ghế Thuyền trưởng (SeatCaptain - Hàng trước trái) |
| Slots/CharacterSlot1 | 9.670 | -4.840 | 1.00, 1.00 | Không | 75.1823% / 66.8056% | 2887.00 px / 1924.00 px | Ghế Phải hàng trước (SeatRight - Hàng trước phải) |
| Slots/CharacterSlot2 | -5.140 | -1.920 | -0.63, 0.63 | Có (sx < 0) | 36.6146% / 56.6667% | 1406.00 px / 1632.00 px | Ghế Trái hàng sau (SeatBackLeft - Hàng sau trái) |
| Slots/CharacterSlot3 | 4.860 | -1.890 | 0.63, 0.63 | Không | 62.6563% / 56.5625% | 2406.00 px / 1629.00 px | Ghế Phải hàng sau (SeatBackRight - Hàng sau phải) |

### 2.4. Bảng Vết Rách & Hao Mòn Ghế Ngồi (Seat Wear & Tear Damage)
Khi phi hành đoàn gặp sự cố hoặc thời gian sinh tồn kéo dài, ghế sẽ hiển thị các lớp phủ hư hại:
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Ghế 1 Hao mòn cấp 1 | `SpaceshuttleDamageChair01` | 7 | 0 | -9.876 | -4.826 | 1.00 | Có | 16.8724% | 50.3333% | 17.6823% | 22.2222% | 647.90, 1449.60 | 679.00 × 640.00 | Vết cào rách nhỏ ghế Thuyền trưởng |
| Ghế 1 Hao mòn cấp 2 | `SpaceshuttleDamageChair02` | 7 | 0 | -9.850 | -4.835 | 1.00 | Có | 17.5130% | 50.3299% | 17.0573% | 22.1875% | 672.50, 1449.50 | 655.00 × 639.00 | Vết rách trung bình ghế Thuyền trưởng |
| Ghế 1 Hao mòn cấp 3 | `SpaceshuttleDamageChair03` | 7 | 0 | -9.859 | -4.840 | 1.00 | Có | 17.4115% | 50.1389% | 16.9271% | 22.3958% | 668.60, 1444.00 | 650.00 × 645.00 | Vết nứt toác lớn ghế Thuyền trưởng |
| Ghế 1 Ghế hỏng hoàn toàn | `SpaceshuttleDamageCptChair` | 7 | 0 | -9.860 | -4.170 | 1.00 | Không | 13.8151% | 45.7118% | 16.2500% | 26.8403% | 530.50, 1316.50 | 624.00 × 773.00 | Ghế cơ trưởng rách toàn bộ đệm |
| Ghế 2 Hao mòn cấp 1 | `SpaceshuttleDamageChair01` | 7 | 0 | 9.680 | -4.840 | 1.00 | Không | 67.7995% | 50.3819% | 17.6823% | 22.2222% | 2603.50, 1451.00 | 679.00 × 640.00 | Vết rách nhẹ ghế trước phải |
| Ghế 2 Hao mòn cấp 2 | `SpaceshuttleDamageChair02` | 7 | 0 | 9.660 | -4.835 | 1.00 | Không | 68.3203% | 50.3299% | 17.0573% | 22.1875% | 2623.50, 1449.50 | 655.00 × 639.00 | Vết nứt đệm ghế trước phải |
| Ghế 2 Hao mòn cấp 3 | `SpaceshuttleDamageChair03` | 7 | 0 | 9.600 | -4.840 | 1.00 | Không | 68.0859% | 50.1389% | 16.9271% | 22.3958% | 2614.50, 1444.00 | 650.00 × 645.00 | Vết bung lò xo ghế trước phải |
| Ghế 3 Hao mòn cấp 1 | `SpaceshuttleDamageChair01` | 4 | 0 | -5.160 | -1.902 | 0.63 | Có | 31.9275% | 46.3296% | 11.0620% | 13.9022% | 1226.02, 1334.29 | 424.78 × 400.38 | Vết rách nhẹ ghế sau trái |
| Ghế 3 Hao mòn cấp 2 | `SpaceshuttleDamageChair02` | 4 | 0 | -5.149 | -1.925 | 0.63 | Có | 32.3146% | 46.3877% | 10.6710% | 13.8805% | 1240.88, 1335.97 | 409.77 × 399.76 | Vết nứt toác ghế sau trái |
| Ghế 3 Hao mòn cấp 3 | `SpaceshuttleDamageChair03` | 4 | 0 | -5.127 | -1.930 | 0.63 | Có | 32.3230% | 46.2747% | 10.5896% | 14.0108% | 1241.20, 1332.71 | 406.64 × 403.51 | Vết phá hủy nặng ghế sau trái |
| Ghế 4 Hao mòn cấp 1 | `SpaceshuttleDamageChair01` | 4 | 0 | 4.881 | -1.871 | 0.63 | Không | 58.0760% | 46.2219% | 11.0620% | 13.9022% | 2230.12, 1331.19 | 424.78 × 400.38 | Vết rách nhẹ ghế sau phải |
| Ghế 4 Hao mòn cấp 2 | `SpaceshuttleDamageChair02` | 4 | 0 | 4.862 | -1.888 | 0.63 | Không | 58.3849% | 46.2592% | 10.6710% | 13.8805% | 2241.98, 1332.26 | 409.77 × 399.76 | Vết nứt toác ghế sau phải |
| Ghế 4 Hao mòn cấp 3 | `SpaceshuttleDamageChair03` | 4 | 0 | 4.848 | -1.899 | 0.63 | Không | 58.2996% | 46.1671% | 10.5896% | 14.0108% | 2238.70, 1329.61 | 406.64 × 403.51 | Vết phá hủy nặng ghế sau phải |

---

## 3. MA TRẬN TỌA ĐỘ LƯỚI 3×3 CỦA 9 LON SÚP KỆ TRÁI (SOUP01 - SOUP09)

### 3.1. Cấu Trúc Bố Trí Lưới 3 Tầng × 3 Cột
Trong khoang tàu, 9 lon lương thực súp đóng hộp (`SpaceshipItemSoup`) được xếp ngăn nắp trên tủ kệ vách trái (`SpaceshipLeftShelf`). Cấu trúc không gian là một lưới ma trận 3×3 chính xác:
- **Tầng 3 (Hàng trên cùng, độ cao $wy \approx 6.27 - 6.89$)**: Gồm Soup07, Soup08, Soup09.
- **Tầng 2 (Hàng giữa, độ cao $wy \approx 4.80 - 5.11$)**: Gồm Soup04, Soup05, Soup06.
- **Tầng 1 (Hàng dưới cùng, độ cao $wy \approx 3.28 - 3.33$)**: Gồm Soup01, Soup02, Soup03.
- **Cột 1 (Sát mép trái, $wx \approx -13.20$, Sorting Order: 2)**: Gồm Soup01, Soup04, Soup07.
- **Cột 2 (Cột giữa, $wx \approx -12.20$, Sorting Order: 1)**: Gồm Soup02, Soup05, Soup08.
- **Cột 3 (Cột trong cùng, $wx \approx -11.30$, Sorting Order: 0)**: Gồm Soup03, Soup06, Soup09.

> [!NOTE]
> Tất cả 9 lon súp đều nằm ở **Layer 2** (Sorting Layer dành cho vật phẩm kệ). Thứ tự vẽ (`ord`) giảm dần từ Cột 1 (ord = 2) $\rightarrow$ Cột 2 (ord = 1) $\rightarrow$ Cột 3 (ord = 0), giúp tạo cảm giác lon bên ngoài che lấp nhẹ viền của lon bên trong, tạo chiều sâu thị giác.

### 3.2. Bảng Tọa Độ Chuẩn 9 Lon Súp (Lưới 3×3)
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Lon Súp 01 (Hàng 1, Cột 1) | `SpaceshipItemSoup01` | 2 | 2 | -13.156 | 3.326 | 1.00 | Không | 14.3333% | 35.7951% | 2.8125% | 5.3125% | 550.40, 1030.90 | 108.00 × 153.00 | Tầng 1 dưới cùng, ngoài cùng bên trái |
| Lon Súp 02 (Hàng 1, Cột 2) | `SpaceshipItemSoup02` | 2 | 1 | -12.198 | 3.295 | 1.00 | Không | 16.9323% | 36.0590% | 2.6042% | 5.0000% | 650.20, 1038.50 | 100.00 × 144.00 | Tầng 1 dưới cùng, ở giữa |
| Lon Súp 03 (Hàng 1, Cột 3) | `SpaceshipItemSoup03` | 2 | 0 | -11.295 | 3.280 | 1.00 | Không | 19.3750% | 36.3021% | 2.4219% | 4.6181% | 744.00, 1045.50 | 93.00 × 133.00 | Tầng 1 dưới cùng, bên phải |
| Lon Súp 04 (Hàng 2, Cột 1) | `SpaceshipItemSoup04` | 2 | 2 | -13.192 | 5.109 | 1.00 | Không | 14.1875% | 29.5521% | 2.9167% | 5.4167% | 544.80, 851.10 | 112.00 × 156.00 | Tầng 2 ở giữa, ngoài cùng bên trái |
| Lon Súp 05 (Hàng 2, Cột 2) | `SpaceshipItemSoup05` | 2 | 1 | -12.221 | 4.959 | 1.00 | Không | 16.7943% | 30.2465% | 2.7604% | 5.0694% | 644.90, 871.10 | 106.00 × 146.00 | Tầng 2 ở giữa, cột giữa |
| Lon Súp 06 (Hàng 2, Cột 3) | `SpaceshipItemSoup06` | 2 | 0 | -11.316 | 4.800 | 1.00 | Không | 19.2682% | 30.9896% | 2.5260% | 4.6875% | 739.90, 892.50 | 97.00 × 135.00 | Tầng 2 ở giữa, bên phải |
| Lon Súp 07 (Hàng 3, Cột 1) | `SpaceshipItemSoup07` | 2 | 2 | -13.205 | 6.887 | 1.00 | Không | 14.1536% | 23.3958% | 2.9167% | 5.3819% | 543.50, 673.80 | 112.00 × 155.00 | Tầng 3 trên cùng, ngoài cùng bên trái |
| Lon Súp 08 (Hàng 3, Cột 2) | `SpaceshipItemSoup08` | 2 | 1 | -12.199 | 6.573 | 1.00 | Không | 16.8646% | 24.6597% | 2.7344% | 5.0347% | 647.60, 710.20 | 105.00 × 145.00 | Tầng 3 trên cùng, cột giữa |
| Lon Súp 09 (Hàng 3, Cột 3) | `SpaceshipItemSoup09` | 2 | 0 | -11.291 | 6.274 | 1.00 | Không | 19.3594% | 25.9410% | 2.4740% | 4.5486% | 743.40, 747.10 | 95.00 × 131.00 | Tầng 3 trên cùng, bên phải |

### 3.3. Các Ngăn Tủ Cửa Đóng Của Kệ Trái (`SpaceshipLeftShelf`)
Khi các ngăn kệ chứa đồ hoặc đóng cánh tủ, vị trí của 4 cánh cửa tủ tương ứng:
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Cánh tủ kệ trái 1 (Tầng trên) | `SpaceshipShelfLeftClosed0` | 3 | 1 | -12.095 | 6.921 | 1.00 | Không | 12.7995% | 20.8646% | 11.4063% | 10.2083% | 491.50, 600.90 | 438.00 × 294.00 | Cửa tủ che tầng trên |
| Cánh tủ kệ trái 2 (Tầng giữa) | `SpaceshipShelfLeftClosed1` | 3 | 2 | -12.133 | 5.316 | 1.00 | Không | 12.5964% | 27.3750% | 11.6146% | 8.3333% | 483.70, 788.40 | 446.00 × 240.00 | Cửa tủ che tầng giữa |
| Cánh tủ kệ trái 3 (Tầng dưới) | `SpaceshipShelfLeftClosed2` | 3 | 3 | -12.129 | 3.561 | 1.00 | Không | 12.6458% | 34.0243% | 11.5365% | 7.2222% | 485.60, 979.90 | 443.00 × 208.00 | Cửa tủ che tầng dưới |
| Cánh tủ kệ trái 4 (Đáy kệ) | `SpaceshipShelfLeftClosed3` | 3 | 4 | -12.086 | 1.500 | 1.00 | Không | 12.7969% | 40.9201% | 11.4583% | 7.7431% | 491.40, 1178.50 | 440.00 × 223.00 | Cửa tủ ngăn đáy cùng |
| Cánh tủ kệ phải (Right Shelf) | `SpaceshipShelfRightClosed` | 3 | 1 | 11.806 | 4.189 | 1.00 | Không | 74.7812% | 27.4167% | 11.9271% | 16.0764% | 2871.60, 789.60 | 458.00 × 463.00 | Cửa tủ vách phải (chứa Pin/Sách) |

---

## 4. MA TRẬN TỌA ĐỘ TOÀN BỘ TRANG BỊ BUỒNG TÀU (EQUIPMENT INVENTORY)

Tất cả trang bị sinh tồn và kỹ thuật được định vị chính xác tại các vị trí giá đỡ và kệ đồ trong trạm. Dưới đây là ma trận tọa độ đầy đủ cho mọi biến thể:

### 4.1. Súng Bảo Vệ Trạm (Gun / Weapon)
Vị trí đặt: Kệ vách phải trên cao ($wx \approx 11.812, wy \approx 6.583$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Súng Chuẩn (Standard) | `SpaceshipItemGun` | 2 | 0 | 11.812 | 6.583 | 1.00 | Không | 74.5104% | 19.4688% | 12.5000% | 15.3472% | 2861.20, 560.70 | 480.00 × 442.00 | Vũ khí cơ bản |
| Súng Nâng cấp (Upgraded) | `SpaceshipItemGunUpgrade` | 2 | 0 | 11.812 | 6.583 | 1.00 | Không | 74.5104% | 19.4688% | 12.5000% | 15.3472% | 2861.20, 560.70 | 480.00 × 442.00 | Vũ khí nâng cấp laser |
| Súng Hỏng (Damaged) | `SpaceshipItemGunDamaged` | 2 | 0 | 11.812 | 6.583 | 1.00 | Không | 74.5104% | 19.4688% | 12.5000% | 15.3472% | 2861.20, 560.70 | 480.00 × 442.00 | Súng kẹt đạn/cháy nòng |
| Súng Nâng cấp Bị hỏng | `SpaceshipItemGunUpgradeDamaged` | 2 | 0 | 11.812 | 6.583 | 1.00 | Không | 74.5104% | 19.4688% | 12.5000% | 15.3472% | 2861.20, 560.70 | 480.00 × 442.00 | Súng laser hỏng tụ điện |

### 4.2. Sách Cẩm Nang Hướng Dẫn (Handbook / Book)
Vị trí đặt: Kệ vách phải giữa ($wx \approx 11.105 - 11.198, wy \approx 2.402 - 2.497$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Sách Chuẩn (Standard) | `SpaceshipItemBook` | 2 | 0 | 11.191 | 2.406 | 1.00 | Không | 75.8880% | 36.6806% | 6.5104% | 9.9306% | 2914.10, 1056.40 | 250.00 × 286.00 | Sổ tay sinh tồn |
| Sách Nâng cấp (Upgraded) | `SpaceshipItemBookUpgrade` | 2 | 0 | 11.172 | 2.419 | 1.00 | Không | 75.7604% | 36.2535% | 6.6667% | 10.6944% | 2909.20, 1044.10 | 256.00 × 308.00 | Cẩm nang nâng cấp chuyên sâu |
| Sách Hỏng (Damaged) | `SpaceshipItemBookDamaged` | 2 | 0 | 11.198 | 2.497 | 1.00 | Không | 75.9844% | 36.0521% | 6.3542% | 10.5556% | 2917.80, 1038.30 | 244.00 × 304.00 | Sách rách bìa, thấm nước |
| Sách Nâng cấp Bị hỏng | `SpaceshipItemBookUpgradeDamaged` | 2 | 0 | 11.105 | 2.402 | 1.00 | Không | 75.4036% | 36.3819% | 7.0313% | 10.5556% | 2895.50, 1047.80 | 270.00 × 304.00 | Cẩm nang nâng cấp rách trang |

### 4.3. Cuộn Băng Keo Đa Năng (Duct Tape / Duckttape)
Vị trí đặt: Kệ vách phải tầng thấp ($wx \approx 12.556 - 13.561, wy \approx 0.710 - 2.251$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Băng keo Chuẩn (Standard) | `SpaceshipItemDuckttape` | 2 | 1 | 13.561 | 1.685 | 1.00 | Không | 81.4870% | 42.9861% | 5.1042% | 7.5000% | 3129.10, 1238.00 | 196.00 × 216.00 | Cuộn băng keo bạc |
| Băng keo Nâng cấp (Upgraded) | `SpaceshipItemDuckttapeUpgrade` | 2 | 1 | 12.556 | 2.063 | 1.00 | Không | 80.5885% | 36.5000% | 5.9375% | 11.2153% | 3094.60, 1051.20 | 228.00 × 323.00 | Băng keo kỹ thuật siêu dính |
| Băng keo Hỏng (Damaged) | `SpaceshipItemDuckttapeDamaged` | 2 | 1 | 13.210 | 0.710 | 1.00 | Không | 82.3047% | 45.0000% | 4.1927% | 5.0694% | 3160.50, 1296.00 | 161.00 × 146.00 | Cuộn băng keo khô keo/nát |
| Băng keo Nâng cấp Bị hỏng | `SpaceshipItemDuckttapeUpgradeDamaged` | 2 | 1 | 12.956 | 2.251 | 1.00 | Không | 80.9531% | 36.8542% | 5.5729% | 10.6597% | 3108.60, 1061.40 | 214.00 × 307.00 | Băng dính kỹ thuật biến chất |

### 4.4. Mặt Nạ / Mũ Dưỡng Khí (Mask / Helmet)
Vị trí đặt: Móc treo vách trên cao ($wx \approx 7.596 - 7.820, wy \approx 6.629 - 7.041$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Mặt nạ Chuẩn (Standard) | `SpaceshipItemMask` | 2 | 0 | 7.820 | 7.041 | 1.00 | Không | 67.9427% | 19.6493% | 5.0260% | 10.4514% | 2609.00, 565.90 | 193.00 × 301.00 | Mặt nạ dưỡng khí phòng độc |
| Mặt nạ Nâng cấp (Upgraded) | `SpaceshipItemMaskUpgrade` | 2 | 0 | 7.820 | 7.041 | 1.00 | Không | 67.7604% | 19.6493% | 5.2083% | 11.8056% | 2602.00, 565.90 | 200.00 × 340.00 | Mũ giáp phi hành nâng cấp |
| Mặt nạ Hỏng (Damaged) | `SpaceshipItemMaskDamaged` | 2 | 0 | 7.596 | 6.816 | 1.00 | Không | 67.9974% | 22.6181% | 3.5677% | 7.4306% | 2611.10, 651.40 | 137.00 × 214.00 | Kính mặt nạ nứt vỡ |
| Mặt nạ Nâng cấp Bị hỏng | `SpaceshipItemMaskUpgradeDamaged` | 2 | 0 | 7.685 | 6.629 | 1.00 | Không | 67.6953% | 22.5035% | 4.6354% | 8.9583% | 2599.50, 648.10 | 178.00 × 258.00 | Mặt nạ nâng cấp thủng màng lọc |

### 4.5. Hộp Sơ Cứu Y Tế (Medkit)
Vị trí đặt: Hộc tủ y tế góc cực trái ($wx \approx -17.402 - -17.416, wy \approx 5.528 - 5.613$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Hộp y tế Chuẩn (Standard) | `SpaceshipItemMedkit` | 2 | 0 | -17.402 | 5.613 | 1.00 | Không | 1.1536% | 26.1875% | 7.0573% | 8.6458% | 44.30, 754.20 | 271.00 × 249.00 | Hộp cứu thương cơ bản |
| Hộp y tế Nâng cấp (Upgraded) | `SpaceshipItemMedkitUpgrade` | 2 | 0 | -17.416 | 5.528 | 1.00 | Không | 0.8568% | 26.3438% | 7.5781% | 8.9236% | 32.90, 758.70 | 291.00 × 257.00 | Trạm cấp cứu dã chiến nâng cao |

### 4.6. Vớ Sinh Tồn May Vá (Sock)
Vị trí đặt: Móc treo góc trên cùng bên trái ($wx \approx -17.363, wy \approx 8.317$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Vớ Chuẩn (Standard) | `SpaceshipItemSock` | 2 | 0 | -17.363 | 8.317 | 1.00 | Không | 0.2917% | 16.2431% | 8.9844% | 9.7569% | 11.20, 467.80 | 345.00 × 281.00 | Chiếc vớ sinh tồn len |
| Vớ Nâng cấp (Upgraded) | `SpaceshipItemSockUpgrade` | 2 | 0 | -17.363 | 8.317 | 1.00 | Không | 0.2917% | 16.2431% | 8.9844% | 9.7569% | 11.20, 467.80 | 345.00 × 281.00 | Vớ bọc cách nhiệt bảo hộ |

### 4.7. Xẻng Địa Chất (Shovel)
Vị trí đặt: Dựa vào vách trái cạnh bàn chế tạo ($wx \approx -7.860 - -9.131, wy \approx -1.290 - 0.242$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Xẻng Chuẩn (Standard) | `SpaceshipItemShovel` | 3 | 5 | -9.131 | 0.154 | 1.00 | Không | 23.3047% | 37.8160% | 6.9010% | 24.0972% | 894.90, 1089.10 | 265.00 × 694.00 | Xẻng cán dài khai khoáng |
| Xẻng Nâng cấp (Upgraded) | `SpaceshipItemShovelUpgrade` | 3 | 5 | -9.131 | 0.154 | 1.00 | Không | 22.1328% | 37.0174% | 8.1771% | 24.4792% | 849.90, 1066.10 | 314.00 × 705.00 | Xẻng địa chất mũi tôi cứng |
| Xẻng Hỏng (Damaged) | `SpaceshipItemShovelDamaged` | 1 | 5 | -7.860 | -1.290 | 1.00 | Không | 26.0156% | 47.0486% | 7.0313% | 14.8611% | 999.00, 1355.00 | 270.00 × 428.00 | Xẻng gãy cán nằm nghiêng |
| Xẻng Nâng cấp Bị hỏng | `SpaceshipItemShovelUpgradeDamaged` | 3 | 5 | -9.131 | 0.242 | 1.00 | Không | 22.1328% | 36.9028% | 8.1771% | 24.5139% | 849.90, 1062.80 | 314.00 × 706.00 | Xẻng nâng cấp cong lưỡi |

### 4.8. Khối Pin Năng Lượng Dự Trữ (Battery)
Vị trí đặt: Sàn buồng tàu góc phải dưới ($wx \approx 13.777 - 13.979, wy \approx -7.158 - -6.497$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Pin Chuẩn (Standard) | `SpaceshipItemBattery` | 2 | 0 | 13.979 | -6.873 | 1.00 | Không | 81.9896% | 67.1979% | 8.8281% | 13.3333% | 3148.40, 1935.30 | 339.00 × 384.00 | Khối ắc quy công nghiệp |
| Pin Nâng cấp (Upgraded) | `SpaceshipItemBatteryUpgrade` | 2 | 0 | 13.914 | -6.497 | 1.00 | Không | 81.6510% | 64.5556% | 9.1667% | 16.0069% | 3135.40, 1859.20 | 352.00 × 461.00 | Cell pin hạt nhân ion nâng cấp |
| Pin Hỏng (Damaged) | `SpaceshipItemBatteryDamaged` | 2 | 0 | 13.777 | -7.073 | 1.00 | Không | 81.7370% | 67.1979% | 8.2813% | 14.7222% | 3138.70, 1935.30 | 318.00 × 424.00 | Ắc quy rò rỉ hóa chất |
| Pin Nâng cấp Bị hỏng | `SpaceshipItemBatteryUpgradeDamaged` | 2 | 0 | 13.862 | -7.158 | 1.00 | Không | 81.3464% | 68.7431% | 9.5052% | 12.2222% | 3123.70, 1979.80 | 365.00 × 352.00 | Cell hạt nhân quá nhiệt phồng rộp |

### 4.9. Bộ Đàm Vô Tuyến Cầm Tay (Communicator - Floor Item)
Vị trí đặt: Sàn buồng lái góc cực trái dưới chân ($wx \approx -15.460 - -15.610, wy \approx -8.104 - -8.990$). Thuộc Layer 9.
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Bộ đàm Chuẩn (Standard) | `SpaceshipItemCommunicator` | 9 | 3 | -15.460 | -8.990 | 1.00 | Không | 3.7630% | 75.1910% | 11.9531% | 12.0486% | 144.50, 2165.50 | 459.00 × 347.00 | Máy thu phát vô tuyến xách tay |
| Bộ đàm Nâng cấp (Upgraded) | `SpaceshipItemCommunicatorUpgrade` | 9 | 3 | -15.540 | -8.104 | 1.00 | Không | 3.3203% | 69.0243% | 12.4219% | 18.2292% | 127.50, 1987.90 | 477.00 × 525.00 | Bộ đàm tích hợp ăng-ten tầm xa |
| Bộ đàm Hỏng (Damaged) | `SpaceshipItemCommunicatorDamaged` | 9 | 3 | -15.460 | -8.990 | 1.00 | Không | 3.9323% | 75.2257% | 11.6146% | 11.9792% | 151.00, 2166.50 | 446.00 × 345.00 | Bộ đàm cháy vi mạch |
| Bộ đàm Nâng cấp Bị hỏng | `SpaceshipItemCommunicatorUpgradeDamaged` | 9 | 3 | -15.610 | -8.630 | 1.00 | Không | 3.3073% | 72.7257% | 12.0833% | 14.4792% | 127.00, 2094.50 | 464.00 × 417.00 | Bộ đàm tầm xa gãy ăng-ten |

### 4.10. Cổ Vật Vũ Trụ Huyền Bí (Artifact - On Console Table)
Vị trí đặt: Đặt ngay trên mặt bàn Console trung tâm ($wx \approx 0.016 - 0.261, wy \approx -1.774 - -1.960$), scale nhỏ $0.63$, Layer 9.
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Cổ vật Chuẩn (Standard) | `SpaceshipItemArtifact` | 9 | 1 | 0.016 | -1.774 | 0.63 | Không | 47.8514% | 50.2535% | 4.3805% | 11.8125% | 1837.49, 1447.30 | 168.21 × 340.20 | Phiến đá bí ẩn cổ đại |
| Cổ vật Nâng cấp (Upgraded) | `SpaceshipItemArtifactUpgraded` | 9 | 1 | 0.016 | -1.774 | 0.63 | Không | 47.8514% | 50.2535% | 4.3805% | 11.8125% | 1837.49, 1447.30 | 168.21 × 340.20 | Cổ vật phát sáng năng lượng |
| Cổ vật Hỏng (Damaged) | `SpaceshipItemArtifactDamaged` | 9 | 1 | 0.261 | -1.957 | 0.63 | Không | 47.8496% | 50.3201% | 5.6602% | 12.9500% | 1837.42, 1449.22 | 217.35 × 372.96 | Phiến cổ vật nứt mẻ |
| Cổ vật Nâng cấp Bị hỏng | `SpaceshipItemArtifactUpgradedDamaged` | 9 | 1 | 0.191 | -1.960 | 0.63 | Không | 47.4786% | 50.3196% | 6.0375% | 12.9719% | 1823.18, 1449.20 | 231.84 × 373.59 | Cổ vật nâng cấp rò rỉ bức xạ |

### 4.11. Bộ Đồ Thám Hiểm & Áo Giáp EVA (Armor & Suit)
Vị trí giá treo: Khung treo đồ bảo hộ vách phải buồng tàu ($wx \approx 5.494 - 5.594, wy \approx 1.540 - 4.218$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Bộ đồ EVA Cấp 1 (Suit Level 1) | `SpaceshipItemSuit` | 2 | 0 | 5.554 | 1.540 | 1.00 | Không | 59.7109% | 30.4340% | 9.5052% | 28.4375% | 2292.90, 876.50 | 365.00 × 819.00 | Bộ đồ du hành cơ bản |
| Bộ đồ EVA Cấp 2 (Suit Level 2) | `SpaceshipItemSuitLevel2` | 2 | 0 | 5.554 | 1.540 | 1.00 | Không | 59.7109% | 30.3993% | 9.5052% | 28.5069% | 2292.90, 875.50 | 365.00 × 821.00 | Bộ đồ du hành gia cường |
| Bộ đồ EVA Cấp 3 (Suit Level 3) | `SpaceshipItemSuitLevel3` | 2 | 0 | 5.554 | 1.540 | 1.00 | Không | 59.6589% | 30.3819% | 9.6094% | 28.5417% | 2290.90, 875.00 | 369.00 × 822.00 | Bộ đồ du hành tối tân |
| Móc treo không giáp (Hanger) | `SpaceshipItemArmorHanger` | 2 | 1 | 5.494 | 4.218 | 1.00 | Không | 59.9062% | 30.7708% | 8.8021% | 9.1667% | 2300.40, 886.20 | 338.00 × 264.00 | Móc treo rỗng khi mang ra ngoài |
| Giáp rời Chuẩn (Armor Only) | `SpaceshipItemArmor` | 2 | 1 | 5.557 | 2.925 | 1.00 | Không | 59.9010% | 30.7639% | 9.1406% | 18.1597% | 2300.20, 886.00 | 351.00 × 523.00 | Giáp thân treo riêng |
| Giáp rời Nâng cấp (Armor Upgraded) | `SpaceshipItemArmorUpgraded` | 2 | 1 | 5.594 | 2.925 | 1.00 | Không | 59.7240% | 30.7639% | 9.5312% | 18.1597% | 2293.40, 886.00 | 366.00 × 523.00 | Giáp thân titan nâng cấp |
| Giáp rời Hỏng (Armor Damaged) | `SpaceshipItemArmorDamaged` | 2 | 1 | 5.557 | 2.925 | 1.00 | Không | 59.9010% | 30.7639% | 8.8542% | 17.6736% | 2300.20, 886.00 | 340.00 × 509.00 | Giáp thân thủng nứt mẻ |
| Giáp rời Nâng cấp Bị hỏng | `SpaceshipItemArmorUpgradedDamaged` | 2 | 1 | 5.594 | 2.925 | 1.00 | Không | 59.8281% | 30.7639% | 9.2448% | 18.1597% | 2297.40, 886.00 | 355.00 × 523.00 | Giáp titan bị nứt tấm chắn |
| Giáp gắn trên Suit (With Suit) | `SpaceshipItemSuitArmor` | 2 | 1 | 5.557 | 2.470 | 1.00 | Không | 60.0052% | 35.2257% | 8.9323% | 12.3958% | 2304.20, 1014.50 | 343.00 × 357.00 | Tấm giáp cài vào bộ đồ EVA |
| Giáp nâng cấp gắn trên Suit | `SpaceshipItemSuitArmorUpgraded` | 2 | 1 | 5.557 | 2.470 | 1.00 | Không | 59.8099% | 35.1215% | 9.3229% | 12.6042% | 2296.70, 1011.50 | 358.00 × 363.00 | Giáp nâng cấp cài vào bộ đồ EVA |
| Giáp hỏng gắn trên Suit | `SpaceshipItemSuitArmorDamaged` | 2 | 1 | 5.557 | 2.470 | 1.00 | Không | 60.1094% | 35.2257% | 8.6458% | 12.0139% | 2308.20, 1014.50 | 332.00 × 346.00 | Giáp hỏng gắn trên bộ đồ EVA |
| Giáp nâng cấp hỏng gắn trên Suit | `SpaceshipItemSuitArmorUpgradedDamaged` | 2 | 1 | 5.557 | 2.470 | 1.00 | Không | 59.8359% | 35.1215% | 9.2708% | 12.6042% | 2297.70, 1011.50 | 356.00 × 363.00 | Giáp nâng cấp hỏng trên suit |

### 4.12. Bật Lửa Đốt Nhiệt (Lighter)
Vị trí đặt: Hộc phụ vách trái ($wx \approx -11.011 - -11.188, wy \approx 1.690 - 1.783$).
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Bật lửa Chuẩn (Standard) | `SpaceshipItemLighter` | 2 | 0 | -11.036 | 1.724 | 1.00 | Không | 18.9948% | 41.0625% | 4.6094% | 5.5556% | 729.40, 1182.60 | 177.00 × 160.00 | Bật lửa gas tiêu chuẩn |
| Bật lửa Nâng cấp (Upgraded) | `SpaceshipItemLighterUpgrade` | 2 | 0 | -11.036 | 1.724 | 1.00 | Không | 18.9167% | 41.2361% | 3.9844% | 5.7292% | 726.40, 1187.60 | 153.00 × 165.00 | Bật lửa hàn plasma nâng cấp |
| Bật lửa Hỏng (Damaged) | `SpaceshipItemLighterDamaged` | 2 | 0 | -11.011 | 1.783 | 1.00 | Không | 19.0469% | 41.0660% | 4.5573% | 5.4861% | 731.40, 1182.70 | 175.00 × 158.00 | Bật lửa kẹt đá mồi |
| Bật lửa Nâng cấp Bị hỏng | `SpaceshipItemLighterUpgradeDamaged` | 2 | 0 | -11.188 | 1.690 | 1.00 | Không | 18.9245% | 41.3021% | 3.8802% | 5.6597% | 726.70, 1189.50 | 149.00 × 163.00 | Bật lửa hàn plasma chập điện |

---

## 5. CỤM BÀN ĐIỀU KHIỂN CONSOLE TRUNG TÂM (CENTRAL CONSOLE CLUSTER)

### 5.1. Bàn Console & Màn Hình Sự Kiện Starlog Event
Cụm điều khiển trung tâm là trái tim tương tác của trạm, tọa lạc ngay trung tâm buồng lái:
- **Thân bàn Console (`SpaceshipConsole`)**: Chiếc bàn kim loại lớn hình bán nguyệt ôm lấy trước mặt phi hành gia. Đặt tại $wx = -0.140, wy = -5.970$, chiếm $26.98\%$ chiều ngang và $33.33\%$ chiều cao Canvas. Nằm ở **Layer 9 (Order 0)**.
- **Màn hình máy tính sự kiện (`SpaceshipEvent`)**: Màn hình CRT hiển thị các sự cố hàng ngày và điện tín gửi từ NASA. Đặt tại $wx = -1.029, wy = -5.923$, **Layer 9 (Order 2)**.
- **Cụm đèn chỉ thị trạng thái sự kiện**: Nằm ở góc trên màn hình máy tính ($wx = -0.661, wy = -3.639$, **Layer 9, Order 4**), đổi màu theo mức độ khẩn cấp (Xanh/Đỏ/Vàng).
- **Điện thoại bàn liên lạc (`ConsoleCommunicator`)**: Chiếc điện thoại ống nghe quay số màu cam cổ điển gắn trực tiếp vào cạnh trái bàn điều khiển ($wx \approx -3.031 - -3.350, wy \approx -6.020 - -7.016$, **Layer 9, Order 1**).

### 5.2. Bảng Tọa Độ Cụm Bàn Console & Thiết Bị Đi Kèm
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Bàn điều khiển chính (Console) | `SpaceshipConsole` | 9 | 0 | -0.140 | -5.970 | 1.00 | Không | 36.1458% | 54.0625% | 26.9792% | 33.3333% | 1388.00, 1557.00 | 1036.00 × 960.00 | Khung bàn trung tâm buồng lái |
| Màn hình máy tính (Event Computer) | `SpaceshipEvent` | 9 | 2 | -1.029 | -5.923 | 1.00 | Không | 44.3516% | 61.6250% | 10.5469% | 16.4931% | 1703.10, 1774.80 | 405.00 × 475.00 | Màn hình máy tính tương tác Sol |
| Đèn sự kiện Xanh (Green Light) | `SpaceshipEventLightGreen` | 9 | 4 | -0.661 | -3.639 | 1.00 | Không | 45.3359% | 58.6771% | 5.8854% | 7.9167% | 1740.90, 1689.90 | 226.00 × 228.00 | Trạng thái bình thường/an toàn |
| Đèn sự kiện Đỏ (Red Light) | `SpaceshipEventLightRed` | 9 | 4 | -0.661 | -3.639 | 1.00 | Không | 45.3359% | 58.6771% | 5.8854% | 7.9167% | 1740.90, 1689.90 | 226.00 × 228.00 | Trạng thái khẩn cấp/báo động |
| Đèn sự kiện Vàng (Yellow Light) | `SpaceshipEventLightYellow` | 9 | 4 | -0.661 | -3.639 | 1.00 | Không | 37.3542% | 47.8611% | 21.8490% | 29.5486% | 1434.40, 1378.40 | 839.00 × 851.00 | Vùng ánh sáng vàng tỏa ra |
| Điện thoại bàn Chuẩn (State 1) | `SpaceshipConsoleCommunicator` | 9 | 1 | -3.173 | -6.922 | 1.00 | Không | 35.0052% | 60.4583% | 13.4635% | 27.1528% | 1344.20, 1741.20 | 517.00 × 782.00 | Điện thoại liên lạc nguyên vẹn |
| Điện thoại bàn Hỏng (State 2) | `SpaceshipConsoleCommunicatorBroken` | 9 | 1 | -3.031 | -7.016 | 1.00 | Không | 35.9089% | 61.1146% | 12.3958% | 26.4931% | 1378.90, 1760.10 | 476.00 × 763.00 | Điện thoại vỡ nát ống nghe |
| Điện thoại đặt trên bàn (State 3) | `SpaceshipConsoleItemCommunicator` | 9 | 1 | -3.350 | -6.930 | 1.00 | Không | 36.3411% | 60.6076% | 9.8698% | 26.9097% | 1395.50, 1745.50 | 379.00 × 775.00 | Cụm điện thoại kèm phụ kiện |
| Điện thoại Nâng cấp Cấp 2 (State 4) | `SpaceshipConsoleItemCommunicatorLevel2` | 9 | 1 | -3.140 | -6.020 | 1.00 | Không | 36.2760% | 54.2535% | 11.0938% | 33.2986% | 1393.00, 1562.50 | 426.00 × 959.00 | Điện thoại kết nối viễn thông cao cấp |
| Cổ vật trên mặt bàn (Artifact) | `SpaceshipItemArtifact` | 9 | 1 | 0.016 | -1.774 | 0.63 | Không | 47.8514% | 50.2535% | 4.3805% | 11.8125% | 1837.49, 1447.30 | 168.21 × 340.20 | Phiến cổ vật đặt ngay mặt bàn Console |

---

## 6. CỤM ĐỒNG HỒ & ĐÒN BẨY CHỐT NGÀY (DAYDISPLAY CLUSTER)

### 6.1. Cấu Trúc Khối Điều Khiển Sol & Chốt Ngày
Nằm ở vách cực phải của buồng lái ($wx \approx 16.32 - 18.12$), đây là khối cơ học hiển thị chỉ số Sol và kích hoạt chuyển Sol:
1. **Đồng hồ số Sol (`SpaceshipClock`)**: Hộp kim loại gắn trên tường ($wx = 17.040, wy = 7.960$), bên trong có 3 ô hiển thị số ngày kiểu lật trang (Flipclock).
2. **3 Chữ số hiển thị Sol (Digit 1, 2, 3)**:
   * **Digit 1 (Hàng trăm)**: $wx = 16.320, wy = 6.510$.
   * **Digit 2 (Hàng chục)**: $wx = 16.960, wy = 6.540$.
   * **Digit 3 (Hàng đơn vị)**: $wx = 17.600, wy = 6.550$.
   * Cả 3 số đều có phiên bản hoạt ảnh quay số `SpaceshipFlipclockAnim_0001` (Order 7) lồng đè lên số tĩnh (Order 6).
3. **Đòn bẩy kết thúc ngày (`SpaceshipEndday`)**: Cụm cơ cấu cần gạt thép gắn tường ($wx = 17.328, wy = 2.469$).
4. **Cần gạt chuyển động (`LeverPanel`)**: Tay đòn gạt có animation gạt xuống khi chốt ngày ($wx = 18.124, wy = 1.575$).
5. **4 Tờ giấy báo cáo (Report Papers)**: Được kẹp trên thân đòn bẩy để báo hiệu các sự việc cần người chơi kiểm tra trước khi gạt cần (Sự kiện, Khẩu phần, Thám hiểm, Chế tạo).

### 6.2. Bảng Tọa Độ Cụm Đồng Hồ & Đòn Bẩy (DayDisplay)
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Hộp đồng hồ Sol (Clock) | `SpaceshipClock` | 6 | 0 | 17.040 | 7.960 | 1.00 | Không | 89.4792% | 10.7986% | 10.5469% | 23.1250% | 3436.00, 311.00 | 405.00 × 666.00 | Khung đồng hồ chính trên tường |
| Đèn đồng hồ Xanh (Green Light) | `SpaceshipClockLightGreen` | 6 | 1 | 16.377 | 8.658 | 1.00 | Không | 88.9375% | 14.7465% | 7.4219% | 10.3819% | 3415.20, 424.70 | 285.00 × 299.00 | Đèn báo trạng thái đồng hồ |
| Đèn đồng hồ Đỏ (Red Light) | `SpaceshipClockLightRed` | 6 | 1 | 16.374 | 8.658 | 1.00 | Không | 88.9297% | 14.7465% | 7.4219% | 10.3819% | 3414.90, 424.70 | 285.00 × 299.00 | Đèn báo chưa thể chốt Sol |
| Đèn đồng hồ Vàng (Yellow Light) | `SpaceshipClockLightYellow` | 6 | 1 | 15.482 | 9.243 | 1.00 | Không | 80.6042% | 2.8715% | 19.4271% | 30.0694% | 3095.20, 82.70 | 746.00 × 866.00 | Vùng sáng vàng chiếu quanh |
| Chữ số Hàng trăm (Digit 1) | `SpaceshipClockNumber0` | 6 | 6 | 16.320 | 6.510 | 1.00 | Không | 92.0182% | 25.1910% | 0.9635% | 4.4097% | 3533.50, 725.50 | 37.00 × 127.00 | Số tĩnh chữ số 1 |
| Chữ số Hàng chục (Digit 2) | `SpaceshipClockNumber0` | 6 | 6 | 16.960 | 6.540 | 1.00 | Không | 93.6849% | 25.0868% | 0.9635% | 4.4097% | 3597.50, 722.50 | 37.00 × 127.00 | Số tĩnh chữ số 2 |
| Chữ số Hàng đơn vị (Digit 3) | `SpaceshipClockNumber0` | 6 | 6 | 17.600 | 6.550 | 1.00 | Không | 95.3516% | 25.0521% | 0.9635% | 4.4097% | 3661.50, 721.50 | 37.00 × 127.00 | Số tĩnh chữ số 3 |
| Hoạt ảnh lật số 1 (Flip Digit 1) | `SpaceshipFlipclockAnim_0001` | 6 | 7 | 16.379 | 6.510 | 1.00 | Không | 91.5859% | 24.7917% | 1.7187% | 4.9653% | 3516.90, 714.00 | 66.00 × 143.00 | Animation lật số hàng trăm |
| Hoạt ảnh lật số 2 (Flip Digit 2) | `SpaceshipFlipclockAnim_0001` | 6 | 7 | 17.031 | 6.499 | 1.00 | Không | 93.2839% | 24.8299% | 1.7187% | 4.9653% | 3582.10, 715.10 | 66.00 × 143.00 | Animation lật số hàng chục |
| Hoạt ảnh lật số 3 (Flip Digit 3) | `SpaceshipFlipclockAnim_0001` | 6 | 7 | 17.675 | 6.495 | 1.00 | Không | 94.9609% | 24.8437% | 1.7187% | 4.9653% | 3646.50, 715.50 | 66.00 × 143.00 | Animation lật số hàng đơn vị |
| Thân đòn bẩy (Endday Sprite) | `SpaceshipEndday` | 6 | 5 | 17.328 | 2.469 | 1.00 | Không | 90.2422% | 31.3750% | 9.7656% | 20.1042% | 3465.30, 903.60 | 375.00 × 579.00 | Khung đế đòn bẩy chốt ngày |
| Tay cần gạt động lực (Lever Panel) | `SpaceshipEnddayAnim_0001` | 6 | 6 | 18.124 | 1.575 | 1.00 | Không | 95.7656% | 40.5382% | 2.8646% | 7.9861% | 3677.40, 1167.50 | 110.00 × 230.00 | Tay gạt animation chuyển Sol |
| Giấy kẹp Sự kiện (Event Paper) | `SpaceshipEnddayEvent` | 6 | 6 | 17.328 | 2.469 | 1.00 | Không | 92.8984% | 45.0556% | 2.1094% | 2.8472% | 3567.30, 1297.60 | 81.00 × 82.00 | Thẻ nhắc đọc sự cố chưa giải quyết |
| Giấy kẹp Khẩu phần (Rationing Paper) | `SpaceshipEnddayRationing` | 6 | 6 | 17.328 | 2.469 | 1.00 | Không | 92.5339% | 39.7778% | 3.0729% | 4.6875% | 3553.30, 1145.60 | 118.00 × 135.00 | Thẻ nhắc chưa phân phối súp/nước |
| Giấy kẹp Thám hiểm (Expedition Paper) | `SpaceshipEnddayExpedition` | 6 | 6 | 17.328 | 2.469 | 1.00 | Không | 90.7370% | 39.6736% | 2.0573% | 5.0000% | 3484.30, 1142.60 | 79.00 × 144.00 | Thẻ nhắc hành trình thám hiểm |
| Giấy kẹp Chế tạo (Crafting Paper) | `SpaceshipEnddayCrafting` | 6 | 6 | 17.328 | 2.469 | 1.00 | Không | 90.6589% | 44.6042% | 2.0573% | 3.1944% | 3481.30, 1284.60 | 79.00 × 92.00 | Thẻ nhắc tiến độ máy tái chế |

---

## 7. CÁC PHÂN KHU HỖ TRỢ BỔ SUNG TRONG KHOANG TÀU (ADDITIONAL STATIONS)

Để hệ thống giao diện Project Hail đồng bộ 100% với toàn bộ scene gốc, dưới đây là tọa độ của các trạm chức năng và chi tiết nội thất còn lại:

### 7.1. Trạm Máy Chế Tạo 3D Vách Trái (Crafting System)
Nằm tại $wx \approx -6.610 - -6.615, wy \approx 5.720 - 5.724$, Layer 3:
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Máy Chế tạo Cấp 1 (Crafting Level 1) | `SpaceshipCrafting` | 3 | 1 | -6.610 | 5.720 | 1.00 | Không | 29.3099% | 17.3264% | 9.6615% | 25.6250% | 1125.50, 499.00 | 371.00 × 738.00 | Máy chế tạo cơ bản |
| Máy Chế tạo Cấp 2 (Crafting Level 2) | `SpaceshipCraftingLevel2` | 3 | 2 | -6.615 | 5.724 | 1.00 | Không | 25.8854% | 20.8194% | 13.4635% | 20.9028% | 994.00, 599.60 | 517.00 × 602.00 | Máy chế tạo nâng cấp |
| Máy Chế tạo Cấp 3 (Crafting Level 3) | `SpaceshipCraftingLevel3` | 3 | 3 | -6.615 | 5.724 | 1.00 | Không | 27.6042% | 22.0694% | 12.0573% | 13.6806% | 1060.00, 635.60 | 463.00 × 394.00 | Máy chế tạo tối tân |
| Đèn máy chế tạo Đỏ (Red Light) | `SpaceshipCraftingLightRed` | 3 | 2 | -7.142 | 7.701 | 1.00 | Không | 28.2891% | 19.0590% | 6.2240% | 8.4028% | 1086.30, 548.90 | 239.00 × 242.00 | Đèn báo đang bận/lỗi |
| Đèn máy chế tạo Xanh (Green Light) | `SpaceshipCraftingLightGreen` | 3 | 4 | -7.142 | 7.701 | 1.00 | Không | 28.2891% | 19.0590% | 6.2240% | 8.4028% | 1086.30, 548.90 | 239.00 × 242.00 | Đèn báo sẵn sàng tái chế |
| Đèn máy chế tạo Vàng (Yellow Light) | `SpaceshipCraftingLightYellow` | 3 | 4 | -7.031 | 7.584 | 1.00 | Không | 20.7656% | 8.8924% | 21.8490% | 29.5486% | 797.40, 256.10 | 839.00 × 851.00 | Vùng sáng tỏa đèn máy chế tạo |

### 7.2. Trạm Điều Hướng & Ăng-Ten Thám Hiểm (Expedition Station)
Nằm tại $wx \approx 3.304 - 7.714, wy \approx 2.609 - 5.012$:
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Ăng-ten thám hiểm Cấp 1 (Level 1) | `SpaceshipExpeditionNavigationLevel1` | 1 | 5 | 6.224 | 5.012 | 1.00 | Không | 59.8151% | 25.4444% | 12.7865% | 14.3056% | 2296.90, 732.80 | 491.00 × 412.00 | Bộ thu phát định vị cơ bản |
| Ăng-ten thám hiểm Cấp 2 (Level 2) | `SpaceshipExpeditionNavigationLevel2` | 1 | 5 | 7.714 | 2.609 | 1.00 | Không | 68.3568% | 36.4965% | 3.4635% | 8.8889% | 2624.90, 1051.10 | 133.00 × 256.00 | Trạm điều hướng nâng cấp |
| Đế ăng-ten thám hiểm Cấp 3 (Base) | `SpaceshipExpeditionNavigationLevel3Base` | 3 | 6 | 3.530 | 3.330 | 1.00 | Không | 57.9297% | 35.3819% | 2.5260% | 6.1111% | 2224.50, 1019.00 | 97.00 × 176.00 | Khung đế ăng-ten chảo cao cấp |
| Chảo ăng-ten Cấp 3 (Dish) | `SpaceshipExpeditionNavigationLevel3Dish` | 3 | 7 | 3.304 | 3.342 | 1.00 | Không | 55.1654% | 34.9931% | 3.6198% | 4.8611% | 2118.35, 1007.80 | 139.00 × 140.00 | Chảo radar định vị vệ tinh |
| Giắc cắm ăng-ten Cấp 3 (Plug) | `SpaceshipExpeditionNavigationLevel3Plug` | 1 | 5 | 4.275 | 3.546 | 1.00 | Không | 60.1823% | 36.2639% | 1.9010% | 2.8472% | 2311.00, 1044.40 | 73.00 × 82.00 | Cáp nguồn cao tần radar |
| Đèn thám hiểm Đỏ (Red Light) | `SpaceshipCraftingLightRed` | 6 | 6 | 5.846 | 7.294 | 1.00 | Có | 62.1120% | 20.4722% | 6.2240% | 8.4028% | 2385.10, 589.60 | 239.00 × 242.00 | Đèn báo bão/nguy hiểm |
| Đèn thám hiểm Xanh (Green Light) | `SpaceshipCraftingLightGreen` | 6 | 6 | 5.846 | 7.294 | 1.00 | Có | 62.1120% | 20.4722% | 6.2240% | 8.4028% | 2385.10, 589.60 | 239.00 × 242.00 | Đèn báo đường thông suốt |
| Đèn thám hiểm Vàng (Yellow Light) | `SpaceshipCraftingLightYellow` | 6 | 6 | 5.730 | 7.178 | 1.00 | Có | 53.9974% | 10.3021% | 21.8490% | 29.5486% | 2073.50, 296.70 | 839.00 × 851.00 | Vùng sáng vàng điều hướng |

### 7.3. Máy Tính Nhật Ký Starlog Vách Trái (Starlog Computer)
Nằm tại mép vách bên trái buồng tàu ($wx = -15.590, wy = -1.450$), Layer 9, Order 1:
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Máy tính Starlog (Starlog Sprite) | `SpaceshipStarlog` | 9 | 1 | -15.590 | -1.450 | 1.00 | Không | 0.0260% | 35.5035% | 10.1302% | 34.4792% | 1.00, 1022.50 | 389.00 × 993.00 | Terminal lưu trữ nhật ký sứ mệnh |
| Đèn Starlog Đỏ (Red Light) | `SpaceshipStarlogLightRed` | 9 | 0 | -15.787 | 3.476 | 1.00 | Không | 2.9896% | 28.5903% | 11.7969% | 18.6806% | 114.80, 823.40 | 453.00 × 538.00 | Đèn báo tin khẩn chưa đọc |
| Đèn Starlog Xanh (Green Light) | `SpaceshipStarlogLightGreen` | 9 | 0 | -15.787 | 3.476 | 1.00 | Không | 2.9896% | 28.5903% | 11.7969% | 18.6806% | 114.80, 823.40 | 453.00 × 538.00 | Đèn báo nhật ký bình thường |
| Đèn Starlog Vàng (Yellow Light) | `SpaceshipStarlogLightYellow` | 9 | 0 | -15.787 | 3.476 | 1.00 | Không | 2.9896% | 28.5903% | 11.7969% | 18.6806% | 114.80, 823.40 | 453.00 × 538.00 | Vùng sáng tỏa terminal Starlog |

### 7.4. Kết Cấu Buồng Lái & Thiết Bị Môi Trường (Cabin Architecture & Environment)
| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Vỏ khoang tàu chính (Spaceship) | `Spaceship` | 1 | 3 | 0.000 | 0.000 | 1.00 | Không | 0.0000% | 0.0000% | 100.0000% | 100.0000% | 0.00, 0.00 | 3840.00 × 2880.00 | Khung vỏ chính có ô cửa sổ cắt alpha rỗng |
| Dàn đèn trần chính (Spaceship Light) | `SpaceshipLight` | 9 | 3 | 0.000 | 10.000 | 1.00 | Không | -0.0132% | -1.1979% | 100.0263% | 32.9514% | -0.51, -34.50 | 3841.01 × 949.00 | Vệt sáng chiếu từ trần buồng lái |
| Đèn báo động đỏ nóc (Red Alert) | `SpaceshipRedAlert` | 6 | 0 | 2.936 | 6.672 | 1.00 | Không | 55.6667% | 23.8646% | 3.9583% | 5.9375% | 2137.60, 687.30 | 152.00 × 171.00 | Còi đèn xoay báo động cấp cứu |
| Quạt thông gió nhỏ 1 (Fan 1) | `SpaceshipFanSmallAnim_0001` | 6 | 0 | 5.271 | 9.074 | 1.00 | Không | 59.7422% | 16.1840% | 7.4479% | 4.5833% | 2294.10, 466.10 | 286.00 × 132.00 | Quạt hút khí vách trên |
| Quạt thông gió lớn 2 (Fan 2) | `SpaceshipFanSmallAnim_0001` | 6 | 0 | 8.890 | 13.500 | 1.61 | Không | 66.7374% | -0.5919% | 11.9890% | 7.3778% | 2562.72, -17.05 | 460.38 × 212.48 | Quạt hút khí nóc trần (scale 1.61) |
| Miếng vá vỏ tàu (Expedition Patch) | `SpaceshipExpeditionPatch` | 1 | 10 | 3.914 | 2.226 | 1.00 | Không | 57.4323% | 25.9861% | 5.5208% | 32.5694% | 2205.40, 748.40 | 212.00 × 938.00 | Miếng kim loại hàn vá thủng vách |
| Nền không gian ngoài cửa sổ | `SpaceshipSpacesBackground` | 0 | 0 | 57.000 | 3.350 | 1.00 | Không | 146.3542% | 29.5858% | 104.1667% | 17.5646% | 5620.00, 852.07 | 4000.00 × 505.86 | Bầu trời vũ trụ sâu Layer 0 |

---

## 8. HƯỚNG DẪN TÍCH HỢP CHO LẬP TRÌNH VIÊN WEB (CSS / TAILWIND IMPLEMENTATION)

### 8.1. Cấu Trúc Khung Chứa Stage Tỷ Lệ 4:3 Responsive
Để màn hình không bao giờ bị méo mó hay co dãn sai tỷ lệ trên các màn hình desktop/mobile:
```tsx
// Container chuẩn khóa cứng tỷ lệ 4:3 nằm lồng giữa màn hình
<div className="relative w-full max-w-[1440px] aspect-[4/3] mx-auto overflow-hidden bg-black select-none">
  {/* Lớp 0: Ngoại cảnh hành tinh ngoài cửa sổ Porthole */}
  <div className="absolute inset-0 z-0 pointer-events-none">
    <img 
      src={planetBackgroundUrl} 
      alt="Planet View" 
      className="absolute left-[41%] top-[26%] w-[18%] h-[23%] object-cover rounded-full"
    />
  </div>

  {/* Lớp 10: Vỏ tàu Spaceship.webp đục lỗ Alpha */}
  <img 
    src="/assets/parsecs/Spaceship.webp" 
    alt="Spaceship Interior" 
    className="absolute inset-0 w-full h-full object-fill z-10 pointer-events-none"
  />

  {/* Lớp 20: 9 Lon súp trên kệ trái */}
  {soupItems.map((soup, idx) => (
    <img
      key={soup.id}
      src={soup.spriteUrl}
      alt="Soup Can"
      style={{
        position: 'absolute',
        left: `${soup.leftPct}%`,
        top: `${soup.topPct}%`,
        width: `${soup.widthPct}%`,
        height: `${soup.heightPct}%`,
        zIndex: 20 + soup.ord,
      }}
      className="object-contain pointer-events-none drop-shadow-md"
    />
  ))}

  {/* Lớp 22: Ghế hàng sau (SeatBackLeft, SeatBackRight - Scale 0.63) */}
  <div className="absolute z-[22]">
    {/* Ghế lùi sau bàn Console */}
  </div>

  {/* Lớp 30: Ghế hàng trước (SeatCaptain, SeatRight - Scale 1.0) & Phi hành gia */}
  <div className="absolute z-[30]">
    {/* Hàng ghế tiền cảnh */}
  </div>

  {/* Lớp 35: Bàn điều khiển trung tâm Console */}
  <img 
    src="/assets/parsecs/SpaceshipConsole.webp" 
    alt="Console" 
    className="absolute left-[36.1458%] top-[54.0625%] w-[26.9792%] h-[33.3333%] z-[35] object-contain pointer-events-none"
  />

  {/* Lớp 40: Màn hình máy tính sự kiện tương tác */}
  <button 
    onClick={handleOpenEventModal}
    className="absolute left-[44.3516%] top-[61.6250%] w-[10.5469%] h-[16.4931%] z-[40] cursor-pointer hover:scale-105 transition-transform"
  >
    <img src="/assets/parsecs/SpaceshipEvent.webp" alt="Event Monitor" className="w-full h-full object-contain" />
  </button>
</div>
```

### 8.2. Quy Tắc Bất Di Bất Dịch Khi Render Sprite (Golden Rules)
1. **Luôn dùng `object-contain`**: Tuyệt đối không dùng `object-fill` hoặc `object-cover` cho các sprite vật thể và nhân vật. Vì sprite xuất từ texture atlas có kích thước khung bao khác nhau, `object-contain` bảo đảm tỷ lệ gốc nguyên vẹn.
2. **Không làm tròn số thập phân trong CSS**: Khi định nghĩa `style={{ left: '12.9557%', top: '44.9826%' }}`, hãy giữ nguyên ít nhất 4 chữ số thập phân. Nếu làm tròn thành `13%` và `45%`, sai số tích lũy trên màn hình 4K (3840px) sẽ lên đến **$10 - 20\text{ px}$**, làm lệch khớp mộng giữa các sprite (ví dụ nệm ghế và vết rách hoặc thân đòn bẩy và tay gạt).
3. **Phân tách Pointer Events**: Gán `pointer-events-none` cho toàn bộ hình ảnh nền và trang trí, chỉ gán `pointer-events-auto` cho các hitbox tương tác chính xác (nhân vật, máy tính, cần gạt, máy chế tạo) để tránh hiện tượng click bị cản trở bởi mép ảnh trong suốt của vật thể khác.
