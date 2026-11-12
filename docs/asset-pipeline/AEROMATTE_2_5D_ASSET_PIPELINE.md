# AEROMATTE 2050 — PIPELINE ASSET 2.5D

> Tài liệu phối hợp giữa Blender, multi-pass sprite render và cabin React/CSS của Project Hail.
> Mục tiêu là tạo asset có chất lượng gần concept art nhưng vẫn có cấu trúc chiều sâu, state ổn định và khớp hệ tọa độ cabin 2.5D.

## 1. Mục tiêu và nguyên tắc

Asset không được kết thúc ở dạng một ảnh phẳng đặt trên background. Mỗi asset phải có:

- Model Blender dạng module, có cấu trúc hình học thật.
- Projection 2.5D thống nhất với cabin.
- Chassis bất biến giữa các state.
- Các bộ phận có quan hệ trước/sau rõ ràng.
- Alpha trong suốt, không có floor hoặc cast shadow ngoài asset.
- Multi-pass render và manifest để React có thể ghép theo layer.
- Kiểm thử visual, alpha, silhouette, state alignment và cabin integration.

Pipeline chuẩn:

```text
Concept art
  → reference guide
  → Blender modular model
  → geometry/material refinement
  → fixed 2.5D camera
  → multi-pass render
  → alpha/depth/manifest validation
  → React layered composition
  → cabin smoke test
```

## 2. Tài liệu và source of truth

| Thành phần | Source of truth |
|---|---|
| Ngôn ngữ màu, vật liệu, prompt | `ASSET_PROMPT_STANDARD.md` |
| Vị trí, scale, safe line, z-index cabin | `CABIN_SPATIAL_COORDINATES.md` |
| Quy tắc mapping sprite | `GRAPHIC_ASSET_MAPPING_GUIDE.md` |
| Procedural Blender render | `scripts/blender_render_pipeline.py` |
| Runtime state và UI | `src/store/`, `src/components/` |

Không sửa một source bằng cách ngầm thay đổi source khác. Nếu camera, palette hoặc projection thay đổi, phải cập nhật prompt, pipeline script và manifest cùng một phase.

## 3. Blender source structure

Mỗi asset là một thực thể độc lập trong game nhưng được chia thành các collection/object logic trong Blender:

```text
FABRICATOR_MASTER
├── 00_CHASSIS_STATIC
│   ├── chassis_shell
│   ├── outer_panels
│   ├── feet
│   ├── bumpers
│   └── service_hatch
├── 10_DOOR_STATIC
│   ├── door_frame
│   ├── gasket
│   ├── glass
│   └── latch
├── 20_MECHANICAL_STATIC
│   ├── gantry_rails
│   ├── print_bed
│   ├── cable_conduit
│   └── extruder_mount
├── 30_STATE_IDLE
├── 31_STATE_WORKING
├── 32_STATE_COMPLETE
├── 33_STATE_DAMAGED
├── 40_HUD
├── 50_DECALS
└── 90_RENDER_HELPERS
```

`00_CHASSIS_STATIC`, `10_DOOR_STATIC` và `20_MECHANICAL_STATIC` phải dùng chung cho mọi state. Chỉ các thành phần có hành vi hoặc trạng thái mới nằm trong collection state.

## 4. Geometry và độ sâu nội bộ

### 4.1 Silhouette

Thiết bị hậu 2050 của Project Hail dùng cấu trúc hộp chữ nhật công nghiệp:

- Mặt chính là các plane chữ nhật.
- Góc cấu trúc dùng straight chamfer/clipped corner.
- Cửa kính là hình chữ nhật với góc vát thẳng.
- Độ mềm đến từ fillet nhỏ, gasket, bumper, handle và vật liệu matte.
- Không dùng thân capsule hoặc bo tròn toàn bộ silhouette.

### 4.2 Thứ tự hình học trong fabricator

```text
rear shell
  < chamber interior
  < gantry and rails
  < print bed
  < extruder
  < door frame and glass
  < HUD screen
  < handle, latch and decals
```

