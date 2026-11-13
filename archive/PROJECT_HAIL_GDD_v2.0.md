# PROJECT HAIL — Game Design Document v2.0

> **Tên:** Project Hail — Junior Astronaut Mission Trainer  
> **Thể loại:** 2D point-and-click / turn-based survival strategy / STEM educational game  
> **Nền tảng:** Web, ưu tiên desktop; hỗ trợ mobile ở mức phù hợp  
> **Đối tượng:** Học sinh 7–12 tuổi  
> **Phạm vi bản chơi đầu:** Tiền đồn Mặt Trăng, **12 Mission Days**, 4 phi hành gia và robot khảo sát  
> **Trạng thái:** GDD tổng hợp đã cập nhật từ các quyết định thảo luận; **chưa phải đặc tả kỹ thuật cuối cùng**  
> **Quy ước:** **[ĐÃ THỐNG NHẤT]** là định hướng team đã thảo luận; **[ĐỀ XUẤT]** là thiết kế cần duyệt; **[CẦN CHỐT]** cần kiểm chứng/cân bằng.

## 1. Tầm nhìn sản phẩm

Người chơi làm chỉ huy tiền đồn không gian. Trong mỗi lượt, họ quan sát môi trường, phân công phi hành gia, phân bổ điện/oxy/nước, điều robot khảo sát và xử lý tình huống. Quyết định có chi phí và có thể tạo hệ quả nhiều lượt sau. Trò chơi **dạy sự đánh đổi kỹ thuật** thay vì chỉ đưa câu hỏi trắc nghiệm.

**Tham chiếu:** Cơ chế vòng lặp, buồng tàu point-and-click, phân công và hệ thống sự kiện của *60 Parsecs! 1.3.2*. Hail dùng mã, hình, nhân vật, nội dung và kịch bản riêng; không sao chép asset/mã của trò tham chiếu.

**[ĐÃ THỐNG NHẤT]** Không có một chuỗi sự cố cố định giống nhau qua mọi lượt chơi. **NASA Data** tạo bối cảnh môi trường; **Conditional Random** tạo sự cố hợp lệ; **Story/Mission Events** điều khiển mục tiêu. Người chơi quyết định hậu quả thông qua trạng thái trạm và cách xử lý.

### 1.1. Điều kiện thắng/thua của bài huấn luyện

- **Thắng dự kiến:** Toàn bộ 4 phi hành gia còn sống khi kết thúc ngày 12, và thu được dữ liệu từ ít nhất **2 trong 3 chuyến khảo sát**.
- **Thua:** Không còn khả năng duy trì sự sống theo quy tắc game, mất phi hành gia nếu áp dụng yêu cầu tất cả sống, hoặc đến cuối ngày 12 vẫn không đạt mục tiêu khảo sát.
- **[CẦN CHỐT]** Ngưỡng HP, cơ chế tử vong/cứu chữa và cách xử lý nếu nhiệm vụ đang dở vào ngày 12. Các nhánh phải có ít nhất một đường thắng hợp lý, không bắt buộc mọi nhánh đều thắng.

## 2. Nguyên tắc thiết kế

1. **Dễ hiểu, khó tối ưu:** Tập trung vào một vài tài nguyên và quyết định có hệ quả.
2. **Mọi lựa chọn có đánh đổi:** Thời gian, điện, nhân lực, vật tư, độ an toàn hoặc cơ hội khoa học.
3. **Không trừng phạt vô cớ:** Có cảnh báo sớm, hiển thị chi phí dự kiến và giải thích hậu quả.
4. **Khoa học truy vết được:** Nêu nguồn NASA, ngày dữ liệu, giả định và những quy tắc tự thiết kế.
5. **Chơi lại được:** Cùng một bộ luật, lịch sử thời tiết và/hoặc random seed khác nhau làm trải nghiệm khác nhau.
6. **MVP trước:** Không cố xây dựng toàn bộ hệ thống hay số lượng sự kiện của game tham chiếu.

## 3. Thời gian trong game: Mission Day và ngày NASA

### 3.1. Quy ước thời gian

