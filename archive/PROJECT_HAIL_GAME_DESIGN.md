# PROJECT HAIL — Game Design Document (Bản phác thảo MVP)

> **Tên sản phẩm:** Project Hail — Junior Astronaut Mission Trainer  
> **Thể loại:** 2D Point-and-Click / Turn-Based Survival Strategy / Educational Game  
> **Nền tảng:** Web (ưu tiên desktop, thiết kế thích ứng mobile)  
> **Đối tượng:** Học sinh 7–12 tuổi  
> **Trạng thái tài liệu:** Bản tổng hợp ý tưởng, **chưa phải đặc tả triển khai cuối cùng**

## 1. Tầm nhìn sản phẩm

Người chơi là chỉ huy một tiền đồn không gian, điều hành bốn phi hành gia và robot khảo sát. Trong mỗi lượt (*Sol*), người chơi phải phân bổ nguồn lực, giao việc, xử lý sự cố và theo dõi hệ quả. Mỗi quyết định có chi phí và ảnh hưởng đến các Sol tiếp theo.

**Giá trị cốt lõi:** Học về các đánh đổi kỹ thuật trong hoạt động không gian thông qua quyết định và hệ quả, thay vì chỉ trả lời câu hỏi kiến thức.

**Tham chiếu thiết kế:** Vòng lặp sinh tồn, buồng tàu tương tác và cách tổ chức sự kiện trong *60 Parsecs! 1.3.2*. Project Hail phải có nhân vật, hình ảnh, kịch bản và mã nguồn riêng; nhiệm vụ lấy cảm hứng từ các vấn đề kỹ thuật, khoa học của NASA.

### Mục tiêu bài huấn luyện đầu tiên

- Vận hành tiền đồn Mặt Trăng trong **12 Sol**.
- Quản lý **4 phi hành gia** và hoạt động của **robot khảo sát từ xa**.
- **Điều kiện thắng dự kiến từ bản đề xuất:** Toàn bộ phi hành đoàn duy trì sự sống đến hết Sol 12 và thu được dữ liệu từ ít nhất **2/3 chuyến khảo sát**.
- Thua khi không thể duy trì sự sống hoặc không đạt yêu cầu khảo sát vào cuối chiến dịch (các ngưỡng cụ thể cần đặc tả).

## 2. Nguyên tắc thiết kế

1. **Quyết định phải có đánh đổi:** Không có phương án tối ưu cho mọi tình huống.
2. **Dễ học, khó tối ưu:** Trẻ hiểu các lựa chọn nhưng phải cân nhắc ảnh hưởng về sau.
3. **Phản hồi rõ:** Hiển thị chi phí, lý do hành động không hợp lệ và kết quả sau Sol.
4. **Khoa học có nguồn:** Phân biệt dữ liệu NASA thực với các tham số mô phỏng được cân bằng cho game.
5. **Giới hạn phạm vi MVP:** Ưu tiên vòng lặp gameplay hoàn chỉnh trước khi thêm nhiều hệ thống.

## 3. Vòng lặp gameplay (Core Gameplay Loop)

1. **Đầu Sol:** Đọc Mission Log, kiểm tra tài nguyên, sức khỏe, trạng thái thiết bị, tiến độ khảo sát.
2. **Lập kế hoạch:** Phân công phi hành gia, điều chỉnh hệ thống, lên lịch robot, chọn cách xử lý sự kiện.
3. **Kiểm tra:** Hiển thị chi phí dự kiến, công việc bị xung đột, thiếu người/điện/vật tư.
4. **End Sol:** Khóa kế hoạch, xử lý sản xuất và tiêu thụ, công việc, sự kiện, robot, sức khỏe và điều kiện thắng/thua theo một thứ tự thống nhất.
5. **Báo cáo:** Mission Log và Science Brief giải thích điều đã xảy ra bằng số liệu của lượt vừa chơi.
6. **Sol tiếp theo:** Các hậu quả, lịch sự kiện và mục tiêu chưa hoàn thành được giữ lại.

## 4. Các màn hình