### 4.3 Bốn loại depth

1. **Internal depth**: khoang lõm, ray, bàn in, đầu in, cửa kính.
2. **Occlusion depth**: bộ phận nào che bộ phận nào bên trong asset.
3. **Cabin depth**: asset nằm trước/sau wall, console, ghế và các equipment khác.
4. **Interaction depth**: hover, hotspot, selection outline và modal; luôn là UI layer riêng.

## 5. Camera và render profile

Render profile phải được pin và dùng cho mọi state:

```text
Projection: orthographic 2.5D cabinet
Pitch: 12 degrees top-down
Resolution: 1000 × 800 (hoặc profile đã đăng ký)
Film: transparent
Alpha: RGBA straight alpha
Ground plane: disabled
External cast shadow: disabled
Bloom: disabled
Motion blur: disabled
Engine: cố định theo pipeline script
Color management: cố định theo pipeline script
```

Camera, resolution, safe frame và base line không được thay đổi giữa các state.

## 6. Material và shading

Material phải dùng canonical palette trong `ASSET_PROMPT_STANDARD.md`. Shading được phép nhưng phải có neo:

- Cel ramp 2–3 tông.
- AO nhẹ trong khe panel và vùng tiếp xúc nội bộ.
- Highlight matte mềm, rộng và tiết chế.
- Không có harsh glare, bloom hoặc mirror reflection.
- Không bake bóng đổ xuống sàn cabin.
- Derived shades phải được sinh từ canonical HEX, không dùng màu ngẫu nhiên.

Phân biệt vật liệu bằng roughness, geometry và shading ổn định:

```text
composite/ABS: matte, roughness cao
rubber gasket: matte hơn, highlight thấp
painted metal: roughness trung bình-cao
glass/HUD: phản xạ nhẹ, không lấn át nội dung
```

## 7. Multi-pass output

Mỗi state nên có package thay vì chỉ một bitmap:

```text
fabricator_3d_idle/
├── composite.webp
├── depth.webp
├── alpha.webp
├── outline.webp
├── occlusion.webp
├── internal-shadow.webp
└── manifest.json
```

`composite.webp` dùng cho đường đi mặc định. Các pass còn lại phục vụ review, ghép layer nâng cao và kiểm tra kỹ thuật.

Không bake vào asset:

- bóng đổ xuống sàn cabin;
- bóng từ ghế hoặc console;
- ánh sáng nền cabin;
- hover glow;
- selection outline runtime;
- text runtime thay đổi theo game;
- prop nằm bên ngoài thực thể asset.

Được bake có kiểm soát:

- AO trong khoang;
- bóng tiếp xúc giữa gantry và rail;
- shading vật liệu;
- highlight matte nhẹ;
- phản xạ nội bộ của kính/HUD ở mức thấp.

## 8. Manifest bắt buộc

Ví dụ manifest cho fabricator:

```json
{
  "id": "fabricator_3d",
  "states": ["idle", "working", "complete", "damaged"],
  "projection": "cabinet-2.5d",
  "cameraPitchDeg": 12,
  "canvas": { "width": 1000, "height": 800 },
  "anchor": {
    "origin": [0.5, 1.0],
    "baseLine": 0.92,
    "interactionPoint": [0.78, 0.42]
  },
  "layers": [
    { "id": "rear-shell", "z": 20 },
    { "id": "chamber", "z": 21 },
    { "id": "gantry", "z": 22 },
    { "id": "bed", "z": 23 },
    { "id": "extruder", "z": 24 },
    { "id": "door", "z": 25 },
    { "id": "hud", "z": 26 }
  ],
  "validation": {
    "sameChassisAcrossStates": true,
    "transparentBackground": true,
    "allowGroundShadow": false
  }
}
```

## 9. State machine

```text
IDLE:
- empty print bed
- extruder at home
- nominal cyan/green HUD

WORKING:
- extruder lowered
- workpiece visible
- amber processing state

COMPLETE:
- extruder parked
- finished tool on bed
- green completion state

DAMAGED:
- one localized fault
- red alert state
- chassis và camera không đổi
```