- **[ĐỀ XUẤT]** Đổi tên **Sol → Mission Day** trong chiến dịch Mặt Trăng. **1 Mission Day = 24 giờ Trái Đất** là đơn vị mô phỏng, *không phải* một chu kỳ ngày–đêm Mặt Trăng. “Sol” dành cho chiến dịch Sao Hỏa trong tương lai; một sol Sao Hỏa không đúng bằng 24 giờ Trái Đất.
- Một chiến dịch huấn luyện dài **12 Mission Days**; người chơi chuyển ngày ngay khi chọn **End Day** chứ không phải chờ ngoài đời thật.
- **Mission Day 1 ↔ ngày lịch sử bắt đầu**, Mission Day 2 ↔ ngày kế tiếp, ... đến Mission Day 12. Cần quy định **UTC** và cách gom các sự kiện giao cắt ranh giới ngày.
- Điều kiện chiếu sáng của căn cứ Mặt Trăng **không** được tính bằng cách coi cứ 24 giờ là một lần sáng/tối; phải sử dụng kịch bản theo vị trí căn cứ hoặc dữ liệu phù hợp, nếu mô phỏng.

### 3.2. Chế độ chọn thời gian

| Chế độ | Hoạt động | Phạm vi |
|---|---|---|
| **Random Historical Mission** | Chọn ngẫu nhiên một cửa sổ **12 ngày lịch sử đã được tuyển chọn, kiểm tra và lưu trước**; có thể phân nhóm theo độ khó | **MVP ưu tiên** |
| **Choose Historical Date** | Người chơi tự chọn ngày bắt đầu; tải hoặc lấy cache dữ liệu liên tục 12 ngày; báo thiếu dữ liệu nếu cần | Sau MVP hoặc nếu đủ thời gian |
| **Daily NASA Challenge** | Mỗi ngày mở một kịch bản mới dựa trên **dữ liệu đã công bố** gần đây, có độ trễ; không dự báo 12 ngày tương lai như sự thật | Sau MVP |

**Tại sao không dùng trực tiếp 12 ngày bắt đầu từ hôm nay?** Dữ liệu quan sát của các ngày tương lai chưa có. Game phải hoặc chờ ngoài đời, hoặc sử dụng dự báo/mô phỏng và gắn nhãn rõ; cả hai đều không phù hợp làm chế độ mặc định của MVP.

**[ĐỀ XUẤT]** Chuẩn bị 5–10 cửa sổ lịch sử đã kiểm tra chất lượng dữ liệu, bao gồm giai đoạn yên tĩnh và hoạt động mạnh. Không khẳng định một cửa sổ có bão hay tác động nguy hiểm cho Mặt Trăng chỉ dựa vào ngày chưa được phân tích.

## 4. Core Gameplay Loop

1. **Đầu ngày:** Tải trạng thái trạm, môi trường NASA tương ứng ngày đã chọn, sự kiện còn tồn từ ngày trước; xem Mission Log và cảnh báo.
2. **Quan sát:** Xem Power/Oxygen/Water, Health, thiết bị, tiến độ robot và mục tiêu.
3. **Lập kế hoạch:** Phân công 4 người; bật/tắt/ưu tiên hệ thống; đưa lệnh robot; chọn phản ứng với sự kiện.
4. **Kiểm tra:** Xem người đã bận, nguồn lực dự kiến, công việc không hợp lệ và lý do.
5. **End Day:** Xác nhận; engine thực hiện một thứ tự xử lý cố định; cập nhật tài nguyên, sức khỏe, sự kiện, nhiệm vụ.
6. **Báo cáo:** Mission Log + **Science Brief** phân biệt điều kiện môi trường thực, hệ quả trong mô phỏng, bài học và nguồn.
7. **Ngày kế tiếp:** Mang theo hậu quả, công việc chưa hoàn tất và sự kiện đã hẹn.

## 5. Màn hình và UI

