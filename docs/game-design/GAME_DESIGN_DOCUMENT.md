# PROJECT HAIL — GAME DESIGN DOCUMENT (GDD v2.0)

> **Tên dự án**: Project Hail — Junior Astronaut Mission Trainer  
> **Cuộc thi**: 2026 NASA Space Apps Challenge (Chủ đề: *Build a Junior Astronaut Mission Trainer*)  
> **Thể loại**: Turn-Based Survival Strategy / Space Simulation / STEM Educational Game  
> **Nền tảng**: Web SPA (Ưu tiên Desktop, Responsive thích ứng Mobile)  
> **Đối tượng người chơi**: Học sinh 7–12 tuổi  
> **Trạng thái tài liệu**: Bản đặc tả thiết kế cơ chế & luật chơi cốt lõi (Core Mechanics)  

---

## 1. BỐI CẢNH & TẦM NHÌN SẢN PHẨM (LORE & VISION)

### 1.1. Cốt truyện Khởi đầu (Narrative 2050)
* **Mốc thời gian**: Năm **2050**.
* **Bối cảnh**: Nhân loại đẩy mạnh công cuộc thám hiểm không gian sâu. Một phi hành đoàn gồm **4 nhà khoa học** được cử lên một con tàu viễn chinh nhằm tìm kiếm **[Mục tiêu khảo sát chưa thiết lập — TBD]**.
* **Nhiệm vụ đầu tiên**: Tiền đồn Mặt Trăng (*Artemis Base Camp*). Đây là trạm kiểm chứng khả năng tự chủ sinh tồn và vận hành nghiên cứu thực địa trước khi phi hành đoàn được phê duyệt chuyển tiếp sang các hành tinh xa hơn.

### 1.2. Giá trị Cốt lõi & Tôn chỉ Giáo dục (STEM Pillars)
* **Quyết định luôn gắn liền với Đánh đổi (Engineering Trade-offs)**: Mọi quyết định kỹ thuật đều có chi phí và hệ quả vật lý rõ ràng.
* **Học từ Thực tế Mô phỏng**: Học sinh học về các thách thức ngoài không gian thông qua chuỗi lựa chọn và kết quả của từng Sol, không phải qua các câu đố trắc nghiệm lý thuyết thuần túy.
* **NASA Science Brief**: Hộp kiến thức khoa học cuối ngày giải thích nguyên nhân – kết quả dựa trên chính số liệu thực tế vừa tiêu hao/sinh ra trong lượt chơi.

---

## 2. NGUYÊN TẮC THIẾT KẾ CỐT LÕI (CORE DESIGN PRINCIPLES)

1. **Dễ học, khó tối ưu (Easy to Learn, Hard to Master)**: Luật chơi trực quan, học sinh nắm bắt nhanh nhưng phải tính toán để trạm sống sót dài hạn.
2. **Phản hồi minh bạch (Transparent Feedback)**: Hiển thị rõ chi phí tài nguyên, điện năng yêu cầu và lý do thao tác không hợp lệ trước khi chốt Sol.
3. **Phân biệt Khoa học thực tế & Tham số Game**: Tách bạch dữ liệu NASA thực (như mức O₂ ~0.84 kg/người/ngày) với các hằng số cân bằng gameplay.
4. **Nguyên tắc Phân công Độc quyền (Strict Single Assignment)**: Mỗi nhà khoa học chỉ được giao **tối đa 1 công việc trong mỗi Sol** (tính chung giữa bảo trì hệ thống trạm, trực ca Rover, hoặc xử lý sự cố khẩn cấp).

---

## 3. VÒNG LẶP GAMEPLAY CHÍNH (CORE TURN-BASED SOL LOOP)

Mỗi ngày trên trạm (1 Sol) diễn ra tuần tự qua các giai đoạn:

```text
+-----------------------------------------------------------------------------------+
| 1. ĐẦU SOL (Morning Briefing)  -> Đọc Mission Log, kiểm tra hỏng hóc đêm, sự kiện|
| 2. KỸ THUẬT (Base Engineering) -> Phân bổ điện, giao việc 4 nhà khoa học, bảo trì |
| 3. HẬU CẦN (Comms & Logistics) -> Nhận lệnh Trái Đất, lập lịch Rover, tàu tiếp tế|
| 4. KHẨU PHẦN (Evening Plan)    -> Kiểm tra tiêu thụ oxy/nước, cảnh báo thiếu hụt |
| 5. KẾT THÚC SOL (End Sol Res)  -> Chốt ngày, động cơ mô phỏng đêm, Science Brief  |
+-----------------------------------------------------------------------------------+
```

