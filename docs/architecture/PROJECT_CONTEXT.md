# PROJECT CONTEXT: JUNIOR ASTRONAUT MISSION TRAINER

> Work-in-progress recovery snapshots are maintained in [`WORK_CONTEXT.md`](WORK_CONTEXT.md). Add a new dated snapshot after every meaningful implementation phase.

> **Cuộc thi**: 2026 NASA Space Apps Challenge  
> **Chủ đề (Challenge)**: Build a Junior Astronaut Mission Trainer (Games, Planets & Moons, Software, Space Exploration, Sun)  
> **Định dạng sản phẩm**: Web Game Simulator (Single Page Application, responsive trên Desktop & Mobile)  
> **Mục tiêu giáo dục (STEM)**: Giúp học sinh trải nghiệm trực tiếp các quyết định kỹ thuật và sự đánh đổi sống còn (engineering trade-offs) khi vận hành trạm tiền đồn trên Mặt Trăng và Sao Hỏa.

---

## 1. Nguồn cảm hứng & Mô hình Gameplay
* **Hình mẫu tham chiếu**: Cơ chế sinh tồn của tựa game *60 Parsecs!* (Robot Gentleman).
* **Phạm vi kế thừa**:
  * **CHỈ LẤY** phần sinh tồn quản lý theo lượt trong trạm (Survival & Resource Management Phase).
  * **LOẠI BỎ HOÀN TOÀN** giai đoạn 3D gom đồ 60 giây (Scavenge Phase) để tập trung 100% vào mô phỏng kỹ thuật không gian theo đúng yêu cầu đề bài NASA.
* **Vòng lặp cốt lõi (Core Turn-Based Loop / Sol Cycle)**:
  1. **Morning Briefing**: Đọc nhật ký trạm (Mission Log), thông báo tình trạng hư hỏng, sự kiện ngẫu nhiên trong đêm.
  2. **Engineering Decisions**: Phân bổ năng lượng (Power Grid), sửa chữa / nâng cấp 5 hệ thống trạm (Scrubber, Recycler, Solar, Airlock, Greenhouse), điều chuyển nhân sự xử lý sự cố.
  3. **Comms & Logistics**: Báo cáo với Trái Đất (Ground Control), tính toán độ trễ tín hiệu, yêu cầu phóng tàu chở hàng tiếp tế.
  4. **Evening Rationing**: Phân chia oxy, nước, khẩu phần dinh dưỡng cho từng phi hành gia và phân bổ nước cho nhà kính sinh học.
  5. **Night Simulation & End-of-Sol Debrief**: Động cơ mô phỏng tính toán suy hao tài nguyên, cập nhật sức khỏe/tâm lý, kiểm tra điều kiện sống còn. Màn hình báo cáo cuối ngày hiển thị bảng số liệu thống kê kèm hộp **"NASA Science Brief" (Kiến thức STEM giải thích nguyên nhân khoa học)** để phục vụ lứa tuổi học sinh 7–12.

---

## 2. Các Chiến dịch Hành tinh (Planetary Arcs)
Game được chia làm 2 chiến dịch với các điều kiện vật lý thực tế khác nhau:

### Arc 1: Trạm Mặt Trăng (Artemis Base Camp)
* **Độ trễ liên lạc (Comm Latency)**: ~1.3 giây mỗi chiều. Hỗ trợ từ Trái Đất gần như tức thì.
* **Thời gian tàu tiếp tế**: 3 - 5 Sol.
* **Thách thức kỹ thuật đặc thù**:
  * **Đêm Trăng kéo dài 14 ngày Trái Đất**: Pin mặt trời tê liệt, phụ thuộc vào năng lượng hạt nhân bề mặt (Fission Surface Power) hoặc pin lưu trữ.
  * **Bụi Regolith**: Hạt bụi Mặt Trăng sắc nhọn gây mài mòn gioăng đệm khí quyển và bộ lọc.
  * **Chênh lệch nhiệt độ cực đoan**: Từ -130°C đến +120°C.

### Arc 2: Tiền đồn Sao Hỏa (Ares Outpost)
* **Điều kiện mở khóa (Moon-to-Mars Progression)**:
  * Người chơi **không thể chuyển tự do** sang Sao Hỏa. Phải hoàn thành sứ mệnh Mặt Trăng (tối thiểu 15 Sol, vượt qua Đêm Trăng), nâng cấp hệ thống trạm (tổng cấp ≥ 6, độ bền ≥ 80%), giữ tối thiểu 3 phi hành gia khỏe mạnh và **tích trữ đủ vật tư cho tàu liên hành tinh** (≥ 35kg O2, ≥ 45L nước, ≥ 30kg thức ăn, ≥ 12kg phụ tùng, ≥ 40kWh điện).
  * Khi phóng tàu sang Sao Hỏa, một phần vật tư sẽ bị tiêu hao trên đường bay (Hohmann Transfer), phần vật tư dư thừa và trạng thái phi hành đoàn sẽ được giữ nguyên mang sang Sao Hỏa.