| Màn hình | Thành phần chính |
|---|---|
| **Start / Continue** | New Mission, Continue, chọn chế độ thời gian, tutorial |
| **Mission Selection** | Random Historical / lịch sử thủ công (nếu có); mô tả nguồn dữ liệu và độ khó |
| **Cockpit** | Buồng trạm 2D 16:9, click thiết bị/nhân vật, chỉ số, cảnh báo, End Day |
| **Mission Log** | Nhiệm vụ, sự kiện, hậu quả, cảnh báo và lịch sử quyết định |
| **Crew Panel** | 4 phi hành gia, Health, trạng thái và công việc mỗi ngày |
| **Device Panels** | Công suất, độ bền, trạng thái, bật/tắt, sửa chữa và chi phí |
| **Exploration Map** | 3 điểm khảo sát, trang bị, thời gian, rủi ro, trạng thái chuyến |
| **Science Brief** | Điều đã xảy ra, nguyên nhân, điều kiện NASA, nguồn, giải thích ngắn |
| **Mission Summary** | Kết quả thắng/thua, khảo sát, nhân vật, quyết định, kiến thức học được |
| **Settings / Pause** | Âm lượng, tiếp tục, trợ giúp, tùy chọn tiếp cận |

**[ĐỀ XUẤT]** Mỗi panel hiển thị *chi phí dự kiến* và *lý do khóa*; tránh thuật ngữ chuyên môn không giải thích cho trẻ 7–12 tuổi.

## 6. Tài nguyên

### 6.1. Ba tài nguyên chính

| Tài nguyên | Vai trò | Quan hệ |
|---|---|---|
| **Power** | Cấp điện cho trạm, robot, hệ thống sống | Nguồn mặt trời/dự phòng; cấp cho oxy, nước, thông tin |
| **Oxygen** | Duy trì hô hấp | Tiêu thụ theo ngày; được bổ sung nhờ thiết bị có đủ điện/điều kiện |
| **Water** | Nước sạch để sinh tồn | Tiêu thụ theo ngày, phục hồi một phần qua tái chế |

- Trên UI có thể hiển thị %, nhưng engine cần **đơn vị vật lý rõ ràng** (ví dụ kWh, kg, L), dung lượng tối đa và luật làm tròn.
- **Food** và **Materials** là tài nguyên phụ: Food có thể tự động trừ; Materials dùng cho sửa chữa; tránh crafting nhiều tầng trong MVP.
- **[CẦN CHỐT]** Công thức tiêu thụ/sản xuất, giới hạn kho, ưu tiên cấp điện, chi phí khi tắt thiết bị, phản ứng thiếu oxy/nước, đơn vị và giả định. Không sử dụng số ví dụ trước đây làm thông số chính thức.

## 7. Phi hành đoàn

**[ĐÃ THỐNG NHẤT]** Có **4 phi hành gia**, đều đủ năng lực làm các công việc cơ bản. Không sử dụng Strength, Agility, Intelligence, Morale hay Sanity riêng trong MVP.

- Chỉ số chính: **Health** (đề xuất 0–100).
- Trạng thái: `Available`, `Busy`, `Injured`, `Incapacitated`.
- **Một người tối đa một nhiệm vụ mỗi Mission Day**; một công việc có thể cần 1 hoặc 2 người.
- Chấn thương/trị liệu ảnh hưởng khả năng làm việc; người bận không được phân công trùng.
- **[CẦN CHỐT]** HP khi thiếu oxy/nước, rủi ro bức xạ, hồi phục, cấp cứu, ngưỡng không thể làm việc/tử vong; quy định status và assignment có thể đồng thời tồn tại hay tách thành hai trường.

## 8. Thiết bị

| Thiết bị | Chức năng |
|---|---|
| Solar Panel / Power System | Nguồn điện và dự trữ; môi trường có thể ảnh hưởng sản lượng |
| Oxygen Generator | Đổi điện/đầu vào thành oxy theo luật mô phỏng |
| Water Recycler | Tái chế nước với chi phí điện |
| Communication System | Liên lạc Trái Đất, hỗ trợ điều khiển robot |
| Medical Station | Điều trị và giảm rủi ro Health |
| Robot Control Station | Lên kế hoạch và theo dõi khảo sát |

Trạng thái tối giản: `Normal`, `Degraded`, `Broken`; có điều kiện bật, sửa, vật liệu và số ngày sửa. Nâng cấp nhiều cấp để sau MVP.

