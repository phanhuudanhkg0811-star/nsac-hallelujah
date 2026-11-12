const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('src/data/parsecsSceneCoordinates.json', 'utf8'));

function fmt(n, d = 4) {
  if (n === undefined || n === null) return '-';
  return Number(n).toFixed(d);
}

function pxW(pct) { return (pct / 100 * 3840).toFixed(2); }
function pxH(pct) { return (pct / 100 * 2880).toFixed(2); }

function getEntry(key) {
  return data[key];
}

function row(name, key, note = '') {
  const entry = data[key];
  if (!entry) return `| ${name} | \`${key}\` | *N/A* | - | - | - | - | - | - | - | - | - | - | - | ${note} |`;
  const scaleStr = entry.sx !== undefined ? (entry.sx === entry.sy ? fmt(entry.sx, 2) : `${fmt(entry.sx, 2)}, ${fmt(entry.sy, 2)}`) : '1.00';
  const flipStr = entry.flipX ? 'Có' : 'Không';
  return `| ${name} | \`${entry.sprite}\` | ${entry.layer ?? '-'} | ${entry.ord ?? '-'} | ${fmt(entry.wx, 3)} | ${fmt(entry.wy, 3)} | ${scaleStr} | ${flipStr} | ${fmt(entry.left, 4)}% | ${fmt(entry.top, 4)}% | ${fmt(entry.width, 4)}% | ${fmt(entry.height, 4)}% | ${pxW(entry.left)}, ${pxH(entry.top)} | ${pxW(entry.width)} × ${pxH(entry.height)} | ${note} |`;
}

function slotRow(name, key, seatDesc) {
  const entry = data[key];
  if (!entry) return `| ${name} | - | - | - | - | ${seatDesc} |`;
  const scaleStr = `${fmt(entry.sx, 2)}, ${fmt(entry.sy, 2)}`;
  const flipStr = entry.sx < 0 ? 'Có (sx < 0)' : 'Không';
  const xPx = ((entry.wx + 19.2) * 100).toFixed(2);
  const yPx = ((14.4 - entry.wy) * 100).toFixed(2);
  const xPct = ((entry.wx + 19.2) / 38.4 * 100).toFixed(4);
  const yPct = ((14.4 - entry.wy) / 28.8 * 100).toFixed(4);
  return `| ${name} | ${fmt(entry.wx, 3)} | ${fmt(entry.wy, 3)} | ${scaleStr} | ${flipStr} | ${xPct}% / ${yPct}% | ${xPx} px / ${yPx} px | ${seatDesc} |`;
}

const tableHeader = `| Tên / Trạng thái | Sprite WebP | Layer | Order | World X (wx) | World Y (wy) | Scale (sx, sy) | Flip X | Left (%) | Top (%) | Width (%) | Height (%) | Tọa độ Pixel (X, Y) | Kích thước Pixel (W × H) | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |`;

const slotTableHeader = `| Slot ID | World X (wx) | World Y (wy) | Scale (sx, sy) | Đảo trục (Flip) | Tỷ lệ Canvas (X%, Y%) | Điểm Neo Pixel (X, Y) | Vị trí Ghế Ngồi Tương Ứng |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |`;

