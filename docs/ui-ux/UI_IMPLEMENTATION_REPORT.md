# Báo cáo giao diện React Project Hail

Tài liệu ghi lại giao diện đang chạy để đối chiếu với 60 Parsecs! 1.3.2. Tọa độ bên dưới là giá trị đọc trực tiếp từ React và CSS, tính theo phần trăm của khung buồng tàu. Mức tương đồng với Unity cần kiểm tra bằng scene, prefab hoặc ảnh render của game gốc. Bản WebP hiện có trong workspace là 1600 × 1200, cùng tỉ lệ 4:3 với kích thước 3840 × 2880 nêu trong đặc tả.

## Khung hình và vùng bấm

Khung rộng tối đa bằng chiều cao viewport nhân 4/3, căn giữa và giữ tỉ lệ 4:3. Trên màn hình rộng có khoảng trống hai bên. Ngoại cảnh được ghép dưới vùng alpha, vỏ tàu ở lớp 10, thiết bị ở lớp 20, ghế và cần gạt ở lớp 30, màn hình bàn và đồng hồ ở lớp 40. Popup dùng dialog gốc của trình duyệt.

| Thành phần | Sprite hoặc cách dựng | Vị trí hiện tại | Thao tác |
|---|---|---|---|
| Vỏ buồng tàu | Spaceship.webp | Phủ toàn khung | Nền |
| Ngoại cảnh | SurvSpaceshuttlePlanet01View01.webp cho Mặt Trăng, Planet03View01 cho Sao Hỏa trong Hail | Trái 41%, trên 26%, rộng 18%, cao 23% | Hình tham chiếu qua cửa sổ |
| Sổ treo vách | SpaceshipStarlog.webp | Trái 0%, trên 30%, rộng 13%, cao 49% | Mở nhật ký |
| Máy chế tạo | SpaceshipCrafting.webp và hai sprite cấp 2–3 trong bản đối chiếu | Trái 29%, trên 20%, rộng 11,5%, cao 23% | Mở chế tạo hoặc kỹ thuật |
| Kệ trái | SpaceshipShelfLeftClosed0.webp và tối đa 6 sprite vật phẩm sở hữu trong state đối chiếu | Trái 11,5%, trên 19,5%, rộng 13%, cao 29% | Hiển thị đồ |
| Chồng súp | SpaceshipItemSoup01–09.webp | Phải 14%, trên 33%, rộng 9%, cao 14% | Mở kho súp hoặc khẩu phần |
| Giáp EVA | SpaceshipItemSuit.webp và hai sprite cấp 2–3 trong bản đối chiếu | Phải 29,5%, trên 25,5%, rộng 10%, cao 32% | Mở bảng thám hiểm hoặc robot |
| Cần gạt | SpaceshipEndday.webp | Phải 0%, trên 24%, rộng 11%, cao 34% | Mở bước xác nhận chốt Sol |
| Đồng hồ Sol | Text monospace, đệm đủ 3 chữ số | Phải 1,5%, trên 17% | Hiển thị Sol của chế độ hiện tại |
| Bàn giữa | SpaceshipConsole.webp | Trái 35%, dưới 3%, rộng 30%, cao 45% | Nền thiết bị |
| Màn hình trên bàn | SpaceshipEvent.webp | Trái 44%, dưới 18%, rộng 12%, cao 20% | Mở nhật ký |
| Ghế và người | SpaceshipChair.webp, SpaceshipChairCaptain.webp và sprite nhân vật | Grid bốn cột, lề hai bên 12%, dưới 4%, cao 52%. Ghế rộng và cao 78% ô, cách đáy 2%. Ghế thuyền trưởng cột 3. | Bấm nhân vật mở bảng khẩu phần hoặc phi hành đoàn |

Mã nguồn: [ParsecsSurvivalBench.tsx](src/components/ParsecsSurvivalBench.tsx), [index.css](src/index.css), [đặc tả UI](UI_UX_SPECIFICATION.md).