* **Thứ tự Xử lý Đêm của Engine (End-Sol Resolution Sequence)**:
  1. *Lưới điện*: Tổng phát (Solar + Fission) $\rightarrow$ Khấu trừ tải thiết yếu ($12\text{ kWh}$) $\rightarrow$ Khấu trừ thiết bị bật $\rightarrow$ Nạp/xả Pin.
  2. *Hệ thống Sinh tồn (ECLSS)*: Tiêu thụ $O_2$ và Nước sạch $\rightarrow$ Tái chế nước thải qua WRS $\rightarrow$ Lọc CO₂ qua Scrubber $\rightarrow$ Xử lý rò rỉ khí Airlock.
  3. *Robot Rover*: Cập nhật hành trình, kiểm tra rủi ro môi trường và liên lạc.
  4. *Trạng thái Nhân sự*: Cập nhật chỉ số Health và trạng thái thể lực.
  5. *Đánh giá Sống còn & Bài giảng*: Kiểm tra điều kiện thắng/thua, xuất nhật ký Sol và mở bài giảng *NASA Science Brief*.

---

## 4. MÔ HÌNH VẬT LÝ & TÀI NGUYÊN (ECLSS & POWER GRID)

### 4.1. Ba Tài nguyên Sống còn Hiển thị Trọng tâm

| Tài nguyên | Đơn vị | Định mức tiêu thụ / Sol | Nguồn cấp / Bổ sung | Khi cạn kiệt |
|---|---|---|---|---|
| **Power (Điện)** | kWh | $12\text{ kWh}$ (Tải thiết yếu trạm) | Fission: $8\text{ kWh}$ (nền), Solar: $25\text{ kWh}$ (ngày), Pin: $60\text{ kWh}$ | Trạm sập nguồn, WRS ngừng, trôi dạt sự cố |
| **Oxygen ($O_2$)** | kg | $0.84\text{ kg}$ / người / Sol | Bồn dự trữ trạm | Phi hành đoàn ngạt khí, tụt Health nhanh chóng |
| **Water ($H_2O$)** | Lít (L) | $2.5\text{ L}$ / người / Sol | Tái chế nước thải qua WRS ($85\%–93\%$) | Mất nước, kiệt sức, tử vong sau 3 Sol |

### 4.2. Tài nguyên Bổ trợ
* **Food (Lương thực)**: Mức tiêu thụ $0.62\text{ kg/người/Sol}$. Tự động trừ trong MVP để tránh phức tạp hóa thao tác.
* **Parts (Phụ tùng bảo trì - kg)**: Dùng để sửa chữa hệ thống hỏng hóc ($2\text{ kg/lần}$) và nâng cấp thiết bị ($4\text{ kg}$ lên Cấp 2, $8\text{ kg}$ lên Cấp 3).

### 4.3. Đặc thù Môi trường
* **Fission Surface Power**: Cung cấp ổn định **$8\text{ kWh/Sol}$** liên tục bất kể thời tiết.
* **Solar Array**: Ban ngày sản sinh **$25\text{ kWh/Sol}$** (Cấp 1: x1.0, Cấp 2: x1.2, Cấp 3: x1.4).
* **Đêm Trăng (Lunar Night)**: Kéo dài **14 Sol liên tiếp**, quang năng bằng $0\text{ kWh}$. Trạm hoàn toàn phụ thuộc vào nguồn Fission và Pin lưu trữ ($60\text{ kWh}$).

---

## 5. NHÂN SỰ & QUY TẮC PHÂN CÔNG (CREW MANAGEMENT)

### 5.1. Bốn Nhà Khoa học
1. **Sarah Chen** — Trưởng đoàn / Kỹ sư Hệ thống.
2. **Alex Rivera** — Chuyên gia Điện lực & Môi trường trạm.
3. **Marcus Vance** — Bác sĩ & Chuyên gia ECLSS.
4. **Elena Rostova** — Nhà Địa chất hành tinh & Điều phối Rover.

### 5.2. Máy Trạng thái Thể chất (Health FSM)
* Thang điểm: **0 – 100 Health**.
* **Available (Sẵn sàng)**: Có thể nhận mọi công việc.
* **Busy (Đang bận)**: Đã được giao việc trong Sol đó.
* **Injured (Bị thương)**: Giới hạn việc nặng, cần điều trị.
* **Incapacitated (Vô hiệu hóa)**: Không thể làm việc.
* **Deceased (Tử vong)**: Khi Health về 0.