let md = `# MA TRẬN TỌA ĐỘ KHÔNG GIAN BUỒNG TÀU (CABIN SPATIAL COORDINATES MATRIX)
> **Dự án**: Junior Astronaut Mission Trainer (2026 NASA Space Apps Challenge)  
> **Nguồn trích xuất nhị phân**: Dữ liệu cấu trúc scene Unity \`level3\` và tệp gói tài nguyên \`sharedassets3.assets\` (*60 Parsecs! v1.3.2*)  
> **Hệ quy chiếu chuẩn**: Orthographic Viewport 4:3, Pixels Per Unit (PPU) = 100, Canvas gốc **3840 × 2880 px** (Stage Width = 38.4 units, Height = 28.8 units)  
> **Tệp dữ liệu ánh xạ gốc**: [\`src/data/parsecsSceneCoordinates.json\`](file:///e:/Project%20Hail/src/data/parsecsSceneCoordinates.json)  
> **Tài liệu tham chiếu liên quan**: [\`GRAPHIC_ASSET_MAPPING_GUIDE.md\`](file:///e:/Project%20Hail/GRAPHIC_ASSET_MAPPING_GUIDE.md), [\`UI_UX_SPECIFICATION.md\`](file:///e:/Project%20Hail/UI_UX_SPECIFICATION.md), [\`UI_IMPLEMENTATION_DIRECTIVE.md\`](file:///e:/Project%20Hail/UI_IMPLEMENTATION_DIRECTIVE.md)

---

## 1. HỆ QUY CHIẾU KHÔNG GIAN & CÔNG THỨC CHUYỂN ĐỔI CHUẨN (4:3 VIEWPORT)

### 1.1. Tham số Không Gian Unity Orthographic Scene (\`level3\`)
Trong engine Unity của game gốc, toàn bộ trạm vũ trụ được dựng trong một không gian 2.5D trực giao (Orthographic Camera) cố định:
- **Tâm máy quay (Camera Center)**: $(X = 0, Y = 0, Z = -10)$. Trục $Z$ quay hướng vào mặt phẳng buồng tàu.
- **Bán chiều cao trực giao (Orthographic Size)**: $14.4\\text{ units}$.
- **Kích thước vật lý không gian (World Units)**:
  * Chiều rộng (Stage Width): **$38.4\\text{ units}$** (biên độ từ $X = -19.2$ đến $X = +19.2$).
  * Chiều cao (Stage Height): **$28.8\\text{ units}$** (biên độ từ $Y = -14.4$ đến $Y = +14.4$).
  * Tỉ lệ khung hình (Aspect Ratio): $\\frac{38.4}{28.8} = \\frac{4}{3} \\approx 1.333333$.
- **Mật độ điểm ảnh (Pixels Per Unit - PPU)**: **$100\\text{ px / unit}$**.
- **Kích thước Canvas đồ họa gốc (Native Pixel Space)**:
  * Chiều rộng: $38.4 \\times 100 = \\mathbf{3840\\text{ px}}$.
  * Chiều cao: $28.8 \\times 100 = \\mathbf{2880\\text{ px}}$.
  * Gốc tọa độ Unity $(0, 0)$ nằm chính xác tại tâm ảnh Canvas: $(X = 1920\\text{ px}, Y = 1440\\text{ px})$.

### 1.2. Công thức toán học chuyển đổi hai chiều (Unity World $\\longleftrightarrow$ CSS Canvas %)
Để đảm bảo hiển thị pixel-perfect trên mọi độ phân giải màn hình thông qua CSS/HTML5, tọa độ được chuyển đổi theo hệ thức vi phân sau:

#### Chiều từ Unity World $\\rightarrow$ Canvas CSS & Pixel:
$$\\text{Center}_X = (\\text{wx} + 19.2) \\times 100 \\quad (\\text{px})$$
$$\\text{Center}_Y = (14.4 - \\text{wy}) \\times 100 \\quad (\\text{px})$$
$$\\text{Width}_{\\text{px}} = \\text{width\\_pct} \\times 38.40 = \\text{width\\_units} \\times |\\text{sx}| \\times 100 \\quad (\\text{px})$$
$$\\text{Height}_{\\text{px}} = \\text{height\\_pct} \\times 28.80 = \\text{height\\_units} \\times |\\text{sy}| \\times 100 \\quad (\\text{px})$$

Tọa độ đỉnh trên-trái (Top-Left Bounding Box):
$$\\text{Left}_{\\text{px}} = \\text{Center}_X - \\frac{\\text{Width}_{\\text{px}}}{2} = \\frac{\\text{left\\_pct}}{100} \\times 3840$$
$$\\text{Top}_{\\text{px}} = \\text{Center}_Y - \\frac{\\text{Height}_{\\text{px}}}{2} = \\frac{\\text{top\\_pct}}{100} \\times 2880$$

Quy đổi ra phần trăm Canvas phục vụ CSS:
$$\\text{left}\\% = \\frac{\\text{Left}_{\\text{px}}}{3840} \\times 100\\% = \\left(\\frac{\\text{wx} + 19.2 - \\frac{\\text{Width}_{\\text{units}} \\times |\\text{sx}|}{2}}{38.4}\\right) \\times 100\\%$$
$$\\text{top}\\% = \\frac{\\text{Top}_{\\text{px}}}{2880} \\times 100\\% = \\left(\\frac{14.4 - \\text{wy} - \\frac{\\text{Height}_{\\text{units}} \\times |\\text{sy}|}{2}}{28.8}\\right) \\times 100\\%$$

### 1.3. Bảng phân tầng chiều sâu (Unity Sorting Layer & Order $\\longleftrightarrow$ CSS z-index)
Hệ thống đồ họa Unity tổ chức chiều sâu qua **Sorting Layer** và **Sorting Order in Layer**. Bảng đối chiếu dưới đây là quy chuẩn bắt buộc để không bị lỗi chồng lớp:

| Unity Sorting Layer | Ý nghĩa trong Unity Scene | Thứ tự hiển thị trong Scene | Đối chiếu CSS \`z-index\` đề xuất | Đối tượng đại diện tiêu biểu |
| :---: | :--- | :---: | :---: | :--- |
| **Layer 0** | Nền sâu vũ trụ (Background) | Đáy cùng | \`z-index: 0\` | Nền không gian \`SpaceshipSpacesBackground\` ngoài cửa sổ |
| **Layer 1** | Ngoại cảnh hành tinh & Vỏ buồng tàu | Lớp 1 | \`z-index: 10\` | Hành tinh \`SurvSpaceshuttlePlanet*\`, Vỏ tàu chính \`Spaceship.webp\` (có lỗ alpha) |
| **Layer 2** | Giá đồ & Vật phẩm kệ vách | Lớp 2 | \`z-index: 20\` | 9 lon súp, Súng, Sách, Băng dính, Giáp EVA treo tường |
| **Layer 3** | Trạm chức năng vách & **Ghế hàng sau** | Lớp 3 | \`z-index: 22\` | Máy chế tạo, Ăng-ten thám hiểm, Cánh tủ kệ, **SeatBackLeft, SeatBackRight** |
| **Layer 4** | Hao mòn hư hại ghế hàng sau | Lớp 4 | \`z-index: 23\` | Vết rách nệm \`Seat3WearTear\`, \`Seat4WearTear\` |
| **Layer 5** | Khách ghé thăm trạm phía sau | Lớp 5 | \`z-index: 24\` | Nhân vật NPC viếng thăm phía sau (Chuột Judy, Sheila...) |
| **Layer 6** | **Ghế hàng trước**, Cần gạt ngày, Đồng hồ | Lớp 6 | \`z-index: 30\` | **SeatCaptain, SeatRight**, Đòn bẩy \`SpaceshipEndday\`, Đồng hồ Sol |
| **Layer 7** | Hao mòn hư hại ghế hàng trước | Lớp 7 | \`z-index: 31\` | Vết rách nệm \`Seat1WearTear\`, \`Seat2WearTear\` |
| **Layer 9** | **Bàn Console trung tâm**, Máy tính sự kiện, Điện thoại | Lớp 7 (Tiền cảnh cao) | \`z-index: 35\` (Console) / \`z-index: 40\` (Event) | Bàn \`SpaceshipConsole\`, Máy tính \`SpaceshipEvent\`, Điện thoại bàn, Cổ vật Artifact |
| **Layer 10**| Sự kiện kết thúc cốt truyện | Gần đỉnh | \`z-index: 45\` | Nhân vật khách kết thúc game (Hải tặc, Robot...) |
| **Layer 12**| Hoạt ảnh đổ bộ Cutscene | Đỉnh buồng lái | \`z-index: 48\` | Animation hạ cánh tàu xuống bề mặt hành tinh |

> [!IMPORTANT]
> **Quy luật chiều sâu quan trọng**:
> - Bàn điều khiển trung tâm nằm ở **Layer 9** (\`z-index: 35\`).
> - Hàng ghế sau (\`SeatBackLeft\`, \`SeatBackRight\`) nằm ở **Layer 3** (\`z-index: 22\`) với tỉ lệ scale $0.63$. Do đó, **hàng ghế sau luôn nằm khuất sau bàn Console**.
> - Hàng ghế trước (\`SeatCaptain\`, \`SeatRight\`) nằm ở **Layer 6** (\`z-index: 30\`) với tỉ lệ scale $1.00$. Hai ghế này nằm ở hai bên cánh gà tiền cảnh (Captain bên trái $X = -9.85$, Right bên phải $X = +9.67$), không bị bàn Console ($X = -0.14$) che khuất.

---

## 2. MA TRẬN 4 VỊ TRÍ GHẾ PHI HÀNH ĐOÀN (CREW SEATS & SLOTS)

### 2.1. Phân Tích Kỹ Thuật Bố Trí Ghế Ngồi
Bốn phi hành gia trong buồng tàu được phân bố thành 2 hàng ghế so le phối cảnh:
1. **Hàng Ghế Trước (Front Row - Scale 1.00)**:
   * **Ghế Thuyền Trưởng (\`SeatCaptain\`)**: Nằm bên trái góc nhìn, là chiếc ghế bọc da có đệm đỡ đầu màu đỏ đặc trưng. Tọa độ trung tâm $wx = -9.850, wy = -4.190$. Điểm gắn nhân vật tương ứng là \`Slots/CharacterSlot0\` ($wx = -9.880, wy = -4.850$, scale $-1.00$ lật mặt nhìn vào trung tâm buồng lái).
   * **Ghế Phải Hàng Trước (\`SeatRight\`)**: Nằm bên phải góc nhìn, ghế tiêu chuẩn màu xanh lam xám. Tọa độ trung tâm $wx = 9.670, wy = -4.840$. Điểm gắn nhân vật tương ứng là \`Slots/CharacterSlot1\` ($wx = 9.670, wy = -4.840$, scale $1.00$).
2. **Hàng Ghế Sau (Back Row - Scale 0.63)**:
   * **Ghế Trái Hàng Sau (\`SeatBackLeft\`)**: Nằm lùi sâu về sau, phía bên trái bàn máy tính. Tọa độ $wx = -5.140, wy = -1.920$, scale đồng nhất $0.63$. Thuộc Layer 3 nên **nằm hoàn toàn sau mặt bàn Console (Layer 9)**. Điểm gắn nhân vật \`Slots/CharacterSlot2\` ($wx = -5.140, wy = -1.920$, scale $-0.63$).
   * **Ghế Phải Hàng Sau (\`SeatBackRight\`)**: Nằm lùi sâu về sau, phía bên phải bàn máy tính. Tọa độ $wx = 4.860, wy = -1.890$, scale đồng nhất $0.63$. Thuộc Layer 3, nằm sau bàn Console. Điểm gắn nhân vật \`Slots/CharacterSlot3\` ($wx = 4.860, wy = -1.890$, scale $0.63$).

### 2.2. Bảng Tọa Độ Chuẩn 4 Ghế Ngồi (Seats)
${tableHeader}
${row('Ghế Thuyền trưởng (Captain)', 'Sprites/Spaceship/SpaceshipSeatCaptain', 'Hàng trước trái, biểu tượng trưởng tàu')}
${row('Ghế Phải hàng trước (Seat Right)', 'Sprites/Spaceship/SpaceshipSeatRight', 'Hàng trước phải, ghế tiêu chuẩn')}
${row('Ghế Trái hàng sau (Back Left)', 'Sprites/Spaceship/SpaceshipSeatBackLeft', 'Hàng sau trái, lùi xa sau bàn Console')}
${row('Ghế Phải hàng sau (Back Right)', 'Sprites/Spaceship/SpaceshipSeatBackRight', 'Hàng sau phải, lùi xa sau bàn Console')}

### 2.3. Bảng Điểm Neo Gắn Nhân Vật (Character Slots)
Bảng điểm gắn gốc Transform của phi hành gia ngồi trên ghế (trích xuất trực tiếp từ các GameObject Slot trong \`level3\`):
${slotTableHeader}
${slotRow('Slots/CharacterSlot0', 'Slots/CharacterSlot0', 'Ghế Thuyền trưởng (SeatCaptain - Hàng trước trái)')}
${slotRow('Slots/CharacterSlot1', 'Slots/CharacterSlot1', 'Ghế Phải hàng trước (SeatRight - Hàng trước phải)')}
${slotRow('Slots/CharacterSlot2', 'Slots/CharacterSlot2', 'Ghế Trái hàng sau (SeatBackLeft - Hàng sau trái)')}
${slotRow('Slots/CharacterSlot3', 'Slots/CharacterSlot3', 'Ghế Phải hàng sau (SeatBackRight - Hàng sau phải)')}

### 2.4. Bảng Vết Rách & Hao Mòn Ghế Ngồi (Seat Wear & Tear Damage)
Khi phi hành đoàn gặp sự cố hoặc thời gian sinh tồn kéo dài, ghế sẽ hiển thị các lớp phủ hư hại:
${tableHeader}
${row('Ghế 1 Hao mòn cấp 1', 'Sprites/Visuals/Seat1WearTear/VisualState1', 'Vết cào rách nhỏ ghế Thuyền trưởng')}
${row('Ghế 1 Hao mòn cấp 2', 'Sprites/Visuals/Seat1WearTear/VisualState2', 'Vết rách trung bình ghế Thuyền trưởng')}
${row('Ghế 1 Hao mòn cấp 3', 'Sprites/Visuals/Seat1WearTear/VisualState3', 'Vết nứt toác lớn ghế Thuyền trưởng')}
${row('Ghế 1 Ghế hỏng hoàn toàn', 'Sprites/Visuals/Seat1WearTear/VisualState4', 'Ghế cơ trưởng rách toàn bộ đệm')}
${row('Ghế 2 Hao mòn cấp 1', 'Sprites/Visuals/Seat2WearTear/VisualState1', 'Vết rách nhẹ ghế trước phải')}
${row('Ghế 2 Hao mòn cấp 2', 'Sprites/Visuals/Seat2WearTear/VisualState2', 'Vết nứt đệm ghế trước phải')}
${row('Ghế 2 Hao mòn cấp 3', 'Sprites/Visuals/Seat2WearTear/VisualState3', 'Vết bung lò xo ghế trước phải')}
${row('Ghế 3 Hao mòn cấp 1', 'Sprites/Visuals/Seat3WearTear/VisualState1', 'Vết rách nhẹ ghế sau trái')}
${row('Ghế 3 Hao mòn cấp 2', 'Sprites/Visuals/Seat3WearTear/VisualState2', 'Vết nứt toác ghế sau trái')}
${row('Ghế 3 Hao mòn cấp 3', 'Sprites/Visuals/Seat3WearTear/VisualState3', 'Vết phá hủy nặng ghế sau trái')}
${row('Ghế 4 Hao mòn cấp 1', 'Sprites/Visuals/Seat4WearTear/VisualState1', 'Vết rách nhẹ ghế sau phải')}
${row('Ghế 4 Hao mòn cấp 2', 'Sprites/Visuals/Seat4WearTear/VisualState2', 'Vết nứt toác ghế sau phải')}
${row('Ghế 4 Hao mòn cấp 3', 'Sprites/Visuals/Seat4WearTear/VisualState3', 'Vết phá hủy nặng ghế sau phải')}

---

## 3. MA TRẬN TỌA ĐỘ LƯỚI 3×3 CỦA 9 LON SÚP KỆ TRÁI (SOUP01 - SOUP09)

### 3.1. Cấu Trúc Bố Trí Lưới 3 Tầng × 3 Cột
Trong khoang tàu, 9 lon lương thực súp đóng hộp (\`SpaceshipItemSoup\`) được xếp ngăn nắp trên tủ kệ vách trái (\`SpaceshipLeftShelf\`). Cấu trúc không gian là một lưới ma trận 3×3 chính xác:
- **Tầng 3 (Hàng trên cùng, độ cao $wy \\approx 6.27 - 6.89$)**: Gồm Soup07, Soup08, Soup09.
- **Tầng 2 (Hàng giữa, độ cao $wy \\approx 4.80 - 5.11$)**: Gồm Soup04, Soup05, Soup06.
- **Tầng 1 (Hàng dưới cùng, độ cao $wy \\approx 3.28 - 3.33$)**: Gồm Soup01, Soup02, Soup03.
- **Cột 1 (Sát mép trái, $wx \\approx -13.20$, Sorting Order: 2)**: Gồm Soup01, Soup04, Soup07.
- **Cột 2 (Cột giữa, $wx \\approx -12.20$, Sorting Order: 1)**: Gồm Soup02, Soup05, Soup08.
- **Cột 3 (Cột trong cùng, $wx \\approx -11.30$, Sorting Order: 0)**: Gồm Soup03, Soup06, Soup09.

> [!NOTE]
> Tất cả 9 lon súp đều nằm ở **Layer 2** (Sorting Layer dành cho vật phẩm kệ). Thứ tự vẽ (\`ord\`) giảm dần từ Cột 1 (ord = 2) $\\rightarrow$ Cột 2 (ord = 1) $\\rightarrow$ Cột 3 (ord = 0), giúp tạo cảm giác lon bên ngoài che lấp nhẹ viền của lon bên trong, tạo chiều sâu thị giác.

### 3.2. Bảng Tọa Độ Chuẩn 9 Lon Súp (Lưới 3×3)
${tableHeader}
${row('Lon Súp 01 (Hàng 1, Cột 1)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup1', 'Tầng 1 dưới cùng, ngoài cùng bên trái')}
${row('Lon Súp 02 (Hàng 1, Cột 2)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup2', 'Tầng 1 dưới cùng, ở giữa')}
${row('Lon Súp 03 (Hàng 1, Cột 3)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup3', 'Tầng 1 dưới cùng, bên phải')}
${row('Lon Súp 04 (Hàng 2, Cột 1)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup4', 'Tầng 2 ở giữa, ngoài cùng bên trái')}
${row('Lon Súp 05 (Hàng 2, Cột 2)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup5', 'Tầng 2 ở giữa, cột giữa')}
${row('Lon Súp 06 (Hàng 2, Cột 3)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup6', 'Tầng 2 ở giữa, bên phải')}
${row('Lon Súp 07 (Hàng 3, Cột 1)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup7', 'Tầng 3 trên cùng, ngoài cùng bên trái')}
${row('Lon Súp 08 (Hàng 3, Cột 2)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup8', 'Tầng 3 trên cùng, cột giữa')}
${row('Lon Súp 09 (Hàng 3, Cột 3)', 'Sprites/Items/SpaceshipItemSoups/SpaceshipItemSoup9', 'Tầng 3 trên cùng, bên phải')}

### 3.3. Các Ngăn Tủ Cửa Đóng Của Kệ Trái (\`SpaceshipLeftShelf\`)
Khi các ngăn kệ chứa đồ hoặc đóng cánh tủ, vị trí của 4 cánh cửa tủ tương ứng:
${tableHeader}
${row('Cánh tủ kệ trái 1 (Tầng trên)', 'Sprites/ComputersAndSystems/SpaceshipLeftShelf/SpaceshipShelfLeftClosed1', 'Cửa tủ che tầng trên')}
${row('Cánh tủ kệ trái 2 (Tầng giữa)', 'Sprites/ComputersAndSystems/SpaceshipLeftShelf/SpaceshipShelfLeftClosed2', 'Cửa tủ che tầng giữa')}
${row('Cánh tủ kệ trái 3 (Tầng dưới)', 'Sprites/ComputersAndSystems/SpaceshipLeftShelf/SpaceshipShelfLeftClosed3', 'Cửa tủ che tầng dưới')}
${row('Cánh tủ kệ trái 4 (Đáy kệ)', 'Sprites/ComputersAndSystems/SpaceshipLeftShelf/SpaceshipShelfLeftClosed4', 'Cửa tủ ngăn đáy cùng')}
${row('Cánh tủ kệ phải (Right Shelf)', 'Sprites/ComputersAndSystems/SpaceshipRightShelf/SpaceshipShelfRightClosed', 'Cửa tủ vách phải (chứa Pin/Sách)')}

---

## 4. MA TRẬN TỌA ĐỘ TOÀN BỘ TRANG BỊ BUỒNG TÀU (EQUIPMENT INVENTORY)

Tất cả trang bị sinh tồn và kỹ thuật được định vị chính xác tại các vị trí giá đỡ và kệ đồ trong trạm. Dưới đây là ma trận tọa độ đầy đủ cho mọi biến thể:

### 4.1. Súng Bảo Vệ Trạm (Gun / Weapon)
Vị trí đặt: Kệ vách phải trên cao ($wx \\approx 11.812, wy \\approx 6.583$).
${tableHeader}
${row('Súng Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemWeapon/SpaceshipItemWeapon', 'Vũ khí cơ bản')}
${row('Súng Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemWeapon/SpaceshipItemWeaponUpgraded', 'Vũ khí nâng cấp laser')}
${row('Súng Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemWeapon/SpaceshipItemWeaponDamaged', 'Súng kẹt đạn/cháy nòng')}
${row('Súng Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemWeapon/SpaceshipItemWeaponUpgradedDamaged', 'Súng laser hỏng tụ điện')}

### 4.2. Sách Cẩm Nang Hướng Dẫn (Handbook / Book)
Vị trí đặt: Kệ vách phải giữa ($wx \\approx 11.105 - 11.198, wy \\approx 2.402 - 2.497$).
${tableHeader}
${row('Sách Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemBook/SpaceshipItemBook', 'Sổ tay sinh tồn')}
${row('Sách Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemBook/SpaceshipItemBookUpgraded', 'Cẩm nang nâng cấp chuyên sâu')}
${row('Sách Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemBook/SpaceshipItemBookDamaged', 'Sách rách bìa, thấm nước')}
${row('Sách Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemBook/SpaceshipItemBookUpgradedDamaged', 'Cẩm nang nâng cấp rách trang')}

### 4.3. Cuộn Băng Keo Đa Năng (Duct Tape / Duckttape)
Vị trí đặt: Kệ vách phải tầng thấp ($wx \\approx 12.556 - 13.561, wy \\approx 0.710 - 2.251$).
${tableHeader}
${row('Băng keo Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemDucktape/SpaceshipItemDucktape', 'Cuộn băng keo bạc')}
${row('Băng keo Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemDucktape/SpaceshipItemDucktapeUpgraded', 'Băng keo kỹ thuật siêu dính')}
${row('Băng keo Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemDucktape/SpaceshipItemDucktapeDamaged', 'Cuộn băng keo khô keo/nát')}
${row('Băng keo Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemDucktape/SpaceshipItemDucktapeUpgradedDamaged', 'Băng dính kỹ thuật biến chất')}

### 4.4. Mặt Nạ / Mũ Dưỡng Khí (Mask / Helmet)
Vị trí đặt: Móc treo vách trên cao ($wx \\approx 7.596 - 7.820, wy \\approx 6.629 - 7.041$).
${tableHeader}
${row('Mặt nạ Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemHelmet/SpaceshipItemHelmet', 'Mặt nạ dưỡng khí phòng độc')}
${row('Mặt nạ Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemHelmet/SpaceshipItemHelmetUpgraded', 'Mũ giáp phi hành nâng cấp')}
${row('Mặt nạ Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemHelmet/SpaceshipItemHelmetDamaged', 'Kính mặt nạ nứt vỡ')}
${row('Mặt nạ Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemHelmet/SpaceshipItemHelmetUpgradedDamaged', 'Mặt nạ nâng cấp thủng màng lọc')}

### 4.5. Hộp Sơ Cứu Y Tế (Medkit)
Vị trí đặt: Hộc tủ y tế góc cực trái ($wx \\approx -17.402 - -17.416, wy \\approx 5.528 - 5.613$).
${tableHeader}
${row('Hộp y tế Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemMedkit/SpaceshipItemMedkit', 'Hộp cứu thương cơ bản')}
${row('Hộp y tế Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemMedkit/SpaceshipItemMedkitUpgraded', 'Trạm cấp cứu dã chiến nâng cao')}

### 4.6. Vớ Sinh Tồn May Vá (Sock)
Vị trí đặt: Móc treo góc trên cùng bên trái ($wx \\approx -17.363, wy \\approx 8.317$).
${tableHeader}
${row('Vớ Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemSock/SpaceshipItemSock', 'Chiếc vớ sinh tồn len')}
${row('Vớ Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemSock/SpaceshipItemSockUpgraded', 'Vớ bọc cách nhiệt bảo hộ')}

### 4.7. Xẻng Địa Chất (Shovel)
Vị trí đặt: Dựa vào vách trái cạnh bàn chế tạo ($wx \\approx -7.860 - -9.131, wy \\approx -1.290 - 0.242$).
${tableHeader}
${row('Xẻng Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemShovel/SpaceshipItemShovel', 'Xẻng cán dài khai khoáng')}
${row('Xẻng Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemShovel/SpaceshipItemShovelUpgraded', 'Xẻng địa chất mũi tôi cứng')}
${row('Xẻng Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemShovel/SpaceshipItemShovelDamaged', 'Xẻng gãy cán nằm nghiêng')}
${row('Xẻng Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemShovel/SpaceshipItemShovelUpgradedDamaged', 'Xẻng nâng cấp cong lưỡi')}

### 4.8. Khối Pin Năng Lượng Dự Trữ (Battery)
Vị trí đặt: Sàn buồng tàu góc phải dưới ($wx \\approx 13.777 - 13.979, wy \\approx -7.158 - -6.497$).
${tableHeader}
${row('Pin Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemBattery/SpaceshipItemBattery', 'Khối ắc quy công nghiệp')}
${row('Pin Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemBattery/SpaceshipItemBatteryUpgraded', 'Cell pin hạt nhân ion nâng cấp')}
${row('Pin Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemBattery/SpaceshipItemBatteryDamaged', 'Ắc quy rò rỉ hóa chất')}
${row('Pin Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemBattery/SpaceshipItemBatteryUpgradedDamaged', 'Cell hạt nhân quá nhiệt phồng rộp')}

### 4.9. Bộ Đàm Vô Tuyến Cầm Tay (Communicator - Floor Item)
Vị trí đặt: Sàn buồng lái góc cực trái dưới chân ($wx \\approx -15.460 - -15.610, wy \\approx -8.104 - -8.990$). Thuộc Layer 9.
${tableHeader}
${row('Bộ đàm Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemCommunicator/SpaceshipItemCommunicator', 'Máy thu phát vô tuyến xách tay')}
${row('Bộ đàm Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemCommunicator/SpaceshipItemCommunicatorUpgraded', 'Bộ đàm tích hợp ăng-ten tầm xa')}
${row('Bộ đàm Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemCommunicator/SpaceshipItemCommunicatorDamaged', 'Bộ đàm cháy vi mạch')}
${row('Bộ đàm Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemCommunicator/SpaceshipItemCommunicatorUpgradedDamaged', 'Bộ đàm tầm xa gãy ăng-ten')}

### 4.10. Cổ Vật Vũ Trụ Huyền Bí (Artifact - On Console Table)
Vị trí đặt: Đặt ngay trên mặt bàn Console trung tâm ($wx \\approx 0.016 - 0.261, wy \\approx -1.774 - -1.960$), scale nhỏ $0.63$, Layer 9.
${tableHeader}
${row('Cổ vật Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemArtifact/SpaceshipItemArtifact', 'Phiến đá bí ẩn cổ đại')}
${row('Cổ vật Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemArtifact/SpaceshipItemArtifactUpgraded', 'Cổ vật phát sáng năng lượng')}
${row('Cổ vật Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemArtifact/SpaceshipItemArtifactDamaged', 'Phiến cổ vật nứt mẻ')}
${row('Cổ vật Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemArtifact/SpaceshipItemArtifactUpgradedDamaged', 'Cổ vật nâng cấp rò rỉ bức xạ')}

### 4.11. Bộ Đồ Thám Hiểm & Áo Giáp EVA (Armor & Suit)
Vị trí giá treo: Khung treo đồ bảo hộ vách phải buồng tàu ($wx \\approx 5.494 - 5.594, wy \\approx 1.540 - 4.218$).
${tableHeader}
${row('Bộ đồ EVA Cấp 1 (Suit Level 1)', 'Sprites/Items/SpaceshipItemArmor/Suit/Level1', 'Bộ đồ du hành cơ bản')}
${row('Bộ đồ EVA Cấp 2 (Suit Level 2)', 'Sprites/Items/SpaceshipItemArmor/Suit/Level2', 'Bộ đồ du hành gia cường')}
${row('Bộ đồ EVA Cấp 3 (Suit Level 3)', 'Sprites/Items/SpaceshipItemArmor/Suit/Level3', 'Bộ đồ du hành tối tân')}
${row('Móc treo không giáp (Hanger)', 'Sprites/Items/SpaceshipItemArmor/ArmorWithoutSuit/SpaceshipItemArmorNoArmor', 'Móc treo rỗng khi mang ra ngoài')}
${row('Giáp rời Chuẩn (Armor Only)', 'Sprites/Items/SpaceshipItemArmor/ArmorWithoutSuit/SpaceshipItemArmor', 'Giáp thân treo riêng')}
${row('Giáp rời Nâng cấp (Armor Upgraded)', 'Sprites/Items/SpaceshipItemArmor/ArmorWithoutSuit/SpaceshipItemArmorUpgraded', 'Giáp thân titan nâng cấp')}
${row('Giáp rời Hỏng (Armor Damaged)', 'Sprites/Items/SpaceshipItemArmor/ArmorWithoutSuit/SpaceshipItemArmorDamaged', 'Giáp thân thủng nứt mẻ')}
${row('Giáp rời Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemArmor/ArmorWithoutSuit/SpaceshipItemArmorUpgradedDamaged', 'Giáp titan bị nứt tấm chắn')}
${row('Giáp gắn trên Suit (With Suit)', 'Sprites/Items/SpaceshipItemArmor/ArmorWithSuit/SpaceshipItemArmor', 'Tấm giáp cài vào bộ đồ EVA')}
${row('Giáp nâng cấp gắn trên Suit', 'Sprites/Items/SpaceshipItemArmor/ArmorWithSuit/SpaceshipItemArmorUpgraded', 'Giáp nâng cấp cài vào bộ đồ EVA')}
${row('Giáp hỏng gắn trên Suit', 'Sprites/Items/SpaceshipItemArmor/ArmorWithSuit/SpaceshipItemArmorDamaged', 'Giáp hỏng gắn trên bộ đồ EVA')}
${row('Giáp nâng cấp hỏng gắn trên Suit', 'Sprites/Items/SpaceshipItemArmor/ArmorWithSuit/SpaceshipItemArmorUpgradedDamaged', 'Giáp nâng cấp hỏng trên suit')}

### 4.12. Bật Lửa Đốt Nhiệt (Lighter)
Vị trí đặt: Hộc phụ vách trái ($wx \\approx -11.011 - -11.188, wy \\approx 1.690 - 1.783$).
${tableHeader}
${row('Bật lửa Chuẩn (Standard)', 'Sprites/Items/SpaceshipItemLighter/SpaceshipItemLighter', 'Bật lửa gas tiêu chuẩn')}
${row('Bật lửa Nâng cấp (Upgraded)', 'Sprites/Items/SpaceshipItemLighter/SpaceshipItemLighterUpgraded', 'Bật lửa hàn plasma nâng cấp')}
${row('Bật lửa Hỏng (Damaged)', 'Sprites/Items/SpaceshipItemLighter/SpaceshipItemLighterDamaged', 'Bật lửa kẹt đá mồi')}
${row('Bật lửa Nâng cấp Bị hỏng', 'Sprites/Items/SpaceshipItemLighter/SpaceshipItemLighterUpgradedDamaged', 'Bật lửa hàn plasma chập điện')}

---

## 5. CỤM BÀN ĐIỀU KHIỂN CONSOLE TRUNG TÂM (CENTRAL CONSOLE CLUSTER)

### 5.1. Bàn Console & Màn Hình Sự Kiện Starlog Event
Cụm điều khiển trung tâm là trái tim tương tác của trạm, tọa lạc ngay trung tâm buồng lái:
- **Thân bàn Console (\`SpaceshipConsole\`)**: Chiếc bàn kim loại lớn hình bán nguyệt ôm lấy trước mặt phi hành gia. Đặt tại $wx = -0.140, wy = -5.970$, chiếm $26.98\\%$ chiều ngang và $33.33\\%$ chiều cao Canvas. Nằm ở **Layer 9 (Order 0)**.
- **Màn hình máy tính sự kiện (\`SpaceshipEvent\`)**: Màn hình CRT hiển thị các sự cố hàng ngày và điện tín gửi từ NASA. Đặt tại $wx = -1.029, wy = -5.923$, **Layer 9 (Order 2)**.
- **Cụm đèn chỉ thị trạng thái sự kiện**: Nằm ở góc trên màn hình máy tính ($wx = -0.661, wy = -3.639$, **Layer 9, Order 4**), đổi màu theo mức độ khẩn cấp (Xanh/Đỏ/Vàng).
- **Điện thoại bàn liên lạc (\`ConsoleCommunicator\`)**: Chiếc điện thoại ống nghe quay số màu cam cổ điển gắn trực tiếp vào cạnh trái bàn điều khiển ($wx \\approx -3.031 - -3.350, wy \\approx -6.020 - -7.016$, **Layer 9, Order 1**).

### 5.2. Bảng Tọa Độ Cụm Bàn Console & Thiết Bị Đi Kèm
${tableHeader}
${row('Bàn điều khiển chính (Console)', 'Sprites/ComputersAndSystems/SpaceshipConsole', 'Khung bàn trung tâm buồng lái')}
${row('Màn hình máy tính (Event Computer)', 'Sprites/ComputersAndSystems/EventComputer/EventComputerSprite', 'Màn hình máy tính tương tác Sol')}
${row('Đèn sự kiện Xanh (Green Light)', 'Sprites/ComputersAndSystems/EventComputer/GreenLight', 'Trạng thái bình thường/an toàn')}
${row('Đèn sự kiện Đỏ (Red Light)', 'Sprites/ComputersAndSystems/EventComputer/RedLight', 'Trạng thái khẩn cấp/báo động')}
${row('Đèn sự kiện Vàng (Yellow Light)', 'Sprites/ComputersAndSystems/EventComputer/YellowLight', 'Vùng ánh sáng vàng tỏa ra')}
${row('Điện thoại bàn Chuẩn (State 1)', 'Sprites/Visuals/ConsoleCommunicator/VisualState1', 'Điện thoại liên lạc nguyên vẹn')}
${row('Điện thoại bàn Hỏng (State 2)', 'Sprites/Visuals/ConsoleCommunicator/VisualState2', 'Điện thoại vỡ nát ống nghe')}
${row('Điện thoại đặt trên bàn (State 3)', 'Sprites/Visuals/ConsoleCommunicator/VisualState3', 'Cụm điện thoại kèm phụ kiện')}
${row('Điện thoại Nâng cấp Cấp 2 (State 4)', 'Sprites/Visuals/ConsoleCommunicator/VisualState4', 'Điện thoại kết nối viễn thông cao cấp')}
${row('Cổ vật trên mặt bàn (Artifact)', 'Sprites/Items/SpaceshipItemArtifact/SpaceshipItemArtifact', 'Phiến cổ vật đặt ngay mặt bàn Console')}

---

## 6. CỤM ĐỒNG HỒ & ĐÒN BẨY CHỐT NGÀY (DAYDISPLAY CLUSTER)

### 6.1. Cấu Trúc Khối Điều Khiển Sol & Chốt Ngày
Nằm ở vách cực phải của buồng lái ($wx \\approx 16.32 - 18.12$), đây là khối cơ học hiển thị chỉ số Sol và kích hoạt chuyển Sol:
1. **Đồng hồ số Sol (\`SpaceshipClock\`)**: Hộp kim loại gắn trên tường ($wx = 17.040, wy = 7.960$), bên trong có 3 ô hiển thị số ngày kiểu lật trang (Flipclock).
2. **3 Chữ số hiển thị Sol (Digit 1, 2, 3)**:
   * **Digit 1 (Hàng trăm)**: $wx = 16.320, wy = 6.510$.
   * **Digit 2 (Hàng chục)**: $wx = 16.960, wy = 6.540$.
   * **Digit 3 (Hàng đơn vị)**: $wx = 17.600, wy = 6.550$.
   * Cả 3 số đều có phiên bản hoạt ảnh quay số \`SpaceshipFlipclockAnim_0001\` (Order 7) lồng đè lên số tĩnh (Order 6).
3. **Đòn bẩy kết thúc ngày (\`SpaceshipEndday\`)**: Cụm cơ cấu cần gạt thép gắn tường ($wx = 17.328, wy = 2.469$).
4. **Cần gạt chuyển động (\`LeverPanel\`)**: Tay đòn gạt có animation gạt xuống khi chốt ngày ($wx = 18.124, wy = 1.575$).
5. **4 Tờ giấy báo cáo (Report Papers)**: Được kẹp trên thân đòn bẩy để báo hiệu các sự việc cần người chơi kiểm tra trước khi gạt cần (Sự kiện, Khẩu phần, Thám hiểm, Chế tạo).

### 6.2. Bảng Tọa Độ Cụm Đồng Hồ & Đòn Bẩy (DayDisplay)
${tableHeader}
${row('Hộp đồng hồ Sol (Clock)', 'Sprites/ComputersAndSystems/DayDisplay/Clock', 'Khung đồng hồ chính trên tường')}
${row('Đèn đồng hồ Xanh (Green Light)', 'Sprites/ComputersAndSystems/DayDisplay/Clock/GreenLightEndOfDay', 'Đèn báo trạng thái đồng hồ')}
${row('Đèn đồng hồ Đỏ (Red Light)', 'Sprites/ComputersAndSystems/DayDisplay/Clock/RedLightEndOfDay', 'Đèn báo chưa thể chốt Sol')}
${row('Đèn đồng hồ Vàng (Yellow Light)', 'Sprites/ComputersAndSystems/DayDisplay/Clock/YellowLightEndOfDay', 'Vùng sáng vàng chiếu quanh')}
${row('Chữ số Hàng trăm (Digit 1)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplayDigit1', 'Số tĩnh chữ số 1')}
${row('Chữ số Hàng chục (Digit 2)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplayDigit2', 'Số tĩnh chữ số 2')}
${row('Chữ số Hàng đơn vị (Digit 3)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplayDigit3', 'Số tĩnh chữ số 3')}
${row('Hoạt ảnh lật số 1 (Flip Digit 1)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplayDigit1Anim', 'Animation lật số hàng trăm')}
${row('Hoạt ảnh lật số 2 (Flip Digit 2)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplayDigit2Anim', 'Animation lật số hàng chục')}
${row('Hoạt ảnh lật số 3 (Flip Digit 3)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplayDigit3Anim', 'Animation lật số hàng đơn vị')}
${row('Thân đòn bẩy (Endday Sprite)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplaySprite', 'Khung đế đòn bẩy chốt ngày')}
${row('Tay cần gạt động lực (Lever Panel)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplaySprite/LeverPanel', 'Tay gạt animation chuyển Sol')}
${row('Giấy kẹp Sự kiện (Event Paper)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplaySprite/EventPaperEndOfDay', 'Thẻ nhắc đọc sự cố chưa giải quyết')}
${row('Giấy kẹp Khẩu phần (Rationing Paper)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplaySprite/RationingPaperEndOfDay', 'Thẻ nhắc chưa phân phối súp/nước')}
${row('Giấy kẹp Thám hiểm (Expedition Paper)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplaySprite/ExpeditionPaperEndOfDay', 'Thẻ nhắc hành trình thám hiểm')}
${row('Giấy kẹp Chế tạo (Crafting Paper)', 'Sprites/ComputersAndSystems/DayDisplay/DayDisplaySprite/CraftingPaperEndOfDay', 'Thẻ nhắc tiến độ máy tái chế')}

---

## 7. CÁC PHÂN KHU HỖ TRỢ BỔ SUNG TRONG KHOANG TÀU (ADDITIONAL STATIONS)

Để hệ thống giao diện Project Hail đồng bộ 100% với toàn bộ scene gốc, dưới đây là tọa độ của các trạm chức năng và chi tiết nội thất còn lại:

### 7.1. Trạm Máy Chế Tạo 3D Vách Trái (Crafting System)
Nằm tại $wx \\approx -6.610 - -6.615, wy \\approx 5.720 - 5.724$, Layer 3:
${tableHeader}
${row('Máy Chế tạo Cấp 1 (Crafting Level 1)', 'Sprites/ComputersAndSystems/CraftingSystem/Level1', 'Máy chế tạo cơ bản')}
${row('Máy Chế tạo Cấp 2 (Crafting Level 2)', 'Sprites/ComputersAndSystems/CraftingSystem/Level2', 'Máy chế tạo nâng cấp')}
${row('Máy Chế tạo Cấp 3 (Crafting Level 3)', 'Sprites/ComputersAndSystems/CraftingSystem/Level3', 'Máy chế tạo tối tân')}
${row('Đèn máy chế tạo Đỏ (Red Light)', 'Sprites/ComputersAndSystems/CraftingSystem/RedLight', 'Đèn báo đang bận/lỗi')}
${row('Đèn máy chế tạo Xanh (Green Light)', 'Sprites/ComputersAndSystems/CraftingSystem/GreenLight', 'Đèn báo sẵn sàng tái chế')}
${row('Đèn máy chế tạo Vàng (Yellow Light)', 'Sprites/ComputersAndSystems/CraftingSystem/YellowLight', 'Vùng sáng tỏa đèn máy chế tạo')}

### 7.2. Trạm Điều Hướng & Ăng-Ten Thám Hiểm (Expedition Station)
Nằm tại $wx \\approx 3.304 - 7.714, wy \\approx 2.609 - 5.012$:
${tableHeader}
${row('Ăng-ten thám hiểm Cấp 1 (Level 1)', 'Sprites/ComputersAndSystems/ExpeditionDisplay /Level1', 'Bộ thu phát định vị cơ bản')}
${row('Ăng-ten thám hiểm Cấp 2 (Level 2)', 'Sprites/ComputersAndSystems/ExpeditionDisplay /Level2', 'Trạm điều hướng nâng cấp')}
${row('Đế ăng-ten thám hiểm Cấp 3 (Base)', 'Sprites/ComputersAndSystems/ExpeditionDisplay /Level3', 'Khung đế ăng-ten chảo cao cấp')}
${row('Chảo ăng-ten Cấp 3 (Dish)', 'Sprites/ComputersAndSystems/ExpeditionDisplay /Level3/Level3Dish', 'Chảo radar định vị vệ tinh')}
${row('Giắc cắm ăng-ten Cấp 3 (Plug)', 'Sprites/ComputersAndSystems/ExpeditionDisplay /Level3/Level3Plug', 'Cáp nguồn cao tần radar')}
${row('Đèn thám hiểm Đỏ (Red Light)', 'Sprites/ComputersAndSystems/ExpeditionDisplay /RedLightExpedition', 'Đèn báo bão/nguy hiểm')}
${row('Đèn thám hiểm Xanh (Green Light)', 'Sprites/ComputersAndSystems/ExpeditionDisplay /GreenLightExpedition', 'Đèn báo đường thông suốt')}
${row('Đèn thám hiểm Vàng (Yellow Light)', 'Sprites/ComputersAndSystems/ExpeditionDisplay /YellowLightExpedition', 'Vùng sáng vàng điều hướng')}

### 7.3. Máy Tính Nhật Ký Starlog Vách Trái (Starlog Computer)
Nằm tại mép vách bên trái buồng tàu ($wx = -15.590, wy = -1.450$), Layer 9, Order 1:
${tableHeader}
${row('Máy tính Starlog (Starlog Sprite)', 'Sprites/ComputersAndSystems/StarlogComputer/EventComputerSprite', 'Terminal lưu trữ nhật ký sứ mệnh')}
${row('Đèn Starlog Đỏ (Red Light)', 'Sprites/ComputersAndSystems/StarlogComputer/RedLightStarlog', 'Đèn báo tin khẩn chưa đọc')}
${row('Đèn Starlog Xanh (Green Light)', 'Sprites/ComputersAndSystems/StarlogComputer/GreenLightStarlog', 'Đèn báo nhật ký bình thường')}
${row('Đèn Starlog Vàng (Yellow Light)', 'Sprites/ComputersAndSystems/StarlogComputer/YellowLightStarlog', 'Vùng sáng tỏa terminal Starlog')}

### 7.4. Kết Cấu Buồng Lái & Thiết Bị Môi Trường (Cabin Architecture & Environment)
${tableHeader}
${row('Vỏ khoang tàu chính (Spaceship)', 'Sprites/Spaceship/Spaceship', 'Khung vỏ chính có ô cửa sổ cắt alpha rỗng')}
${row('Dàn đèn trần chính (Spaceship Light)', 'Sprites/Spaceship/SpaceshipLight', 'Vệt sáng chiếu từ trần buồng lái')}
${row('Đèn báo động đỏ nóc (Red Alert)', 'Sprites/Spaceship/RedAlert', 'Còi đèn xoay báo động cấp cứu')}
${row('Quạt thông gió nhỏ 1 (Fan 1)', 'Sprites/Spaceship/Fan1', 'Quạt hút khí vách trên')}
${row('Quạt thông gió lớn 2 (Fan 2)', 'Sprites/Spaceship/Fan2', 'Quạt hút khí nóc trần (scale 1.61)')}
${row('Miếng vá vỏ tàu (Expedition Patch)', 'Sprites/Spaceship/SpaceshipExpeditionPatch', 'Miếng kim loại hàn vá thủng vách')}
${row('Nền không gian ngoài cửa sổ', 'Sprites/Background/Background/Background_2', 'Bầu trời vũ trụ sâu Layer 0')}

---

## 8. HƯỚNG DẪN TÍCH HỢP CHO LẬP TRÌNH VIÊN WEB (CSS / TAILWIND IMPLEMENTATION)

### 8.1. Cấu Trúc Khung Chứa Stage Tỷ Lệ 4:3 Responsive
Để màn hình không bao giờ bị méo mó hay co dãn sai tỷ lệ trên các màn hình desktop/mobile:
\`\`\`tsx
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
        left: \`\${soup.leftPct}%\`,
        top: \`\${soup.topPct}%\`,
        width: \`\${soup.widthPct}%\`,
        height: \`\${soup.heightPct}%\`,
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
\`\`\`

### 8.2. Quy Tắc Bất Di Bất Dịch Khi Render Sprite (Golden Rules)
1. **Luôn dùng \`object-contain\`**: Tuyệt đối không dùng \`object-fill\` hoặc \`object-cover\` cho các sprite vật thể và nhân vật. Vì sprite xuất từ texture atlas có kích thước khung bao khác nhau, \`object-contain\` bảo đảm tỷ lệ gốc nguyên vẹn.
2. **Không làm tròn số thập phân trong CSS**: Khi định nghĩa \`style={{ left: '12.9557%', top: '44.9826%' }}\`, hãy giữ nguyên ít nhất 4 chữ số thập phân. Nếu làm tròn thành \`13%\` và \`45%\`, sai số tích lũy trên màn hình 4K (3840px) sẽ lên đến **$10 - 20\\text{ px}$**, làm lệch khớp mộng giữa các sprite (ví dụ nệm ghế và vết rách hoặc thân đòn bẩy và tay gạt).
3. **Phân tách Pointer Events**: Gán \`pointer-events-none\` cho toàn bộ hình ảnh nền và trang trí, chỉ gán \`pointer-events-auto\` cho các hitbox tương tác chính xác (nhân vật, máy tính, cần gạt, máy chế tạo) để tránh hiện tượng click bị cản trở bởi mép ảnh trong suốt của vật thể khác.
`;

fs.writeFileSync('docs/ui-ux/CABIN_SPATIAL_COORDINATES.md', md, 'utf8');
console.log('Successfully generated docs/ui-ux/CABIN_SPATIAL_COORDINATES.md. File length:', md.length);