## 10. Validation gates

Không đánh dấu asset hoàn thành nếu chưa qua các gate sau:

### Visual gate

- Silhouette, tỷ lệ và palette gần concept.
- Composite, ABS, glass, rubber và metal đọc được khác nhau.
- Có độ mềm nhưng giữ cấu trúc hộp chữ nhật.
- Không quá sạch như icon và không thô như blockout.

### Technical gate

- RGBA thật, alpha trong suốt.
- Đúng resolution và projection.
- Không có background/floor/cast shadow ngoài asset.
- Cùng bounding box và chassis mask giữa các state.
- Màu nằm trong canonical palette hoặc derived shades hợp lệ.
- WebP mở được và không mất alpha.

### Integration gate

- Base line khớp `CABIN_SPATIAL_COORDINATES.md`.
- Bị che đúng bởi console, ghế hoặc equipment foreground.
- `object-contain` không làm méo asset.
- Hotspot khớp visual bounds.
- Chuyển state không giật chassis.
- Không phá layout 4:3 của cabin.

## 11. Trạng thái của pipeline hiện tại

Đã có:

- `scripts/blender_render_pipeline.py` với model procedural, camera orthographic 12°, cel shading, alpha WebP và state idle/working.
- Asset WebP hiện tại trong `public/assets/aeromatte/`.
- Chuẩn prompt và palette trong `ASSET_PROMPT_STANDARD.md`.

Cần hoàn thiện để đạt pipeline 2.5D đầy đủ:

1. Đồng bộ palette script với canonical palette.
2. Tách static chassis khỏi dynamic state collection rõ ràng hơn.
3. Thêm output pass và manifest.
4. Thêm validator alpha, silhouette và state alignment.
5. Thêm test render trong cabin thật.
6. Pin Blender/render engine trước khi tuyên bố reproducible.

## 12. Quy tắc bàn giao

Mỗi phase asset phải cập nhật:

- file Blender/script hoặc nguồn tạo model;
- output composite và các pass;
- manifest;
- ảnh contact sheet review;
- kết quả validation;
- snapshot trong `WORK_CONTEXT.md`.

## 13. Thống nhất bắt buộc: slot-aware asset cho cabin

Asset không được sinh như một bitmap front-facing độc lập rồi mới trải lên placeholder. Layout cabin là một phần của input thiết kế.

Với thiết bị gắn ở vách phải và hướng vào trung tâm cabin, Blender phải tạo profile gắn vách riêng:

```text
Asset profile: wall-right
Projection: cabinet-2.5d
Camera: orthographic
Pitch: 12 degrees
Yaw: hướng từ vách phải vào trung tâm
Roll: cố định theo mặt vách
Mount edge: right wall
```

Các giá trị yaw, mount point và base line phải được đo từ layout thật trước khi khóa. Không dùng cùng một render front-facing cho mọi vị trí đặt asset.

### 13.1 Cấu trúc fabricator gắn vách

```text
Wall-mounted Fabricator
├── rear-mount / wall bracket
├── cable conduit
├── outer chassis
├── recessed chamber
├── gantry
├── print bed
├── extruder
├── front frame / door
├── HUD frame
├── emissive
└── interaction hotspot
```

Các object phải được tách trong Blender để xác định được phần nào nằm sau vách, phần nào nằm trước vách và phần nào có thể bị console/ghế foreground che.

### 13.2 Thứ tự layer của thiết bị trong Layer 2

```text
Cabin wall / shell
  → fabricator rear mount
  → fabricator chassis
  → chamber
  → gantry
  → print bed
  → extruder
  → front frame / glass
  → HUD
  → emissive
  → interaction hotspot
  → foreground seat / console occlusion
```

Toàn bộ fabricator vẫn thuộc slot vật phẩm vách `z-index: 20`, nhưng các bộ phận của nó có `localZ` riêng trong manifest.

### 13.3 Asset package cho runtime