* **Độ trễ liên lạc (Comm Latency)**: 4 đến 24 phút mỗi chiều tùy vị trí quỹ đạo. Phi hành đoàn phải tự quyết định trong các tình huống khẩn cấp.
* **Thời gian tàu tiếp tế**: 15 - 30 Sol (tính theo quỹ đạo chuyển tiếp khẩn cấp).
* **Thách thức kỹ thuật đặc thù**:
  * **Bão bụi toàn cầu (Global Dust Storms)**: Che khuất ánh sáng mặt trời trong nhiều tuần liên tiếp.
  * **Hệ thống MOXIE**: Hút khí quyển CO2 mỏng để điện phân ra O2.
  * **Khử độc đất (Perchlorates)**: Cần xử lý hóa học đất Sao Hỏa trước khi đưa vào nhà kính sinh học.

---

## 3. Cơ cấu Nhân sự & Phân vai trong Team
* **Web Developer (Tech Lead)**:
  * Trách nhiệm: Kiến trúc toàn bộ Web App (Vite + React + TypeScript + TailwindCSS), viết Engine mô phỏng, quản lý State (Zustand), xây dựng UI/UX Sci-Fi và telemetry charts.
  * **Mục tiêu đặc biệt**: Xây dựng một sản phẩm hoàn chỉnh, code sạch, kiến trúc chuyên nghiệp để làm **điểm sáng vượt trội trong CV xin việc**.
* **Artist (Visual Lead)**:
  * Trách nhiệm: Vẽ toàn bộ 2D assets độc quyền (Avatar phi hành gia với các biểu cảm, khung cảnh bề mặt hành tinh ngoài cửa sổ, icon trang thiết bị, UI frame).
* **User (Art & Integration Support)**:
  * Trách nhiệm: Cầu nối đồ họa, tối ưu asset pipeline (nén WebP, bố cục spritesheet, căn chỉnh layout CSS cùng Web Dev).
* **AI Coding Partner (Antigravity)**:
  * Trách nhiệm: Cung cấp mô hình toán học NASA, thiết kế TypeScript Interfaces, giải pháp thuật toán, tối ưu hóa code và giải quyết lỗi kỹ thuật.

## 4. Khảo sát bằng robot và phân công phi hành đoàn

**Quyết định thiết kế đã thống nhất.** Robot khảo sát từ xa và tự vận hành giữa các Sol. Phi hành đoàn đảm nhiệm các công việc ở trong và quanh tiền đồn. Mỗi thành viên được giao tối đa **một việc mỗi Sol**, tính chung việc trạm, ca trực xuất phát và ca can thiệp robot. Việc lập lịch robot giữ chỗ cho người phụ trách ở Sol thực hiện. Chuyển sang Sol tiếp theo mới thực hiện chuyến đã chốt. Một chuyến dài 3 Sol xuất phát ở Sol 5 và hoàn thành ở Sol 8 nếu đủ điều kiện.

Khi lên kế hoạch, người chơi chọn mục tiêu, robot và dụng cụ. Robot và trang bị của nó được dành riêng trong suốt chuyến. Chỉ cần người trực ở Sol xuất phát hoặc khi sự cố cần can thiệp. Nếu thiếu người hoặc điện để xuất phát, chuyến chờ lịch mới. Nếu thiếu điều kiện trong chuyến hoặc gặp sự kiện môi trường hay thời tiết không gian, game áp dụng hạn xử lý và kết quả của sự kiện. Tùy tình huống, có thể mất mục tiêu, mất dữ liệu hoặc phải thu hồi robot. Mission Log hiển thị tín hiệu, số đo, hạn xử lý và kết quả. Science Brief liên hệ hệ quả với số liệu của lượt vừa chơi.

### Tiêu chí nghiệm thu · Mất tín hiệu ở Sol 7

Chạy cùng một trạng thái đầu vào với bốn người và ba chuyến, lần lượt dự kiến Sol 1–4, 5–8 và 9–12. Mỗi ca xuất phát dùng một lượt phân công. Ở Sol 7, ba người được giao xử lý rò khí, kiểm tra nguồn điện và cô lập mạch lỗi. Robot mất tín hiệu giữa chuyến thứ hai. Người còn lại chỉ có thể khôi phục liên lạc hoặc kiểm tra bộ lọc bụi.