| Màn hình | Vai trò | Nội dung chính |
|---|---|---|
| **Start / Continue** | Bắt đầu hoặc tiếp tục | New Game, Continue, hướng dẫn ngắn |
| **Cockpit** | Giao diện chính | Buồng trạm 2D 16:9, phi hành gia, thiết bị có thể click, thanh tài nguyên, nút End Sol |
| **Mission Log** | Thông tin nhiệm vụ | Sự kiện hiện tại, cảnh báo, mục tiêu, lịch sử hệ quả |
| **Crew Panel** | Quản lý người | Health, trạng thái, công việc mỗi Sol |
| **Device Panels** | Vận hành thiết bị | Trạng thái, công suất/chi phí, sửa chữa, bật/tắt/ưu tiên |
| **Exploration Map** | Điều robot | 3 khu vực khảo sát, trang bị, điều kiện, thời lượng, mức rủi ro |
| **Science Brief** | Học STEM | Giải thích nguyên nhân–hệ quả, dữ liệu/số liệu liên quan, dẫn nguồn |
| **Mission Summary** | Kết thúc | Thắng/thua, mức tài nguyên, chuyến khảo sát, quyết định quan trọng, điều đã học |
| **Pause / Settings** | Tùy chọn | Âm lượng, lưu/tiếp tục và hỗ trợ trải nghiệm |

## 5. Hệ thống tài nguyên

### 5.1. Ba tài nguyên chính trên giao diện

| Tài nguyên | Ý nghĩa | Các quan hệ quan trọng |
|---|---|---|
| **Power (Điện)** | Vận hành hệ thống | Cấp cho oxy, tái chế nước, liên lạc, robot; nhận từ pin mặt trời/nguồn dự phòng |
| **Oxygen (Oxy)** | Duy trì sự sống | Bị tiêu thụ theo thời gian và phi hành đoàn; có thể được sản xuất nếu đủ điều kiện |
| **Water (Nước)** | Nước sạch dự trữ | Bị tiêu thụ; được bổ sung nhờ tái chế và các nguồn theo kịch bản |

**Nguyên tắc giao diện:** Có thể hiện thanh %, nhưng engine nên lưu giá trị bằng đơn vị được xác định rõ (ví dụ kWh, kg, L), giới hạn kho và mức tiêu thụ/sản xuất theo Sol. **Chưa chốt số liệu thực tế**.

### 5.2. Tài nguyên phụ

- **Food (thực phẩm):** Đơn giản hóa; có thể tiêu thụ tự động thay vì yêu cầu phân khẩu phần từng người trong MVP.
- **Materials (vật liệu):** Dùng cho sửa chữa/bảo trì, không xây dựng hệ thống crafting phức tạp trong bản đầu.
- Các tài nguyên phụ **chưa chốt** cách thể hiện và công thức.

## 6. Phi hành đoàn

### 6.1. Thiết kế đơn giản hóa đã thảo luận

- **4 phi hành gia**, giả định đều đủ năng lực cho các công việc cơ bản.
- **Không dùng** chỉ số Intelligence, Strength, Agility, Morale hoặc Sanity riêng trong MVP.
- Chỉ số trọng tâm: **Health** (thang 0–100 là đề xuất để dễ hiển thị).
- **Một người tối đa một công việc trong mỗi Sol.**
- Công việc có thể cần **1 hoặc 2 người**, tùy mức độ sự cố.

### 6.2. Trạng thái dự kiến

| Trạng thái | Ý nghĩa |
|---|---|
| Available | Có thể nhận việc |
| Busy | Đã được phân công trong Sol |
| Injured | Bị thương, có thể cần điều trị/hạn chế công việc |
| Incapacitated | Không thể thực hiện công việc |

**Chưa chốt:** Ngưỡng HP cho từng trạng thái, tổn thương, chữa trị và hệ quả khi HP về 0. Không nên dùng các con số minh họa trước đây làm công thức chính thức.

## 7. Thiết bị và tương tác trong trạm

| Thiết bị | Chức năng gameplay |
|---|---|
| Solar Panel / Power System | Sản xuất, tích trữ và phân phối điện; bị ảnh hưởng bởi môi trường |
| Oxygen Generator | Dùng điện để bổ sung oxy |
| Water Recycler | Dùng điện để bổ sung nước sạch |
| Communication System | Liên lạc với Trái Đất và hỗ trợ robot |
| Medical Station | Hỗ trợ điều trị phi hành gia |
| Robot Control Station | Chọn khu vực, trang bị và lập kế hoạch khảo sát |

Thiết bị có thể có ba trạng thái dễ hiểu: **Normal / Degraded / Broken**. Mỗi panel hiển thị thao tác hợp lệ, chi phí, điều kiện và lý do khóa. Cơ chế nâng cấp sâu để sau MVP.

## 8. Robot Exploration