### 5.3. Luật Phân công
* **Một người tối đa một việc trong mỗi Sol**: Sau khi phân công, nhân sự chuyển sang trạng thái `Busy`.
* Các nhóm công việc:
  - *Bảo trì / Sửa chữa thiết bị* (1 người).
  - *Trực ca xuất phát / Thu hồi Rover* (1 người tại Sol phóng/về).
  - *Can thiệp khẩn cấp / Khôi phục liên lạc* (1 người).
  - *Nghỉ ngơi hồi sức*.

---

## 6. KHẢO SÁT BẰNG ROBOT TỰ HÀNH (ROVER EXPEDITIONS)

* **Vận hành từ xa**: Robot Rover hoạt động tự hành ngoài thực địa qua nhiều Sol. Phi hành gia không trực tiếp ra ngoài đi bộ mà điều khiển, giám sát và hỗ trợ từ tiền đồn.
* **3 Khu vực Khảo sát**:
  1. *Lunar Crater (Miệng hố Mặt Trăng)*.
  2. *Regolith Field (Mỏ bụi đất Regolith)*.
  3. *Permanently Shadowed Region (Vùng tối vĩnh cửu - PSR)*.
* **Chuỗi Huấn luyện 12 Sol (3 Chuyến)**:
  - Chuyến 1: Sol 1–4.
  - Chuyến 2: Sol 5–8 (Xuất hiện sự cố đứt tín hiệu ở Sol 7).
  - Chuyến 3: Sol 9–12.
* **Điều kiện Thắng Huấn luyện (MVP)**: Cả 4 nhà khoa học còn sống đến hết Sol 12 VÀ hoàn thành ít nhất **2 / 3 chuyến khảo sát**.

---

## 7. ĐIỂM RẼ QUYẾT ĐỊNH TRỌNG TÂM: SỰ CỐ SOL 7

* **Tình huống**: Ở Sol 7, trạm phát hiện rò rỉ khí và nguồn điện căng thẳng. Đúng lúc này, Robot ở chuyến 2 mất tín hiệu. Ba nhà khoa học Chen, Rivera, Vance đã được điều động xử lý sự cố trạm. Chỉ còn **Elena Rostova**.
* **Đánh đổi Kỹ thuật**:
  - **Nhánh A — Cứu Robot (Khôi phục liên lạc)**:
    - Cử Elena can thiệp thiết bị phát sóng (tốn $2\text{ kWh}$ pin).
    - Hoãn chu kỳ tái chế nước WRS $\rightarrow$ Cuối Sol 7 còn $25.0\text{ L}$ nước sạch và $2\text{ kWh}$ pin.
    - *Hệ quả*: Chuyến 2 hoàn thành an toàn ở Sol 8 $\rightarrow$ Mở ra cơ hội hoàn thành $3/3$ chuyến.
  - **Nhánh B — Ưu tiên Trạm (Bảo toàn sinh tồn)**:
    - Cử Elena bảo trì bộ lọc và duy trì WRS chạy đủ chu kỳ ($4\text{ kWh}$).
    - Cuối Sol 7 giữ được $34.3\text{ L}$ nước sạch nhưng pin cạn về $0\text{ kWh}$.
    - *Hệ quả*: Hết thời hạn can thiệp, Robot mất mục tiêu $\rightarrow$ Chuyến 2 thất bại. Bắt buộc phải hoàn thành trọn vẹn chuyến 3 để đạt chỉ tiêu tối thiểu $2/3$ chiến thắng.

---

## 8. ĐỊNH HƯỚNG MỞ RỘNG DÀI HẠN (POST-MVP ROADMAP)

* **Chiến dịch Mặt Trăng Mở rộng (32 Sol)**: Thử thách sống sót trọn vẹn 14 Sol Đêm Trăng liên tiếp bằng nguồn hạt nhân và pin lưu trữ trước khi đón ánh sáng mặt trời trở lại.
* **Chuyển tiếp Hohmann (Moon-to-Mars)**: Tích lũy đủ tài nguyên dự trữ ($35\text{ kg } O_2, 45\text{ L } H_2O, 30\text{ kg}$ thực phẩm, $12\text{ kg}$ phụ tùng, $40\text{ kWh}$ điện) để phóng tàu sang Sao Hỏa.
* **Chiến dịch Sao Hỏa (36 Sol)**: Bão bụi toàn cầu che khuất $85\%$ quang năng, trễ sóng liên lạc 4–24 phút (đòi hỏi quyết định hoàn toàn tự chủ), vận hành máy tạo oxy MOXIE và xử lý đất độc perchlorate.