- Đầu Sol 7 có 35 L nước sạch, 10 L nước thải có thể xử lý, 8 kWh nguồn điện và 8 kWh pin. Tải thiết yếu cần 12 kWh. WRS cần 4 kWh cho một chu kỳ, thu hồi 93% từ tối đa 10 L nước thải mỗi Sol. Bốn người tiêu thụ 10 L nước sạch mỗi Sol. Ca khôi phục liên lạc cần 2 kWh và phải xong trong Sol 7.
- **Cứu robot.** Người thứ tư khôi phục liên lạc, hoãn kiểm tra bộ lọc và WRS. Cuối Sol 7 còn 25,0 L nước sạch và 2 kWh pin. Nước thải chưa xử lý được giữ lại. Chuyến thứ hai hoàn thành Sol 8. Tổng cộng hoàn thành 3/3 chuyến.
- **Ưu tiên trạm.** Người thứ tư kiểm tra bộ lọc, WRS chạy đủ chu kỳ. Cuối Sol 7 còn 34,3 L nước sạch và 0 kWh pin. Chuyến thứ hai mất mục tiêu khi hết hạn. Ca này chỉ xét thất bại mục tiêu và giả định robot vẫn khả dụng để thực hiện chuyến thứ ba. Tổng cộng hoàn thành 2/3 chuyến.
- **Kiểm tra đến Sol 12.** Từ Sol 8, cấp 16 kWh mỗi Sol, đủ cho tải thiết yếu và WRS, không có điện dư để sạc pin. Dùng cùng giới hạn xử lý 10 L nước thải mỗi Sol. Chuyến thứ ba hoàn thành ở cả hai nhánh. Nhánh cứu robot còn 21,5 L nước sạch và 2 kWh pin. Nhánh ưu tiên trạm còn 30,8 L và 0 kWh. Điện cho các lượt xuất phát thông thường đã nằm trong điều kiện của ca thử. Chi phí can thiệp 2 kWh, hạn một Sol và công suất WRS là dữ liệu ca nghiệm thu.
- **Kiểm tra phân công.** Sau khi người thứ tư được giao việc, engine phải từ chối giao việc thứ hai cho họ trong Sol 7. Hai kết quả phải tái lập từ cùng dữ liệu đầu vào. Lượt không đủ người hoặc điện phải phản ánh lý do trong Mission Log.

Danh mục tham chiếu gameplay của bản 1.3.2 nằm trong [Cơ chế gameplay tham chiếu](GAMEPLAY_REFERENCE_1_3_2.md).

## 5. Bài huấn luyện Mặt Trăng

**Đã chốt.** Bài huấn luyện dài **12 Sol**, đội **4 phi hành gia**, mỗi người tối đa **một việc mỗi Sol**. Để thắng, tiền đồn phải duy trì sự sống đến hết Sol 12 và thu được dữ liệu từ **ít nhất 2 trong 3 chuyến khảo sát**.

- **Sol 1–4.** Hướng dẫn cấp điện, tái chế nước và lên lịch robot. Chuyến đầu chạy Sol 1–4.
- **Sol 5–8.** Chuyến hai chạy Sol 5–8, gặp ca mất tín hiệu ở Sol 7. Cả cứu robot và ưu tiên trạm đều có đường thắng.
- **Sol 9–12.** Chuyến ba chạy Sol 9–12. Bài thử nối tiếp cho người chơi cấp điện và nước để hoàn tất mẻ cây đã trồng từ trước, đồng thời hoãn việc ngoài trạm trong cảnh báo bức xạ ở Sol 10–11. Science Brief giải thích hệ quả từ số liệu thực tế của lượt.

### Ca kiểm chứng toàn nhiệm vụ

Dùng cùng đầu vào Sol 7 ở mục 4. Đến Sol 8, cấp 16 kWh. Từ Sol 9–12, cấp 20 kWh mỗi Sol cho tải thiết yếu 12 kWh, WRS 4 kWh và nhà kính 3 kWh. Thêm 1 kWh tải hỗ trợ trú ẩn ở Sol 10–11. Nhà kính dùng 1 L nước mỗi Sol và thu 2 kg thực phẩm ở Sol 12. Đây là thông số ca thử. Cảnh báo bức xạ hiện mô phỏng quyết định trú ẩn và hoãn công việc, chưa tính liều mSv.

