import fs from 'node:fs';
import crypto from 'node:crypto';

const sources = ['src/data/parsecsSceneCoordinates.json', 'src/data/parsecsSittingTable.json'];
const [scene, sitting] = sources.map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
const documentPath = 'docs/ui-ux/CABIN_SPATIAL_COORDINATES.md';
const marker = '<!-- BEGIN GENERATED UNITY COORDINATES -->';
const intro = fs.readFileSync(documentPath, 'utf8').split(marker)[0].trimEnd();
const format = n => Number(n.toFixed(4));
const coords = r => [r.left, r.top, r.width, r.height].map(format).join(' / ');
const pixels = r => [r.left * 38.4, r.top * 28.8, r.width * 38.4, r.height * 28.8].map(format).join(' / ');
const lines = [
  marker,
  '## 9. Bộ dữ liệu scene Unity mới — 238 node và 48 tư thế/vị trí nhân vật',
  '',
  'Hai JSON dưới đây được bổ sung vào workspace trong quá trình triển khai. Bảng này xuất nguyên số liệu từ JSON để team tra cứu đầy đủ, phân biệt với **tọa độ UI theo chỉ đạo ở mục 3–5**. Nhiều vị trí khác nhau; không được coi bảng thiết kế và bảng scene là cùng một nguồn. Chưa tìm thấy script xuất camera/transform tạo hai JSON để kiểm chứng độc lập toàn bộ phép chiếu từ bản Unity gốc.',
  '',
  ...sources.map(file => `- [${file}](${file}) — SHA-256: \`${crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}\`.`),
  '',
  'Tái tạo mục này: `node scripts/generate-cabin-coordinate-tables.mjs`. Script giữ nguyên nội dung viết tay ở phía trên; không thay đổi UI hoặc dữ liệu nguồn.',
  '',
  '### 9.1. Toàn bộ sprite scene',
  '',
  '`wx/wy` và `sx/sy` là trường vị trí/scale được lưu trong JSON. CSS L/T/W/H là phần trăm canvas 4:3. `layer/ord` là thứ tự lớp của dữ liệu Unity, **không tự động tương đương CSS z-index**. Khi áp dụng phải ánh xạ lớp, tôn trọng `flipX`, và chỉ bật biến thể sprite phù hợp trạng thái (không vẽ đồng thời tất cả 238 node).',
  '',
  '| Scene node | Sprite | wx / wy | sx / sy | CSS L / T / W / H (%) | layer / ord | flipX |',
  '|---|---|---|---|---|---|---|',
];
for (const [name, r] of Object.entries(scene).sort(([a], [b]) => a.localeCompare(b))) {
  if (!r.sprite) {
    lines.push(`| \`${name}\` | — (slot transform) | ${r.wx} / ${r.wy} | ${r.sx} / ${r.sy} | — | — | sx < 0: ${r.sx < 0 ? 'Có' : 'Không'} |`);
    continue;
  }
  for (const key of ['left', 'top', 'width', 'height', 'wx', 'wy', 'sx', 'sy', 'layer', 'ord']) {
    if (!Number.isFinite(r[key])) throw new Error(`Invalid ${name}.${key}`);
  }
  lines.push(`| \`${name}\` | \`${r.sprite}\` | ${r.wx} / ${r.wy} | ${r.sx} / ${r.sy} | ${coords(r)} | ${r.layer} / ${r.ord} | ${r.flipX ? 'Có' : 'Không'} |`);
}
lines.push('', '### 9.2. Toàn bộ bảng nhân vật ngồi', '',
  'Giữ tên `slot0..3` của nguồn. Không suy ra slot là cột từ trái sang phải: `slot0` và `slot1` nằm trái/phải phía trước, các slot còn lại có vị trí/scale khác. `normal/dead` có bounds khác nhau, vì vậy cần cả bảng tọa độ tương ứng và sprite đúng tư thế. `zIndex` là giá trị được JSON cung cấp, phải xem lại khi đặt trong stacking context của UI.', '',
  '| Nhân vật | Slot | Trạng thái | CSS L / T / W / H (%) | x / y / w / h (px 3840×2880) | flipX | zIndex |',
  '|---|---|---|---|---|---|---|');
let poses = 0;
for (const [name, slots] of Object.entries(sitting)) for (const [slot, states] of Object.entries(slots)) for (const [state, r] of Object.entries(states)) {
  lines.push(`| ${name} | ${slot} | ${state} | ${coords(r)} | ${pixels(r)} | ${r.flipX ? 'Có' : 'Không'} | ${r.zIndex} |`);
  poses++;
}
lines.push('', `Tổng đã xuất: **${Object.keys(scene).length} scene node**, **${poses} tổ hợp nhân vật × slot × tư thế**.`, '<!-- END GENERATED UNITY COORDINATES -->', '');
fs.writeFileSync(documentPath, intro + '\n\n' + lines.join('\n'));
console.log(`Wrote ${Object.keys(scene).length} scene rows and ${poses} sitting rows to ${documentPath}`);