## 9. Robot Exploration

- Điều khiển robot **từ xa**, không đưa phi hành gia rời tiền đồn trong MVP.
- Người chơi chọn điểm đến và dụng cụ; phân công người hỗ trợ **khi xuất phát hoặc can thiệp**; thiếu người/điện có thể hoãn xuất phát.
- Mỗi chuyến có trạng thái: `Planned → Active → Completed/Failed/Aborted`; thời lượng, chi phí và sự kiện giữa chuyến.
- **Ba chuyến khảo sát**, cần thu được dữ liệu từ **ít nhất hai** để thắng.
- Điểm đến minh họa: **Lunar Crater, Regolith Field, Shadow Region**; đây là ý tưởng, **chưa phải địa danh/dataset đã chốt**.
- **[CẦN CHỐT]** Thời lượng, pin/điện, trang bị, phân biệt mất kết nối tạm thời với mất dữ liệu vĩnh viễn, có được thử lại không và giới hạn ngày 12.

## 10. Event System — ba nguồn sự kiện

### 10.1. NASA Environmental Events (dữ liệu thật, hiệu ứng mô phỏng)

- Dùng dữ liệu NASA **DONKI** cho các ghi nhận thời tiết không gian phù hợp, như Solar Flare (FLR), Coronal Mass Ejection (CME) hoặc Solar Energetic Particle (SEP).
- Các bản ghi NASA là **quan sát/sự kiện được ghi nhận**, không phải thang đo trực tiếp của liều bức xạ tại căn cứ Mặt Trăng. Không tự động chuyển “có solar flare” thành “phi hành gia −20 HP”.
- Quy tắc ánh xạ phải định nghĩa nguồn, thời gian bắt đầu/kết thúc, biến môi trường, mức tin cậy/giới hạn, cảnh báo và hệ quả trong game. Nếu chỉ dùng chỉ báo đơn giản, ghi rõ **mô hình giáo dục đơn giản hóa**.
- Không đồng nhất **bão địa từ ở Trái Đất** với nguy cơ tại Mặt Trăng.

### 10.2. Conditional Random Events (sự cố ngẫu nhiên có điều kiện)

Ví dụ: robot kẹt bánh khi **đang khảo sát**, máy tái chế nước hỏng nếu **đang hoạt động hoặc xuống cấp**, bụi regolith làm giảm hiệu suất một thiết bị. **Không** có bão cát do gió trên Mặt Trăng; **bão bụi** là sự kiện phù hợp với chiến dịch **Sao Hỏa** trong tương lai.

- Chỉ random trong **pool sự kiện hợp lệ** theo vị trí, ngày, thiết bị, nhân sự, tiến độ, trạng thái, cooldown.
- Có **trọng số** và giới hạn số cảnh báo khẩn cấp đồng thời. Có thể xuất hiện **ngày yên bình**.
- Trọng số ví dụ là thông số **cân bằng gameplay**, không phải xác suất NASA công bố.
- Hệ quả có thể kéo dài nhiều ngày (ví dụ thiết bị xuống cấp cho đến khi sửa), không chỉ trừ tài nguyên tức thời.

### 10.3. Story & Mission Events

- Giới thiệu hệ thống, nhận nhiệm vụ khảo sát, mở khóa mục tiêu, thông báo kết quả và kết thúc chiến dịch.
- Các mốc giáo dục/tutorial có thể cố định; **sự cố không bị cố định cứng vào một Mission Day**.

### 10.4. Scheduler và Event Graph

**Event Scheduler** trả lời *sự kiện nào và khi nào*; **Event Graph** mô tả *điều kiện → lựa chọn → kết quả → sự kiện theo sau*. Một sự kiện nên có:

1. `id`, `category`, tiêu đề, nội dung ngắn phù hợp 7–12 tuổi.
2. `conditions`, `weight`/`priority`, `cooldown`, `duration`, cờ đã xảy ra.
3. Các lựa chọn, điều kiện mở/khóa, chi phí dự kiến.
4. Kết quả đối với tài nguyên, Health, thiết bị, robot, mục tiêu, lịch sự kiện.
5. Mission Log và Science Brief; dữ liệu NASA nếu áp dụng.
6. Quy tắc xử lý khi có nhiều sự kiện trùng lịch hoặc khi không có lựa chọn khả thi.