Composite render chỉ dùng để preview hoặc fallback. Runtime ưu tiên package nhiều lớp:

```text
fabricator_3d_idle/
├── rear-mount.webp
├── chassis.webp
├── chamber.webp
├── gantry.webp
├── print-bed.webp
├── extruder.webp
├── door-frame.webp
├── hud-frame.webp
├── emissive.webp
├── occlusion.webp
├── alpha.webp
└── manifest.json
```

Không bake vào composite các yếu tố thuộc cabin như bóng từ console, ghế, sàn hoặc ánh sáng nền. Có thể bake AO và contact giữa các bộ phận bên trong asset.

### 13.4 Manifest mount và occlusion

Mỗi profile đặt asset phải khai báo mount, anchor, local layer và occlusion:

```json
{
  "id": "fabricator_3d",
  "mount": {
    "slot": "right-wall-equipment",
    "orientation": "wall-right-inward",
    "projection": "cabinet-2.5d",
    "yawDeg": 0,
    "pitchDeg": 12,
    "rollDeg": 0
  },
  "anchor": {
    "origin": [0.98, 0.42],
    "mountPoint": [0.91, 0.38],
    "baseLine": 0.78
  },
  "layers": [
    { "id": "rear-mount", "localZ": 0 },
    { "id": "chassis", "localZ": 1 },
    { "id": "chamber", "localZ": 2 },
    { "id": "gantry", "localZ": 3 },
    { "id": "bed", "localZ": 4 },
    { "id": "extruder", "localZ": 5 },
    { "id": "door-frame", "localZ": 6 },
    { "id": "hud", "localZ": 7 },
    { "id": "emissive", "localZ": 8 }
  ],
  "occlusion": {
    "behindWall": ["rear-mount", "cable-conduit"],
    "inFrontOfWall": ["chassis", "door-frame", "hud"]
  }
}
```

Giá trị trong ví dụ là schema, không phải tọa độ đã chốt. Tọa độ thật phải lấy từ `CABIN_SPATIAL_COORDINATES.md` và test ở canvas 4:3.

## 14. Thống nhất về look contract và material response

Pipeline chính thức tách ba loại thông tin:

```text
Vật: albedo, wear, AO nội bộ, material shading và emissive source
Cảnh: light rig, grade chung và contact shadow runtime
Cấu trúc: camera, projection, localZ, depth pass và manifest
```

Các quyết định áp dụng:

- Dùng canonical palette ở `ASSET_PROMPT_STANDARD.md` làm albedo source of truth.
- Màu ấm/tím của concept xử lý bằng scene tokens hoặc cabin grade, không lấy trực tiếp từ crop đã chịu ánh sáng.
- HUD runtime text tách khỏi composite; asset chỉ giữ bezel, kính và vùng layout.
- Emissive xuất pass riêng; glow runtime dùng profile chung, không để mỗi asset tự bloom.
- Wear đặt trong object/UV space, chỉ bake trên phần static và dùng cùng seed ở mọi state.
- Không dùng normal pass ở phase đầu; chỉ thêm khi cần relight động hoặc nhiều camera.
- Cạnh cấu trúc được phép là straight chamfer; softness đến từ fillet cục bộ, gasket, bumper và matte response.

## 15. Cabin integration gate bắt buộc

Asset chỉ được xem là hoàn thành sau khi test ở slot thật:

1. Đặt profile wall-right vào canvas 4:3.
2. Kiểm tra base line và mount point với placeholder vách phải.
3. Kiểm tra rear-mount nằm sau wall và chassis nằm trước wall.
4. Đặt console/ghế foreground để xác nhận occlusion.
5. Đổi `idle → working → complete → damaged` và xác nhận chassis không giật.
6. Click hotspot và xác nhận vùng tương tác khớp visual bounds.
7. Kiểm tra alpha, depth, emissive và composite ở kích thước runtime thật.

Nếu asset chỉ đẹp khi xem riêng nhưng fail một trong các bước trên, asset chưa đạt chuẩn pipeline.

