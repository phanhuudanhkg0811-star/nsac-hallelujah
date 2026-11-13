# Blender Asset Agent Brief — Fabricator Wall-Right Test

## Mục tiêu

Cập nhật pipeline Blender của Project Hail và tạo một asset thử nghiệm máy in 3D gắn ở vách phải, hướng vào trung tâm cabin. Asset phải kiểm chứng được pipeline 2.5D thật: có module Blender, multi-pass output, manifest mount/occlusion và integration test; không chỉ tạo một ảnh phẳng.

## 1. Thứ tự đọc bắt buộc

Đọc các file theo đúng thứ tự:

1. `WORK_CONTEXT.md` — hiểu phase mới nhất, quyết định của user và các vấn đề đang mở.
2. `PROJECT_CONTEXT.md` — hiểu gameplay, cabin, ràng buộc và quy tắc cập nhật context.
3. `ASSET_PROMPT_STANDARD.md` — palette, material response, geometry, state và prompt Blender.
4. `AEROMATTE_2_5D_ASSET_PIPELINE.md` — pipeline chính thức, slot-aware asset, multi-pass, manifest và validation gates.
5. `CABIN_SPATIAL_COORDINATES.md` — layer, z-index, safe line, anchor và hệ tọa độ cabin.
6. `GRAPHIC_ASSET_MAPPING_GUIDE.md` — cách mapping asset vào runtime.
7. `scripts/blender_render_pipeline.py` — script hiện tại và các phần cần nâng cấp.

Không bắt đầu modeling hoặc chỉnh script trước khi đọc đủ các file trên.

## 2. Quyết định đã chốt

- Asset là một thực thể game nhưng Blender phải tách thành nhiều object/collection logic.
- Fabricator thuộc nhóm vật phẩm kê vách, runtime slot `z-index: 20`.
- Test profile là `wall-right-inward`: máy gắn vào vách phải và hướng vào trung tâm.
- Projection là cabinet 2.5D, camera orthographic, pitch 12°.
- Silhouette là hộp chữ nhật với structural chamfer thẳng; softness đến từ fillet cục bộ, gasket, bumper và matte response.
- Chassis, cửa, HUD frame và cơ cấu static phải giữ nguyên giữa mọi state.
- HUD text runtime không bake vào composite.
- Emissive là pass riêng; không tự bloom trong composite.
- Wear nằm trong object/UV space, chỉ ở phần static và dùng cùng seed giữa các state.
- Không dùng normal pass ở test đầu tiên.
- Không bake bóng từ console, ghế, sàn hoặc cabin vào asset.

## 3. Nhiệm vụ cập nhật pipeline

Nâng cấp `scripts/blender_render_pipeline.py` để có các khả năng sau:

### 3.1 Cấu hình

Tách config khỏi geometry code, tối thiểu gồm:

```python
ASSET_ID = "fabricator_3d"
PROFILE_ID = "wall-right-inward"
RESOLUTION_X = 1000
RESOLUTION_Y = 800
CAMERA_PITCH_DEG = 12.0
CAMERA_YAW_DEG = 0.0  # giá trị thật phải đo từ placeholder
```

Không chốt `CAMERA_YAW_DEG`, `mountPoint` hoặc `baseLine` như giá trị thật nếu chưa đo từ cabin layout.

### 3.2 Collections

Tạo collections:

```text
00_CHASSIS_STATIC
10_DOOR_STATIC
20_MECHANICAL_STATIC
30_STATE_IDLE
31_STATE_WORKING
32_STATE_COMPLETE
33_STATE_DAMAGED
40_HUD_FRAME
41_HUD_RUNTIME_PLACEHOLDER
50_DECALS_AND_WEAR
90_RENDER_HELPERS
```

### 3.3 Render passes

Xuất tối thiểu cho state `idle` và `working`:

```text
composite.webp
alpha.webp
depth.webp
outline.webp
occlusion.webp
emissive.webp
```