**[ĐỀ XUẤT]** Khoảng **15–20 sự kiện được viết kỹ** cho MVP, thay vì sao chép hàng trăm event của game tham chiếu. Số lượng sẽ điều chỉnh sau playtest.

## 11. Sol 7 cũ — chuyển thành kịch bản kiểm thử có điều kiện

Tình huống ban đầu: Robot mất tín hiệu khi thiếu điện, ba người bận việc khẩn. Một lựa chọn ưu tiên cứu liên lạc, lựa chọn kia ưu tiên tái chế nước; chênh lệch **9,3 L** là **con số minh họa từ đề xuất ban đầu, cần kiểm chứng công thức**, không phải số đo NASA.

**Thay đổi ở v2.0:** Sự kiện này **không bắt buộc xảy ra vào ngày 7**. Chỉ kích hoạt khi đạt điều kiện (robot đang khảo sát, liên lạc/điện không đủ và xuất hiện nguyên nhân hợp lệ). Có thể xảy ra ở ngày khác hoặc không xảy ra. Giữ một **test scenario** với trạng thái trạm cố định để kiểm thử hai nhánh và các đường thắng, nhưng không biến thành kịch bản mặc định của mọi lượt chơi.

## 12. Tiến trình huấn luyện 12 Mission Days — không cố định sự cố

| Giai đoạn | Ngày | Tiến trình bảo đảm / mục tiêu thiết kế |
|---|---|---|
| Onboarding | 1–2 | Hướng dẫn đọc tài nguyên, phân công, End Day; tránh quá tải |
| Khảo sát đầu | 3–5 | Mở chuyến robot, giới thiệu chi phí nghiên cứu; event tùy dữ liệu/trạng thái |
| Sinh tồn và thích ứng | 6–9 | Căng thẳng về nhân lực và nguồn lực, hệ quả tích lũy; có thể yên bình hoặc gặp sự cố |
| Hoàn thành mục tiêu | 10–11 | Cơ hội kết thúc các chuyến còn lại, cân bằng sống còn và khoa học |
| Tổng kết | 12 | Resolver xử lý ngày cuối, xác định thắng/thua, báo cáo bài học |

**Không hard-code** “ngày 5 hỏng điện, ngày 6 có bức xạ, ngày 7 mất robot”. Dữ liệu môi trường + event conditions + hành động của người chơi quyết định diễn biến. **[CẦN CHỐT]** Cách bảo đảm người chơi có cơ hội hoàn thành ≥2 chuyến đúng hạn mà không gian lận sự kiện.

## 13. Luồng dữ liệu NASA và quy tắc khoa học

### 13.1. Dữ liệu đầu vào

- **Ưu tiên MVP:** Dữ liệu NASA DONKI được truy xuất, kiểm tra và đóng gói trước ở dạng JSON theo **cửa sổ 12 ngày UTC**. Khi có nhu cầu, mới bổ sung live API/caching server.
- Tham khảo tài liệu chính thức tại: https://api.nasa.gov/ (DONKI). Các nguồn bổ trợ Artemis/lunar research cần được xác định theo từng cơ chế; chưa chốt.
- Lưu **tên dataset/API, loại sự kiện, timestamp UTC, URL bản ghi, ngày tải, phiên bản bộ dữ liệu**.
- Không có bản ghi trong một ngày **không đồng nghĩa** chắc chắn không có rủi ro; cần phân biệt `no_reported_event`, `missing_data` và `verified_quiet` nếu có đủ cơ sở.

### 13.2. Pipeline đề xuất

```text
NASA archive / DONKI API
    ↓ (fetch, validate, retain metadata)
Curated Historical Windows (12 ngày UTC)
    ↓ (normalize, map source → environment; label assumptions)
Mission Environment Timeline
    + Conditional Random Event Pool (seeded)
    + Story / Mission Events
    ↓
Event Scheduler + Game State + Player Decisions
    ↓
End-Day Resolver → Mission Log + Science Brief
```