## Đường gọi chức năng

| Vùng bấm | Project Hail mặc định | Bản đối chiếu 1.3.2 |
|---|---|---|
| Sổ và màn hình | EventTerminal gọi chooseEventOption hoặc advancePhase. | Starlog dùng lựa chọn của sự kiện hiện tại, gọi parsecsChooseEventOption. Bộ chọn deck và sự kiện nằm trong menu kỹ thuật. |
| Máy chế tạo | SystemControls gọi repairSystem hoặc upgradeSystem cho Scrubber, WRS, Solar và Airlock trong pha kỹ thuật. | Khung CraftingComputer có bốn nhóm chế tạo, tái chế, nâng cấp và sửa. Gọi parsecsCraftSoup, parsecsItemOp hoặc parsecsUpgradeShipSystem. |
| Giáp EVA | Khung Expeditron báo khảo sát robot chưa khả dụng. | Bảng chọn điểm đến, người và trang bị gọi parsecsSendExpedition. Trong testbench hiện tại, hàm dispatchExpedition thực hiện ngay khi bấm. Đây là điểm khác với luồng lập kế hoạch rồi xuất phát cuối ngày đã truy ở bản gốc. |
| Nhân vật | Hiện tên người đã chọn và RationingPanel. O₂, nước, thức ăn và nghỉ là kế hoạch chung của đội. | Bảng phi hành đoàn có nhu cầu, chọn súp, thuốc và động viên. |
| Cần gạt | RationingPanel dẫn qua các pha còn lại. endSol chạy DaySimulationEngine, lấy chênh lệch tài nguyên và mở Science Brief khi Sol thật sự tăng. | Bảng khẩu phần có súp và thuốc theo người. Nút gạt gọi parsecsEndSol rồi executeParsecsEndOfDay. Màn chuyển Sol lấy ngày của bản đối chiếu. |

Hai chế độ dùng chung buồng tàu nhưng dùng state tiến trình riêng. Thao tác chốt Sol ở một chế độ giữ nguyên số Sol của chế độ kia. Nút khởi động lại trong menu gọi resetGame để đặt lại cả hai state.

Mã nguồn: [App.tsx](src/App.tsx), [gameStore.ts](src/store/gameStore.ts), [NightTransitionCutscene.tsx](src/components/NightTransitionCutscene.tsx).

## Kiểm chứng và điểm cần đối chiếu

- Đã chạy TypeScript và bản dựng production. Kiểm tra trên Chromium ở viewport desktop 1440 × 900 và mobile 390 × 844 cho tỉ lệ 4:3. Đã thử mở nhật ký, chuyển pha, nâng cấp, mở khẩu phần, chọn súp trong bản đối chiếu và chuyển Sol ở cả hai chế độ. Ca thử xác nhận số Sol độc lập.
- Bộ sprite hiện tại dùng hình nhân vật có sẵn, chưa dựng đủ dáng ngồi toàn thân và biểu cảm theo lớp như ảnh game gốc. Ngoại cảnh và nhân vật trong chế độ Hail là hình tham chiếu từ bộ sprite hiện có.file:///e%3A/Project%20Hail/UI_IMPLEMENTATION_DIRECTIVE.md
- Phần còn cần kiểm tra với game gốc gồm crop và điểm neo từng sprite, lớp che khuất khi ngồi, trạng thái khóa của máy thám hiểm, và thứ tự lập lịch chuyến. Các mốc CIL đã có cho thám hiểm là 06003571, 060031C1, 060031C4, 060031C2 và 060031C5.
- Hail hiện có màn báo chưa khả dụng cho robot. Các lựa chọn nhật ký dùng catalog cục bộ của dự án. Chưa xác nhận liên kết trực tiếp với bản ghi DONKI trong luồng này.

Tham chiếu bổ sung: [Truy vết Windows](WINDOWS_GAMEPLAY_TRACE.md), [Đặc tả kiến trúc](SYSTEM_ARCHITECTURE.md).