- Robot **khảo sát từ xa**, không thay thế công việc trạm của phi hành gia.
- Người chơi chọn **địa điểm**, **trang bị/dụng cụ** và kế hoạch xuất phát.
- Cần người hỗ trợ lúc xuất phát hoặc khi cần can thiệp; thiếu điện/người có thể làm hoãn chuyến.
- Qua Sol, robot di chuyển/khảo sát, gặp sự kiện, thu dữ liệu, quay về hoặc mất mục tiêu.
- Có **3 chuyến khảo sát**, yêu cầu hoàn thành ít nhất **2**.

**Ba địa điểm minh họa (chưa chốt vị trí/dataset):** Lunar Crater, Regolith Field, Shadow Region. Mỗi nơi cần điều kiện, mục tiêu khoa học, rủi ro và kết quả riêng.

## 9. Sự kiện và lựa chọn

### 9.1. Nhóm sự kiện

- **Environment:** Bức xạ/thời tiết không gian, bụi regolith, điều kiện chiếu sáng.
- **Technical:** Hỏng máy, giảm hiệu suất, mất điện, robot mất tín hiệu.
- **Human:** Phi hành gia bị thương hoặc không thể làm việc.
- **Mission:** Mục tiêu nghiên cứu, thông báo từ Trái Đất, mở chuyến khảo sát.

### 9.2. Cơ chế sự kiện

**Event Scheduler** xác định *khi nào* sự kiện xảy ra (theo Sol, trạng thái, hoặc xác suất có trọng số). **Event Graph** xác định *điều kiện → lựa chọn → hệ quả*.

Mỗi sự kiện cần có:

1. ID, tiêu đề, nội dung dễ hiểu cho trẻ.
2. Điều kiện kích hoạt.
3. Các lựa chọn và điều kiện/chi phí mỗi lựa chọn.
4. Hệ quả lên tài nguyên, nhân vật, thiết bị, robot và mục tiêu.
5. Phản hồi Mission Log + nội dung Science Brief.
6. Nguồn NASA, nếu có dữ kiện khoa học cụ thể.

### 9.3. Sự kiện trung tâm — Sol 7 (theo đề xuất ban đầu)

**Bối cảnh:** Robot mất tín hiệu khi trạm thiếu điện và ba phi hành gia đang bận xử lý việc khẩn.

| Lựa chọn | Đánh đổi |
|---|---|
| Cử người thứ tư hỗ trợ liên lạc | Giữ cơ hội hoàn thành chuyến khảo sát, nhưng phải hoãn tái chế nước |
| Ưu tiên tái chế nước | Giữ thêm **9,3 L nước sạch trong Sol đó**, nhưng mất mục tiêu khảo sát thứ hai |

Cả hai đường **được dự kiến** có thể thắng nếu chuyến khảo sát cuối hoàn thành. Cần kiểm thử logic và làm rõ con số 9,3 L là **kết quả mô phỏng**, không tự nhận là số đo NASA.

## 10. Phác thảo kịch bản 12 Sol

> Bảng dưới là **đề xuất xây dựng thêm**, không phải chuỗi sự kiện đã chốt trong tài liệu ban đầu. Nên cho sự kiện thay đổi tùy quyết định trước đó.

| Sol | Nội dung trọng tâm | Mục tiêu thiết kế |
|---|---|---|
| 1 | Làm quen tiền đồn | Học đọc tài nguyên, giao việc, End Sol |
| 2 | Vận hành hệ thống oxy | Hiểu điện ↔ oxy |
| 3 | Chuẩn bị khảo sát đầu tiên | Chọn robot, dụng cụ, nhân lực |
| 4 | Nhận kết quả khảo sát | Thấy lợi ích và chi phí của nghiên cứu |
| 5 | Hiệu suất nguồn điện giảm | Sửa chữa hoặc tiết kiệm điện |
| 6 | Cảnh báo bức xạ | Đánh đổi an toàn và mục tiêu |
| 7 | Robot mất liên lạc | Quyết định cứu robot hay tái chế nước |
| 8 | Hệ quả từ Sol 7 | Phục hồi nguồn lực và thích ứng |
| 9 | Thiết bị cần bảo trì | Phân bổ nhân lực thiếu hụt |
| 10 | Chuẩn bị chuyến cuối | Dự phòng điện, nước và dụng cụ |
| 11 | Chuyến khảo sát cuối | Đánh đổi mục tiêu khoa học và sống còn |
| 12 | Tổng kết nhiệm vụ | Kiểm tra điều kiện thắng/thua và kiến thức học được |

**Lưu ý thiết kế độ khó:** Không biến mỗi Sol thành bài trắc nghiệm có đáp án đúng hiển nhiên. Cần cho lựa chọn hôm nay tạo hệ quả có thể quan sát ở các Sol sau.