### 13.3. Dữ liệu ≠ diễn biến gameplay

- **Observed:** Ví dụ NASA ghi nhận một sự kiện theo timestamp.
- **Inferred / simplified:** Game suy ra cấp cảnh báo môi trường từ tập điều kiện/giả định đã công bố.
- **Simulated:** Điện tiêu hao, robot gặp trở ngại, Health biến động theo luật game đã cân bằng.

Không gọi một giá trị mô phỏng là “số đo NASA”. **[CẦN CHỐT]** Bảng ánh xạ dataset → biến môi trường, ngưỡng, đơn vị, hiệu ứng, giới hạn độ chính xác và cách diễn giải cho trẻ em.

### 13.4. Khả năng chơi lại và offline

Lưu ít nhất: `missionStartUTC`, `datasetVersion`, `scenarioId`, `randomSeed`, `eventHistory`, `gameState`, `engineVersion`. Khi load/replay không random lại lịch sử đã xảy ra. Nếu API lỗi, dùng dataset cục bộ đã công bố, ghi nhãn rõ; không giả lập số liệu mới rồi nói đó là live NASA.

## 14. Luật random, cân bằng và công bằng

**[ĐỀ XUẤT]** Các bước một ngày:

1. Xác định môi trường theo mốc NASA đã chọn và hiệu ứng kéo dài còn tồn.
2. Sinh pool sự kiện hợp lệ từ điều kiện trạm, robot và cooldown.
3. Chọn số lượng/trọng số sự cố trong giới hạn độ khó; không ép phải có sự cố mỗi ngày.
4. Hiện cảnh báo và các lựa chọn hợp lệ trước khi End Day (nếu sự kiện có thể dự báo theo gameplay).
5. Xử lý các hành động theo thứ tự nhất quán và ghi lại nguồn gốc thay đổi.

**Quy tắc công bằng:** Không random HP giảm vô căn cứ; tránh nhiều sự cố chí mạng đồng thời; không tạo tình huống bắt buộc thua ngay từ ngày đầu; bảo đảm hành động đã hiển thị có chi phí nhất quán với resolver. Tùy mức độ khó có thể giảm gợi ý hoặc điều chỉnh mức dự trữ, không cần thay đổi tính xác thực của dữ liệu NASA.

## 15. Một ngày chơi minh họa (không phải nội dung cố định)

- Trạm có điện thấp, robot đang khảo sát, hệ thống nước cần điện.
- NASA timeline có thể có hoặc không có cảnh báo thời tiết không gian; đây là **lớp điều kiện môi trường riêng**.
- Conditional Event kiểm tra robot và liên lạc, có thể kích hoạt mất tín hiệu nếu đủ điều kiện.
- Người chơi có thể cử người hỗ trợ robot hoặc ưu tiên nước, rồi End Day.
- Báo cáo hiển thị hệ quả chính xác theo số liệu engine: *đã dùng bao nhiêu điện, còn bao nhiêu nước, robot có còn dữ liệu không*.
- Science Brief giải thích trade-off; trích dẫn nguồn NASA **nếu nội dung khoa học cụ thể dùng dữ liệu NASA**.

## 16. Độ khó, tính chơi lại và giá trị giáo dục

- **MVP:** Cân bằng **một mức độ khó chuẩn** trước. Các chế độ Cadet/Astronaut/Commander là ý tưởng mở rộng.
- **Replayability:** Nhiều cửa sổ dữ liệu lịch sử và random seed; tránh cùng một sự cố cố định theo số ngày.
- **Mission Replay / What If? [ĐỀ XUẤT]:** Cho người chơi đổi một quyết định quan trọng trong cùng state/seed để so sánh hệ quả.
- **Science Brief [ƯU TIÊN]:** Ngắn, dễ hiểu; nói rõ *đã xảy ra gì – vì sao – liên quan khoa học nào*.
- **Learning Report [ĐỀ XUẤT]:** 2–3 câu hỏi/nhận xét trước-sau chơi hoặc cuối nhiệm vụ; playtest với trẻ 7–12 tuổi nếu có thể.