| Nhánh Sol 7 | Chuyến hoàn thành | Nước sạch cuối Sol 12 | Pin cuối Sol 12 | Thực phẩm cuối Sol 12 |
|---|---:|---:|---:|---:|
| Cứu robot | 3/3 | 17,5 L | 4 kWh | 8,24 kg |
| Ưu tiên trạm | 2/3 | 26,8 L | 2 kWh | 8,24 kg |

Đây là ca toàn nhiệm vụ có nhà kính và trú ẩn. Ca Sol 7 độc lập ở mục 4 vẫn dùng lịch cấp điện và kết quả riêng đến Sol 12.

## 6. Thời lượng chiến dịch nền đề xuất

Các mốc dưới đây là đề xuất cho chiến dịch sau bài huấn luyện, cần thử cân bằng với engine.

| Chiến dịch | Độ dài | Lịch hiện tượng |
|---|---:|---|
| Mặt Trăng | 32 Sol | Sol 1–14 tích điện và chuẩn bị. Sol 15–28 mô phỏng 14 lượt đêm liên tiếp ở địa điểm có chu kỳ sáng tối phù hợp. Sol 29–32 khôi phục điện mặt trời, kiểm tra thiệt hại và đánh giá điều kiện phóng. |
| Sao Hỏa | 36 Sol | Sol 1–7 ổn định và tạo đường cơ sở. Sol 8–29 theo dõi bão bụi tăng, đạt đỉnh rồi suy yếu. Sol 30–36 phục hồi. Yêu cầu tiếp tế ở Sol 8 cho mốc đến Sol 30 nếu dùng thời gian vận chuyển 22 Sol. |

Trên Mặt Trăng, một Sol trong chiến dịch đại diện khoảng một ngày Trái Đất. Kiểm tra vượt đêm bằng trạng thái đã hoàn tất giai đoạn đêm và quan sát điện mặt trời trở lại. Với cấu hình thử hiện tại, tải thiết yếu 12 kWh và nguồn nền 8 kWh tạo thiếu hụt 56 kWh trong 14 lượt, trước WRS và nhà kính. Cần cân bằng nguồn dự phòng, tải và tồn kho trước khi chốt thông số chiến dịch.

Trên Sao Hỏa, dùng bão bụi toàn cầu 2018 để tham chiếu diễn biến và tác động đến công suất điện mặt trời. Mốc Sol 8–29 là thời lượng quy đổi cho gameplay, ngắn hơn diễn biến quan sát. Sự kiện hạt năng lượng Mặt Trời có thể lấy từ NASA DONKI và đưa vào lịch theo chuỗi cảnh báo, trú ẩn, khôi phục. Mỗi kịch bản ghi nguồn, ngày quan sát, đại lượng sử dụng và cách chuyển thành luật game.

