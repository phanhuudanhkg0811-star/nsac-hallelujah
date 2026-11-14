# HƯỚNG DẪN ĐỒ HỌA & ÁNH XẠ TÀI NGUYÊN (GRAPHIC ASSET MAPPING GUIDE)
> **Dự án**: Junior Astronaut Mission Trainer (2026 NASA Space Apps Challenge)  
> **Nguồn đối chiếu**: Mã nguồn dịch ngược C# `Assembly-CSharp-firstpass.dll` & 289 asset WebP tại `public/assets/parsecs/`  
> **Mục tiêu**: Hướng dẫn team UI React giải quyết dứt điểm vấn đề gắn đúng asset vào các vị trí placeholder, xử lý lỗi tỷ lệ, CSS layering và chống vỡ ảnh 404.

---

## 1. NGUYÊN NHÂN TEAM UI BỊ KẸT & CƠ CHẾ GỐC CỦA C#

Trong Unity của *60 Parsecs!*, các vật thể không phải là các thẻ `<div>` HTML tĩnh hay ảnh cố định. Chúng được điều khiển bởi hệ thống **Controller-Driven Sprite Binding**:

1. **Bất quy tắc trong đặt tên file của game gốc (Inconsistent Naming)**:
   * Nếu team UI dùng phép cộng chuỗi kiểu ``SpaceshipItem${id}${isUpgraded ? 'Upgraded' : ''}.webp``, **hơn một nửa số ảnh sẽ bị lỗi 404**!
   * *Ví dụ thực tế từ mã nhị phân*:
     * Băng keo: `SpaceshipItemDuckttape.webp` (thừa 1 chữ `t`), icon hỏng lại là `IconDuckttapeDamaged.webp` vs `IconDucttape.webp`.
     * Pin năng lượng nâng cấp: `SpaceshipItemBatteryUpgrade.webp` (không có chữ `d` ở cuối).
     * Áo giáp nâng cấp: `SpaceshipItemArmorUpgraded.webp` (có chữ `d` ở cuối).
     * Hộp sơ cứu Medkit hỏng: Không hề có file `Damaged`, game gốc dùng lại file `SpaceshipItemMedkit.webp`.
     * Nhân vật DeeDee: Tên file là `EndCrewDeedeeStandard.webp` (chữ d thứ hai viết thường: `Deedee`), nếu viết hoa `DeeDee` sẽ bị lỗi 404 trên môi trường Linux/Production.
2. **Kéo dẹt hình ảnh do CSS (Aspect Ratio Distortion)**:
   * Mỗi sprite vật phẩm có kích thước bounding-box khác nhau. Nếu gán `className="w-full h-full"` mà thiếu `object-fit: contain`, ảnh sẽ bị kéo méo mó.
3. **Thứ tự xếp lớp chiều sâu (Z-Index Layering)**:
   * Cửa sổ quan sát ngoại cảnh thực chất nằm **phía sau** buồng tàu. Ảnh buồng tàu `Spaceship.webp` có một lỗ tròn trong suốt (alpha cut-out) tại vị trí ô cửa sổ. Nếu xếp `z-index` sai, ngoại cảnh sẽ đè lên buồng tàu hoặc bị che khuất hoàn toàn.
4. **Lỗi nối đường dẫn 2 lần (Double Prefix Bug)**:
   * Nếu resolver trả về `/assets/parsecs/foo.webp` mà component lại ghép `${ASSET_BASE}/${sprite}`, đường dẫn sẽ thành `/assets/parsecs//assets/parsecs/foo.webp` dẫn đến mất hình.

---

## 2. QUY TẮC PHÂN TẦNG ĐỒ HỌA (Z-INDEX PIPELINE)

Để giao diện hiển thị chuẩn như game gốc, buồng trạm phải tuân thủ nghiêm ngặt hệ thống 5 tầng chiều sâu sau trong `aspect-[4/3]`:

```
┌────────────────────────────────────────────────────────┐
│ [Z-50 / Z-100] CÁC POPUP DIALOG (Starlog, EndOfDay...) │
├────────────────────────────────────────────────────────┤
│ [Z-45] THANH TELEMETRY & CHÂN TRANG FOOTER             │
├────────────────────────────────────────────────────────┤
│ [Z-30] 4 PHI HÀNH GIA (Ghế ngồi + Sprite Paperdoll)    │
├────────────────────────────────────────────────────────┤
│ [Z-20] CÁC TRẠM TƯƠNG TÁC (Kệ trái, Máy chế tạo, Kệ súp, Cần gạt, Bàn máy tính)
├────────────────────────────────────────────────────────┤
│ [Z-10] VỎ BUỒNG TÀU (Spaceship.webp - Có lỗ Alpha)      │
├────────────────────────────────────────────────────────┤
│ [Z-0]  NGOẠI CẢNH CỬA SỔ (Mặt Trăng / Sao Hỏa / Vũ trụ)│
└────────────────────────────────────────────────────────┘
```

---

## 3. BẢNG ÁNH XẠ TOÀN BỘ PLACEHOLDER & SPRITE CHUẨN

Đã chuẩn hóa toàn bộ hàm truy xuất trong module:  
📄 [`src/utils/parsecsAssetResolver.ts`](file:///e:/Project%20Hail/src/utils/parsecsAssetResolver.ts)

### 3.1. Ô Cửa Sổ Ngoại Cảnh (`ViewportPorthole`)
* **C# Controller**: `WindowView` & `PlanetLandingController`.
* **Vị trí**: `left: 41%`, `top: 26%`, `width: 18%`, `height: 23%`, `z-index: 0`.
* **Quy tắc Sprite**:
  * **Mặt Trăng - Đã hạ cánh**: `/assets/parsecs/SurvSpaceshuttlePlanet01View01.webp`
  * **Mặt Trăng - Trên quỹ đạo / Bay xa**: `/assets/parsecs/SurvSpaceShuttlePlanet01Distant.webp`
  * **Sao Hỏa - Đã hạ cánh**: `/assets/parsecs/SurvSpaceshuttlePlanet02View01.webp`
  * **Sao Hỏa - Trên quỹ đạo / Bay xa**: `/assets/parsecs/SurvSpaceShuttlePlanet02Distant.webp`
  * **Không gian sâu / Bay chuyển tiếp**: `/assets/parsecs/SurvSpaceshuttleBlackholeView01.webp`

### 3.2. Trạm Chế Tạo 3D (`CraftingStation3D`)
* **C# Controller**: `CraftingManager` (PathID 13489).
* **Vị trí**: `left: 20%`, `top: 40%`, `width: 18%`, `height: 35%`, `z-index: 20`.
* **Quy tắc Sprite theo cấp độ**:
  * **Cấp 1 (Mặc định)**: `/assets/parsecs/SpaceshipCrafting.webp`
  * **Cấp 2 (Nâng cấp)**: `/assets/parsecs/SpaceshipCraftingLevel2.webp`
  * **Cấp 3 (Tối đa)**: `/assets/parsecs/SpaceshipCraftingLevel3.webp`

### 3.3. Cửa Thám Hiểm & Bộ Giáp EVA (`ExpeditionSuitHatch`)
* **C# Controller**: `ExpeditionManager` (PathID 13492).
* **Vị trí**: `right: 17%`, `top: 48%`, `width: 15%`, `height: 35%`, `z-index: 20`.
* **Quy tắc Sprite theo cấp độ**:
  * **Cấp 1 (Mặc định)**: `/assets/parsecs/SpaceshipItemSuit.webp`
  * **Cấp 2 (Nâng cấp)**: `/assets/parsecs/SpaceshipItemSuitLevel2.webp`
  * **Cấp 3 (Tối đa)**: `/assets/parsecs/SpaceshipItemSuitLevel3.webp`

### 3.4. Kệ Lương Thực / Chồng Hộp Súp (`RightConsumableShelf`)
* **C# Controller**: `SpaceshipConsumableShelfController`.
* **Vị trí**: `right: 14%`, `top: 33%`, `width: 9%`, `height: 14%`, `z-index: 20`.
* **Quy tắc Sprite**:
  * Số lượng súp được làm tròn trần và giới hạn trong khoảng `1..9`:
    * 1 hộp: `/assets/parsecs/SpaceshipItemSoup01.webp`
    * ...
    * 9 hộp: `/assets/parsecs/SpaceshipItemSoup09.webp`
  * Nếu số lượng `<= 0`: Ẩn hoàn toàn placeholder (không render sprite).
  * Vị trí pin dự phòng (nếu sở hữu): `/assets/parsecs/SpaceshipItemBattery.webp` (hoặc `Upgrade.webp`).

### 3.5. Kệ Vật Phẩm Trang Bị Vách Trái (`LeftEquipmentShelf`)
* **C# Controller**: `SpaceshipLeftShelfController` & `SpaceshipItemController`.
* **Vị trí khung kệ**: `left: 11.5%`, `top: 19.5%`, `width: 13%`, `height: 29%`, `z-index: 20`.
* **Ảnh cánh cửa/khung kệ**: `/assets/parsecs/SpaceshipShelfLeftClosed0.webp`.
* **Bảng tra cứu 13 vật phẩm chuẩn (Khớp 100% mã C#)**:

| Item ID | Tên Tiếng Việt | Base (Chuẩn) | Upgraded (Nâng cấp) | Damaged (Hỏng) | UpgradedDamaged |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `item_armor` | Áo Giáp Bảo Vệ | `SpaceshipItemArmor.webp` | `SpaceshipItemArmorUpgraded.webp` | `SpaceshipItemArmorDamaged.webp` | `SpaceshipItemArmorUpgradedDamaged.webp` |
| `item_artifact` | Cổ Vật Không Gian | `SpaceshipItemArtifact.webp` | `SpaceshipItemArtifactUpgraded.webp` | `SpaceshipItemArtifactDamaged.webp` | `SpaceshipItemArtifactUpgradedDamaged.webp` |
| `item_battery` | Khối Pin Năng Lượng | `SpaceshipItemBattery.webp` | `SpaceshipItemBatteryUpgrade.webp` | `SpaceshipItemBatteryDamaged.webp` | `SpaceshipItemBatteryUpgradeDamaged.webp` |
| `item_communicator` | Máy Bộ Đàm / Liên Lạc | `SpaceshipItemCommunicator.webp` | `SpaceshipItemCommunicatorUpgrade.webp` | `SpaceshipItemCommunicatorDamaged.webp` | `SpaceshipItemCommunicatorUpgradeDamaged.webp` |
| `item_gun` | Súng Laser | `SpaceshipItemGun.webp` | `SpaceshipItemGunUpgrade.webp` | `SpaceshipItemGunDamaged.webp` | `SpaceshipItemGunUpgradeDamaged.webp` |
| `item_handbook` | Sổ Tay Kỹ Thuật | `SpaceshipItemBook.webp` | `SpaceshipItemBookUpgrade.webp` | `SpaceshipItemBookDamaged.webp` | `SpaceshipItemBookUpgradeDamaged.webp` |
| `item_lighter` | Dụng Cụ Đánh Lửa | `SpaceshipItemLighter.webp` | `SpaceshipItemLighterUpgrade.webp` | `SpaceshipItemLighterDamaged.webp` | `SpaceshipItemLighterUpgradeDamaged.webp` |
| `item_mask` | Mặt Nạ Dưỡng Khí | `SpaceshipItemMask.webp` | `SpaceshipItemMaskUpgrade.webp` | `SpaceshipItemMaskDamaged.webp` | `SpaceshipItemMaskUpgradeDamaged.webp` |
| `item_medkit` | Hộp Sơ Cứu Y Tế | `SpaceshipItemMedkit.webp` | `SpaceshipItemMedkitUpgrade.webp` | `SpaceshipItemMedkit.webp` *(Dùng chung)* | `SpaceshipItemMedkitUpgrade.webp` |
| `item_shovel` | Xẻng Đào Đất | `SpaceshipItemShovel.webp` | `SpaceshipItemShovelUpgrade.webp` | `SpaceshipItemShovelDamaged.webp` | `SpaceshipItemShovelUpgradeDamaged.webp` |
| `item_tape` | Băng Keo Vũ Trụ | `SpaceshipItemDuckttape.webp` | `SpaceshipItemDuckttapeUpgrade.webp` | `SpaceshipItemDuckttapeDamaged.webp` | `SpaceshipItemDuckttapeUpgradeDamaged.webp` |
| `item_sock` | Chiếc Tất May Mắn | `SpaceshipItemSock.webp` | `SpaceshipItemSockUpgrade.webp` | `SpaceshipItemSock.webp` | `SpaceshipItemSockUpgrade.webp` |
| `Item_LifeSupportSystem` | Lõi Tái Tạo Sự Sống | `SpaceshipItemConcentrate.webp` | `SpaceshipItemConcentrate.webp` | `SpaceshipItemConcentrate.webp` | `SpaceshipItemConcentrate.webp` |

### 3.6. Phi Hành Đoàn & PaperDoll Ghế Ngồi (`CrewCabinSeats`)
* **C# Controller**: `CharacterBody` & `CadetIcon`.
* **Vị trí**: Dàn hàng ngang ở đáy buồng trạm `bottom: 4%`, `height: 52%`, `z-index: 30`.
* **Ghế ngồi**:
  * Vị trí 0, 1, 3 (Thành viên): `/assets/parsecs/SpaceshipChair.webp`
  * Vị trí 2 (Ghế cơ trưởng - Captain): `/assets/parsecs/SpaceshipChairCaptain.webp`
* **Quy tắc Sprite nhân vật**:
  * Nếu hy sinh (`!isAlive`): `/assets/parsecs/EndCrew{Key}Dead.webp`
  * Nếu tinh thần cực cao / hoàn thành mục tiêu: `/assets/parsecs/EndCrew{Key}Personal.webp`
  * Nếu trạng thái bình thường: `/assets/parsecs/EndCrew{Key}Standard.webp`
  * Khi đang ra ngoài thám hiểm (`isAwayOnExpedition`): Ẩn sprite người, hiển thị thẻ thông báo.

---

## 4. CODE MẪU BINDING DÀNH CHO TEAM UI (REACT JSX)

Team UI chỉ cần import trực tiếp từ `src/utils/parsecsAssetResolver.ts` như dưới đây:

### 4.1. Ví Dụ: Hiển Thị Kệ Vật Phẩm (`LeftEquipmentShelf.tsx`)
```tsx
import { getItemSprite, ASSET_BASE } from '../../utils/parsecsAssetResolver';
import type { ParsecsShelfItem } from '../../engine/ParsecsDecompiledEngine';

export function LeftEquipmentShelf({ items, onClick }: { items: readonly ParsecsShelfItem[]; onClick: () => void }) {
  // 6 ô hiển thị chuẩn trên kệ
  const SLOTS = ['item_armor', 'item_artifact', 'item_gun', 'item_handbook', 'item_mask', 'item_shovel'];

  return (
    <div className="cabin-shelf">
      {/* Vỏ cánh cửa kệ */}
      <img className="cabin-shelf-back" src={`${ASSET_BASE}/SpaceshipShelfLeftClosed0.webp`} alt="Kệ trang bị" />
      
      {/* Các slot vật phẩm bên trong */}
      {SLOTS.map((id, index) => {
        const item = items.find(entry => entry.id === id && entry.owned);
        if (!item) return null;

        const spriteUrl = getItemSprite(item.id, item.upgraded, item.damaged);

        return (
          <button
            key={id}
            type="button"
            className="cabin-hotspot"
            style={{
              left: `${(index % 3) * 33}%`,
              top: `${Math.floor(index / 3) * 50}%`,
              width: '33%',
              height: '48%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onClick}
          >
            <img
              src={spriteUrl}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            />
          </button>
        );
      })}
    </div>
  );
}
```

### 4.2. Ví Dụ: Hiển Thị Chồng Súp Động (`RightConsumableShelf.tsx`)
```tsx
import { getSoupCansSprite } from '../../utils/parsecsAssetResolver';

export function RightConsumableShelf({ soupCount, onClick }: { soupCount: number; onClick: () => void }) {
  const soupSprite = getSoupCansSprite(soupCount);

  if (!soupSprite) return null; // Hết súp thì ẩn

  return (
    <button
      type="button"
      className="cabin-hotspot"
      style={{
        position: 'absolute',
        right: '14%',
        top: '33%',
        width: '9%',
        height: '14%',
      }}
      onClick={onClick}
      aria-label={`Lương thực: ${soupCount} hộp súp`}
    >
      <img
        src={soupSprite}
        alt="Chồng hộp súp"
        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
      />
    </button>
  );
}
```

---

## 5. TÍCH HỢP LOGO GAME (ASTRONAUT BADGE)

Logo huy hiệu phi hành gia (với hình ảnh phản chiếu Mặt Trăng & Sao Hỏa trên kính mũ) đã được tích hợp sẵn:
* **Đường dẫn tĩnh**: `/logo.jpg` (trong `public/logo.jpg`).
* **Favicon Web**: Đã được gắn vào thẻ `<link rel="icon" href="/logo.jpg" />` trong `index.html`.
* **Telemetry Header**: Có thể đặt trực tiếp cạnh tiêu đề `HAIL / PARSECS` để tăng tính nhận diện thương hiệu cho bài thi NASA Space Apps.