Nếu pass riêng chưa thể hoàn thiện trong lần đầu, phải xuất placeholder đúng kích thước và ghi rõ trong manifest là `status: "placeholder"`; không được giả vờ rằng pass đã hoàn chỉnh.

### 3.4 Manifest

Xuất manifest tại:

```text
public/assets/aeromatte/fabricator_3d_wall_right.manifest.json
```

Manifest phải có:

- asset id;
- state list;
- projection;
- camera pitch/yaw/roll;
- canvas size;
- anchor, mountPoint và baseLine;
- local layer list;
- behind-wall/in-front-of-wall occlusion;
- output file names;
- validation status.

Các giá trị chưa đo phải đánh dấu `TBD`, không tự suy đoán.

## 4. Asset test cần tạo

Tạo fabricator có cấu trúc:

```text
rear wall mount
cable conduit
rectangular composite chassis
straight-chamfered rectangular door
soft gasket
recessed chamber
gantry rails
parked extruder
empty print bed
right-side HUD frame
rounded feet / mounting pads
```

State cần test:

### IDLE

- empty print bed;
- extruder ở home position;
- HUD frame không chứa text runtime hoặc chỉ có placeholder layer;
- emissive nominal.

### WORKING

- extruder hạ xuống;
- workpiece riêng;
- emissive amber;
- progress bar thuộc runtime/HUD layer.

Không cần tạo `complete` và `damaged` nếu pipeline chưa đủ; nhưng phải giữ collection/schema để mở rộng mà không phá chassis.

## 5. Integration test trong cabin

Sau khi render, phải đặt asset vào profile vách phải và kiểm tra:

1. Rear mount/cable nằm sau wall.
2. Chassis và door nằm trước wall.
3. Asset nằm đúng nhóm vật phẩm `z-index: 20`.
4. Console hoặc ghế foreground có thể che đúng phần cần che.
5. Base line khớp placeholder.
6. Hotspot bao đúng visual bounds.
7. Chuyển `idle → working` không làm chassis nhảy.
8. Alpha không tạo nền đen hoặc halo.
9. Composite và layer render có cùng kích thước/padding.
10. Layout 4:3 không bị overflow hoặc méo tỷ lệ.

Nếu chưa thể chạy browser smoke test, phải ghi rõ `NOT VERIFIED` trong báo cáo, không đánh dấu pass.

## 6. Validation report

Tạo báo cáo:

```text
public/assets/aeromatte/fabricator_3d_wall_right.validation.json
```

Báo cáo phải ghi:

- timestamp;
- Blender version nếu có;
- render engine;
- command đã chạy;
- output files;
- alpha result;
- dimensions;
- state chassis diff;
- palette result;
- integration result;
- known limitations.

Mỗi mục dùng một trong ba trạng thái:

```text
PASS
FAIL
NOT VERIFIED
```

## 7. Quy tắc không được vi phạm

- Không xóa asset cũ.
- Không overwrite `fabricator_3d_idle.webp` trước khi test mới được review.
- Không ghi các tọa độ minh họa vào manifest như tọa độ chính thức.
- Không gọi asset hoàn thành nếu chưa có alpha/depth/manifest hoặc chưa ghi rõ placeholder.
- Không bake cabin lighting, console shadow hoặc floor shadow.
- Không gộp tất cả object thành một mesh duy nhất.
- Không tự đổi canonical palette.
- Không thêm dependency hoặc Blender add-on mới mà không ghi vào báo cáo.
- Nếu Blender binary không có trong môi trường, chỉ được chuẩn bị script và báo cáo `NOT VERIFIED`; không tuyên bố render thành công.

## 8. Bàn giao cuối phase

Sau khi hoàn tất, cập nhật `WORK_CONTEXT.md` với:

1. file đã sửa/thêm;
2. command và version đã dùng;
3. output asset/pass/manifest;
4. test đã pass;
5. test chưa chạy;
6. hạn chế còn lại;
7. bước tiếp theo.