## 17. Kiến trúc kỹ thuật

```text
React / Web UI (Cockpit, Panels, Log)
            |
Game Engine (TypeScript, pure game rules)
            |
   +--------+--------------------+
   |                             |
NASA Timeline + Data Mapper   Event Scheduler / Event Graph
   |                             |
   +---------- End-Day Resolver --+
                    |
        Resources + Crew + Devices + Robot
                    |
      Save/Load + Seed + Dataset Version
                    |
         Mission Log / Science Brief
```

- **UI không trực tiếp thay đổi tài nguyên**; gửi hành động tới engine.
- **Game State:** ngày, môi trường, kho, thiết bị, nhân sự, phân công, robot, mục tiêu, pending effects, event history.
- **Actions:** Có validation, reservation của chi phí và kiểm tra xung đột.
- **End-Day Resolver:** Thứ tự xử lý được chuẩn hóa, có unit tests; chưa chốt thứ tự chi tiết.
- **Event system:** Khai báo event bằng JSON hoặc TypeScript schema có điều kiện + hệ quả; không làm cây sự kiện bằng `if` rải khắp UI.
- **Save:** Giữ seed và dataset version để tái hiện diễn biến.

## 18. Phạm vi MVP và ưu tiên

### Bắt buộc để chơi được và chứng minh ý tưởng

- [ ] Cockpit 2D với asset tạm, các khu vực tương tác rõ.
- [ ] Game state / action validation / End-Day resolver / Save-Load.
- [ ] 3 tài nguyên chính Power/Oxygen/Water; 4 người, Health và phân công một việc/ngày.
- [ ] Các thiết bị trạm trọng yếu, trạng thái Normal/Degraded/Broken.
- [ ] Robot và 3 chuyến khảo sát, điều kiện thắng/thua.
- [ ] **12 Mission Days** với tiến trình nhiệm vụ, **không khóa cứng sự cố vào ngày cụ thể**.
- [ ] Event Scheduler: NASA Environment + Conditional Random + Story; event graph tối giản.
- [ ] Ít nhất **một luồng tích hợp NASA rõ nguồn, timestamp, mapping và giải thích Science Brief**.
- [ ] Random Historical Mission dùng bộ dữ liệu cục bộ đã kiểm tra + lưu seed.
- [ ] Mission Log, Science Brief, Mission Summary.
- [ ] Test các nhánh/điều kiện, đặc biệt tình huống robot mất liên lạc trước đây gắn với Sol 7.

### Nên có nếu đủ nguồn lực

- [ ] Tutorial tương tác và trợ năng phù hợp trẻ 7–12 tuổi.
- [ ] Chọn ngày lịch sử thủ công; Mission Replay; Learning Report.
- [ ] Hiệu ứng thiết bị, biểu cảm Health và bản mobile tối ưu.
- [ ] Cửa sổ lịch sử bổ sung, playtest với nhiều người chơi.

### Sau MVP

- [ ] Daily NASA Challenge hoặc dữ liệu mới được cập nhật tự động (có giải thích độ trễ).
- [ ] Crafting/nâng cấp nhiều cấp, achievement/medal, AI chatbot/multiplayer.
- [ ] Chiến dịch Mặt Trăng 32 ngày và Sao Hỏa 36 sol; bão bụi Sao Hỏa, độ trễ liên lạc, tiếp tế, MOXIE/nhà kính.
- [ ] Nhiều chế độ khó sau khi test cân bằng bản chuẩn.

## 19. Hướng hình ảnh & asset

- **Style:** 2D cartoon vẽ tay, viền đậm, màu retro, tỉ lệ hơi cường điệu, pha hài hước sinh tồn; tạo nhận diện riêng, không sao chép game tham chiếu.
- **Cockpit:** 16:9 với hotspot; phản hồi click rõ trên desktop/mobile.
- **Nhân vật:** 4 chân dung khác nhau, biểu cảm/states; trước mắt phác một nhân vật mẫu và cockpit blockout.
- **Asset dự kiến từ đề xuất ban đầu:** 1 nền cockpit, 4 chân dung, 1 ngoại cảnh Mặt Trăng, tối đa 10 icon.
- **Bàn giao gợi ý:** cockpit WebP 1920×1080; chân dung WebP alpha 512×512; ngoại cảnh WebP ~1280px ngang; icon SVG `viewBox="0 0 24 24"`; cung cấp file gốc có layer cho vật thể đổi trạng thái.