## 11. Độ khó và khả năng chơi lại

- **MVP:** Cân bằng **một mức độ khó chính** trước.
- **Mở rộng dự kiến:** Cadet (có gợi ý), Astronaut (mức chuẩn), Commander (ít gợi ý, ít nguồn lực).
- Không nên tạo độ khó bằng sự kiện bất ngờ không thể dự đoán; nên dùng cảnh báo sớm, chi phí rõ, và các chiến lược khác nhau.
- **Mission Replay / What If?** (đề xuất bổ sung): Quay lại một quyết định quan trọng để so sánh hệ quả, không nhất thiết đưa vào MVP nếu thiếu thời gian.
- Có thể thêm nhiệm vụ phụ để khuyến khích chơi lại, nhưng không làm điều kiện thắng chính quá rối.

## 12. Giá trị giáo dục và dữ liệu NASA

### Science Brief

Sau mỗi Sol, giải thích ngắn gọn **điều gì xảy ra, vì sao xảy ra, quyết định nào dẫn đến hệ quả đó** dựa trên số liệu lượt chơi.

### Dữ liệu thực

- Khuyến nghị nghiên cứu **NASA DONKI** cho hiện tượng thời tiết không gian và các nguồn NASA phù hợp về Mặt Trăng/Mars.
- Có thể sử dụng một **tập dữ liệu NASA đã tuyển chọn và lưu sẵn**, không bắt buộc gọi API trực tiếp trong MVP.
- Ghi nguồn, ngày dữ liệu và phân biệt rõ **dữ liệu quan sát**, **giả định mô phỏng**, **quy tắc cân bằng game**.
- **Chưa chốt dataset, API hay công thức khoa học cụ thể.** Đây là hạng mục quan trọng cần bổ sung trước khi tuyên bố game dựa trên dữ liệu NASA.

### Learning Report (đề xuất)

Cuối nhiệm vụ có thể hỏi 2–3 câu ngắn để kiểm tra học sinh có hiểu về đánh đổi kỹ thuật hay không. Nếu có thời gian, thử nghiệm với trẻ đúng độ tuổi và ghi nhận kết quả.

## 13. Kiến trúc kỹ thuật gợi ý

```text
React / Web UI (Cockpit, Panels, Log)
                |
        Game Engine (TypeScript)
                |
       +--------+---------+
       |                  |
 Event Scheduler     Resource Rules
 + Event Graph       + Crew / Robot
       |                  |
       +--------+---------+
                |
        Game State + Save
                |
      Mission Log / Science Brief
```

**Các thành phần cần tách rõ:**

- **State:** Sol, kho, nhân vật, công việc, thiết bị, robot, mục tiêu, lịch sự kiện.
- **Actions:** Người chơi chọn thao tác hợp lệ; chưa trừ nguồn lực thật cho đến thời điểm quy định.
- **End-Sol Resolver:** Xử lý theo thứ tự cố định, có kiểm thử.
- **Event Scheduler & Graph:** Dữ liệu sự kiện có thể khai báo bằng JSON/TypeScript.
- **Save/Load:** Tiếp tục game mà không làm lệch lịch sự kiện.
- **UI:** Chỉ hiển thị game state và gửi hành động, không chứa công thức logic lõi.

## 14. Phạm vi MVP và thứ tự ưu tiên

### Bắt buộc

- [ ] Cockpit 2D point-and-click với ảnh tạm trước, hoàn thiện sau.
- [ ] Game State + End-Sol Resolver.
- [ ] 3 tài nguyên chính: Power, Oxygen, Water.
- [ ] 4 phi hành gia, Health, trạng thái làm việc, phân công độc quyền.
- [ ] Tương tác thiết bị thiết yếu.
- [ ] Robot khảo sát + 3 chuyến có kết quả theo điều kiện.
- [ ] Event Scheduler / Event Graph đơn giản.
- [ ] Chuỗi huấn luyện 12 Sol có thể thắng/thua, đặc biệt kiểm thử hai nhánh Sol 7.
- [ ] Mission Log, Science Brief.
- [ ] Save/Load và Mission Summary.
- [ ] Ít nhất một điểm sử dụng dữ liệu NASA có nguồn rõ ràng.

### Nên có nếu còn thời gian

- [ ] Tutorial dễ hiểu cho trẻ 7–12 tuổi.
- [ ] Mission Replay / What If? cho các quyết định quan trọng.
- [ ] Learning Report và thử nghiệm người dùng.
- [ ] Hiệu ứng trạng thái thiết bị và biểu cảm nhân vật.

### Để sau