Nguồn: [Chu kỳ sáng tối Mặt Trăng](https://ntrs.nasa.gov/citations/20220017053) · [Bão bụi Sao Hỏa 2018](https://www.nasa.gov/missions/martian-dust-could-help-explain-water-loss-plus-other-learnings-from-global-storm/) · [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/).

---

## 7. Hiện trạng Triển khai Kỹ thuật (Technical Implementation Status)

Cập nhật mã nguồn và trạng thái vận hành trên ổ đĩa `E:\Project Hail`:

* **Động cơ mô phỏng sinh tồn (`src/engine/`)**:
  * `DaySimulationEngine.ts`: Động cơ Pure TypeScript cho chế độ Project Hail (ECLSS O2 tiêu thụ 0.84 kg/ngày/người, rò rỉ khóa khí airlock, WRS tái chế 85–93% nước thải, lưới điện Fission + Solar, mô phỏng bão bụi Sao Hỏa và đêm Mặt Trăng 14 ngày, FSM sức khỏe 4 phi hành gia theo thang 0–100, độ trễ sóng vô tuyến mili-giây, tàu tiếp tế 80 kg).
  * `ParsecsDecompiledEngine.ts`: Mô hình tham chiếu đầy đủ 1.3.2 (hộp súp, trạm chế tạo 3 cấp độ, nâng cấp hệ thống tàu, điều độ y tế, thám hiểm viễn chinh có chặn nguy cơ).
* **Giao diện Buồng lái tương tác (`src/components/cabin/` & `ParsecsGameViewport.tsx`)**:
  * Mô hình trạm 2.5D Point-and-Click với tọa độ chuẩn: Cửa sổ vòm ngắm ngoại cảnh hành tinh (`ViewportPorthole`), máy in nhật ký (`StarlogPrinterStation`), kệ thiết bị trái (`LeftEquipmentShelf`), bàn chế tạo (`CraftingStation3D`), kệ lương thực phải (`RightConsumableShelf`), cửa thám hiểm (`ExpeditionSuitHatch`), cần gạt kết thúc Sol (`EndDayLeverControl`), ghế thuyền viên (`CrewCabinSeats`).
  * Thanh viễn thám LED thời gian thực (`TelemetryTopBar`) và bộ modal tác vụ (`StarlogModal`, `CharacterSheetModal`, `CraftingModal`, `ExpeditionModal`, `CommsLogisticsModal`, `EndOfDayModal`, `NightCutsceneModal`).
* **Quản trị trạng thái (`src/store/gameStore.ts`)**:
  * Zustand Store quản lý song song hai tiến trình `gameState` (NASA Outpost) và `parsecsState` (Reference 1.3.2), hỗ trợ lưu trữ liên tục (persistent storage), chuyển Sol, cắt cảnh đêm và hiển thị bài giảng STEM (`currentBrief`).
* **Bộ dữ liệu Khoa học (`src/data/`)**:
  * `nasa-briefs.json`: Nội dung giáo dục STEM chính thức của NASA.
  * `events.json`: Cây sự cố và quyết định kỹ thuật kèm trọng số xác suất.
  * `balance.json`, `initial-state.json`, `parsecs-catalog.json`.

---

## 8. Nhật ký Pha làm việc & Quy tắc Cập nhật Context (Phase Log & Tracking Protocol)

### Quy tắc cập nhật bắt buộc:
Sau mỗi pha làm việc (tính năng, cân bằng, sửa lỗi hoặc kiểm thử), Antigravity sẽ cập nhật trực tiếp vào file này (`E:\Project Hail\PROJECT_CONTEXT.md`):
1. **Mục tiêu & Tác vụ đã hoàn tất**.
2. **File & Mã nguồn đã chỉnh sửa/thêm mới**.
3. **Quyết định thiết kế & Ràng buộc mới (nếu có)**.
4. **Kế hoạch cho pha kế tiếp**.

### Bảng theo dõi tiến độ các pha:

| Pha (Phase) | Thời gian | Nội dung triển khai | Trạng thái |
|---|---|---|---|
| **Phase 1: Architecture & Core Engine** | 2026-11-10 | Thiết kế kiến trúc Decoupled, viết `DaySimulationEngine.ts`, `ParsecsDecompiledEngine.ts` | **Hoàn thành** |
| **Phase 2: Cockpit HUD & 2.5D Cabin** | 2026-11-11 | Ghép buồng lái 2.5D, tích hợp spritesheet, tọa độ hotspot, gạt cần Sol, modal | **Hoàn thành** |
| **Phase 3: Dual Progression & STEM Briefs** | 2026-11-12 (02:00) | Tích hợp song song 2 mode, hệ thống bài giảng STEM NASA, hoàn tất báo cáo gameplay tổng thể | **Hoàn thành** |
| **Phase 4: Persistence, Context Rule & Scenario Verification** | 2026-11-12 (09:00) | Lưu trữ context trực tiếp vào ổ E, thiết lập quy chuẩn duy trì context sau mỗi pha | **Hoàn thành** |
| **Phase 5: GDD v2.0 Core Alignment** | 2026-11-12 (10:10) | Hợp nhất tài liệu thiết kế GDD v2.0, chốt cốt truyện 2050, cơ chế sinh tồn & kịch bản 12 Sol | **Hoàn thành** |
| **Phase 6: AeroMatte Asset Standard & Prototype** | 2026-11-12 (11:12) | Thiết lập `ASSET_PROMPT_STANDARD.md`, dựng prototype SVG máy in 3D không bóng đổ | **Hoàn thành** |
| **Phase 7: Cel-Shading & Blender Automation Pipeline** | 2026-11-12 (13:00) | Cập nhật chuẩn Stylized Cel-Shading 2-Tone, viết `scripts/blender_render_pipeline.py` tự động hóa render WebP | **Hoàn thành** |
| **Phase 8: High-Fidelity 3D Fabricator Cel-Shading Render** | 2026-11-12 (13:15) | Dựng hoàn chỉnh model Soft Aerospace (độ dày vỏ 2 tầng, khay vàng, decal, amber lamp, HUD) và xuất WebP | **Hoàn thành** |
| **Phase 9: Proven Image-to-3D & NPR Toolchain Standardization** | 2026-11-12 (13:32) | Ghi nhận quy trình Tripo3D/Meshy + LBS Toon Shader + Line Art (>85% success) vào `ASSET_PROMPT_STANDARD.md` | **Hoàn thành** |