## 20. Danh sách phải chốt trước khi code đầy đủ

| Hạng mục | Quyết định cần làm | Ưu tiên |
|---|---|---|
| **Nguồn NASA** | Dataset cụ thể, trường dữ liệu, cửa sổ lịch sử, UTC và lưu metadata | P0 |
| **NASA → game** | Mapping khoa học, quy tắc cảnh báo, phân biệt observed/simulated | P0 |
| **Resource balance** | Đơn vị, mức khởi tạo, tiêu thụ, sản xuất, dự trữ, ưu tiên điện | P0 |
| **End-Day order** | Thứ tự tác động của môi trường, thiết bị, việc, robot, HP, endgame | P0 |
| **Event rules** | Conditions, weight, cooldown, duration, event cap, seed, thiếu dữ liệu | P0 |
| **Robot design** | Thời lượng mỗi chuyến, trang bị, thất bại/thử lại, ngày kết thúc | P0 |
| **Health** | Ngưỡng HP, điều trị, ai không thể làm việc, điều kiện mất người | P1 |
| **Mission balancing** | Kiểm thử nhiều seed và nhiều cửa sổ NASA, tránh softlock | P0 |
| **UX** | Thiết kế panels, tutorial, thông báo lỗi, trải nghiệm mobile | P1 |
| **Evaluation** | Bài học STEM, cách kiểm tra hiểu bài, thử nghiệm người dùng | P1 |

## 21. Tài liệu tham chiếu và thay đổi so với v1.0

**Tài liệu đầu vào:**
- *Project Hail — Đề xuất sản phẩm*: mục tiêu 12 lượt, 4 người, robot, điều kiện thắng, ví dụ Sol 7 và phạm vi asset.
- *GAMEPLAY_REFERENCE_1_3_2.md*: danh mục hệ thống của *60 Parsecs! 1.3.2*, là tham khảo **cơ chế**, không phải chỉ dẫn sao chép hoặc bằng chứng mọi sự kiện đều hoạt động như mô tả.
- *NASA Space Apps Challenge 2026 — Build a Junior Astronaut Mission Trainer*: đối tượng 7–12 tuổi và trọng tâm trade-off trong điều hành tiền đồn, khuyến khích NASA open data.
- Các quyết định/phương án mới trong thảo luận: tối giản chỉ số phi hành gia; không cố định Sol 7; lịch sử NASA 12 ngày; ba nguồn sự kiện; random có điều kiện; phân biệt Mặt Trăng/Sao Hỏa.

**Thay đổi chính v2.0:**
1. Chuyển tên lượt Mặt Trăng từ **Sol** sang **Mission Day** (quy ước đề xuất).
2. Thêm **Random Historical Mission** và cách ánh xạ 12 ngày NASA; chế độ chọn ngày/daily để sau.
3. Phân tách **NASA environmental**, **conditional random** và **story events**.
4. Loại bỏ lịch sự cố cứng theo Sol 1–12; giữ **12 ngày tiến trình** và sự kiện dựa trên điều kiện.
5. Chuyển sự kiện **Sol 7 robot mất tín hiệu** thành **test scenario có điều kiện**, không phải biến cố bắt buộc.
6. Loại trừ bão cát do gió khỏi **Mặt Trăng**; dành bão bụi cho **Sao Hỏa**.
7. Bổ sung yêu cầu provenance, missing-data handling, seed/replay, khoa học và cân bằng độ khó.

---

> **Bước triển khai kế tiếp:** Chốt **Resource Balance Sheet** (công thức/đơn vị từng ngày), **NASA-to-Game Mapping Table**, và **Event Catalog** 15–20 sự kiện có điều kiện; sau đó dựng một vòng End Day chạy được trước khi làm đủ 12 ngày.