- [ ] Crafting và nâng cấp nhiều cấp.
- [ ] Thuộc tính Strength / Agility / Intelligence, Morale / Sanity phức tạp.
- [ ] Hệ thống achievement/medal lớn.
- [ ] Campaign Mặt Trăng 32 Sol và Sao Hỏa 36 Sol.
- [ ] Nhiều chế độ khó, AI chatbot, multiplayer.

## 15. Định hướng hình ảnh và asset

- **Phong cách:** 2D cartoon vẽ tay, nét viền đậm, tỉ lệ hơi cường điệu, gam màu retro, cảm giác sinh tồn không gian pha hài hước; **không sao chép nhân vật và asset của game tham chiếu**.
- **Cockpit:** Bố cục 16:9, thiết bị có vùng click rõ.
- **Nhân vật:** 4 chân dung riêng, biểu cảm/trạng thái có thể thay đổi.
- **Asset trong đề xuất ban đầu:** 1 nền cockpit, 4 chân dung, 1 ngoại cảnh Mặt Trăng, tối đa 10 icon.
- **Bàn giao:** Nền WebP 1920 × 1080; chân dung WebP alpha 512 × 512; ngoại cảnh WebP ~1280 px ngang; icon SVG viewBox 0 0 24 24; file nguồn có layer, tách riêng các vật thể đổi trạng thái.

## 16. Các quyết định còn phải chốt

1. Công thức điện/oxy/nước cho mỗi Sol: sản xuất, tiêu thụ, giới hạn và thứ tự xử lý.
2. Ngưỡng Health, quy tắc bị thương, điều trị và không thể làm việc.
3. Mỗi thiết bị cần bao nhiêu người, điện, vật liệu; sửa chữa mất mấy Sol.
4. Robot khảo sát mất bao nhiêu Sol, cần dụng cụ gì, điều kiện thành công/thất bại.
5. Event Graph chi tiết của 12 Sol và cách xử lý khi lựa chọn bị khóa.
6. Dataset NASA cụ thể, đơn vị và cách chuyển thành biến mô phỏng.
7. Cách bảo đảm các nhánh chính — đặc biệt Sol 7 — không tạo đường chơi bất khả thi ngoài ý muốn.
8. Bản đồ màn hình và trải nghiệm mobile; quy tắc lưu/khôi phục.
9. Kế hoạch playtest với trẻ 7–12 tuổi và tiêu chí đánh giá học tập.

## 17. Hướng mở rộng dài hạn (chưa thuộc MVP)

- **Chiến dịch Mặt Trăng:** Đề xuất 32 Sol, gồm chuẩn bị nguồn dự phòng và vượt qua 14 lượt đêm trước khi phục hồi điện mặt trời.
- **Chiến dịch Sao Hỏa:** Đề xuất 36 Sol, có bão bụi, liên lạc trễ, tiếp tế nhiều Sol và bài toán sử dụng MOXIE/nhà kính.
- Cả hai chiến dịch phải được cân bằng sau khi bài huấn luyện 12 Sol hoạt động tốt.

## 18. Tài liệu đầu vào và mức độ xác nhận

- **Đề xuất sản phẩm Project Hail:** Nguồn cho định hướng, vòng chơi, 12 Sol, 4 phi hành gia, điều kiện thắng, sự kiện Sol 7, phạm vi artist/web dev và chiến dịch dài hạn.
- **GAMEPLAY_REFERENCE_1_3_2.md:** Nguồn tham khảo cơ chế ở cấp hệ thống của *60 Parsecs! 1.3.2*. Tài liệu tự ghi nhận một số cơ chế chưa được xác minh hoàn toàn qua UI; số asset phân loại được không phải số sự kiện bắt buộc triển khai.
- **NASA Space Apps Challenge 2026 — Build a Junior Astronaut Mission Trainer:** Nguồn đề bài về trải nghiệm quản lý tiền đồn, đánh đổi tài nguyên và học STEM cho trẻ 7–12 tuổi.
- **Các đề xuất mới trong cuộc thảo luận:** Ba tài nguyên hiển thị chính, tối giản Health, cấu trúc màn hình, 6 thiết bị, ba khu vực minh họa, kịch bản gợi ý theo Sol, Mission Replay và Learning Report. Các mục này cần team duyệt trước khi coi là yêu cầu chính thức.

---

**Đề xuất bước kế tiếp:** Chuyển mục 16 thành bảng thông số gameplay (*Resource Balance Sheet*) và đặc tả sự kiện từng Sol để developer có thể bắt đầu triển khai và kiểm thử.
