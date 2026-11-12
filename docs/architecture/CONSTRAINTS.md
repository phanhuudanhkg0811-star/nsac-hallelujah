# PROJECT CONSTRAINTS & SPECIFICATIONS

Tài liệu này xác định các giới hạn bắt buộc (Hard Constraints) và tiêu chuẩn chất lượng của dự án nhằm đảm bảo code nhẹ, chạy mượt, đúng tinh thần khoa học NASA và đáp ứng mục tiêu tạo dựng CV chất lượng cao cho Web Developer.

---

## 1. Ràng buộc Kỹ thuật & Hiệu năng (Technical & Performance Constraints)

* **Tốc độ tải trang & Dung lượng**:
  * Initial Bundle Size: Không vượt quá **2.5 MB** (sau khi nén Gzip/Brotli).
  * Thời gian tải lần đầu (First Contentful Paint): Dưới **2.0 giây**.
  * Tốc độ khung hình (FPS): Duy trì ổn định **60 FPS** trên cả máy tính bàn và điện thoại di động tầm trung.
* **Tách rời tuyệt đối Kiến trúc (Clean Decoupled Architecture)**:
  * Thư mục `engine/` (Core Simulation) phải là **Pure TypeScript**, **KHÔNG ĐƯỢC PHỤ THUỘC** vào React DOM hay bất kỳ thư viện UI nào.
  * Toàn bộ phép tính sinh tồn phải là Deterministic (có thể viết Unit Test độc lập bằng Vitest/Jest).
* **Quản lý Trạng thái (State Management)**:
  * Sử dụng **Zustand** (tránh Redux cồng kềnh để giữ code nhẹ và dễ hiểu).
  * Hỗ trợ lưu trữ tiến trình chơi vào `LocalStorage` hoặc `IndexedDB` (người chơi tắt trình duyệt mở lại vẫn giữ nguyên Sol hiện tại).
* **Thiết kế hướng Dữ liệu (Data-Driven Design)**:
  * Không hardcode kịch bản sự cố hay chỉ số nhân vật vào logic code.
  * Toàn bộ sự kiện, thông số phi hành gia, chi phí thiết bị phải nằm trong thư mục `src/data/*.json`.

---

## 2. Ràng buộc Đồ họa & Tài nguyên Hình ảnh (Asset Pipeline)

* **Định dạng Tài nguyên**:
  * Toàn bộ ảnh minh họa của Artist phải được tối ưu và xuất ở định dạng **WebP** hoặc **SVG** (cho các icon, đường viền HUD).
  * Sử dụng CSS Glassmorphism và SVG Vector Gauges thay vì chèn các file ảnh nặng để làm bảng điều khiển.
* **Canvas / Hiệu ứng đặc biệt**:
  * Chỉ dùng Canvas 2D hoặc CSS Shaders nhẹ cho các hiệu ứng nền: bụi cát Sao Hỏa bay (particle system), ánh sáng ngày/đêm ngoài cửa sổ, dòng quét CRT.
  * Hạn chế tối đa việc render lại (re-render) không cần thiết ở các component React.

---

## 3. Ràng buộc Khoa học NASA & Giáo dục STEM (Scientific Accuracy)

* **Bảo toàn Khối lượng & Năng lượng (Mass & Energy Conservation)**:
  * Tính toán lượng O2 tiêu thụ theo thực tế: ~0.84 kg O2/người/ngày.
  * Nước sinh hoạt: ~2.5 lít/người/ngày (kèm tỉ lệ tái chế qua hệ thống WRS từ 85% - 93%).
  * Năng lượng: Điện mặt trời suy giảm khi có bão bụi hoặc vào ban đêm; điện hạt nhân ổn định nhưng sinh nhiệt.
  * **Food Production (Nhà kính sinh học)**: Quản lý chu trình nước tưới, dinh dưỡng và chiếu sáng cho hệ thống trồng cây (Veggie/APH); thu hoạch rau củ bổ sung calo và phục hồi tinh thần.
  * **Radiation Shielding (Chắn bức xạ)**: Theo dõi liều kế bức xạ (mSv) và độ bền vỏ trạm/khiên chắn theo dữ liệu bão mặt trời từ NASA DONKI.
* **Độ trễ Sóng vô tuyến (Radio Latency)**:
  * Phải thể hiện được độ trễ thời gian thực khi gửi tín hiệu về Trái Đất (Mặt Trăng: ~1.3 giây; Sao Hỏa: 4 - 24 phút).
* **Hậu cần Tiếp tế (Logistics & Resupply)**:
  * Tàu chở hàng không thể xuất hiện ngay lập tức; phải có hàng đợi thời gian (Transit Countdown tính bằng Sol).
  * Trọng tải tiếp tế bị giới hạn nghiêm ngặt (Mass budget).
* **Tính Giáo dục & UX cho Lứa tuổi 7–12 (Pedagogical Feedback Loop)**:
  * Mỗi khi kết thúc Sol, màn hình báo cáo (End-of-Sol Report) phải hiển thị hộp **"NASA Science Brief / Kiến thức Khoa học"** ngay sau bảng số liệu thống kê để giải thích trực quan lý do khoa học của các hệ quả.
  * Sử dụng ngôn ngữ đại chúng, trực quan, giải thích thuật ngữ chuyên môn bằng ngữ cảnh và tooltip.

---

## 4. Ràng buộc Bản quyền & Sở hữu Trí tuệ (IP & Legal Constraints)

* **Tuyệt đối không dùng tài nguyên của game thương mại**:
  * Không sử dụng bất kỳ hình ảnh, file âm thanh, tên nhân vật, hay đoạn code dịch ngược nào từ *60 Parsecs!* hoặc *Robot Gentleman*.
  * Chỉ học hỏi **nguyên lý game loop** và **mô hình dữ liệu**.
* **Nguồn tài nguyên cho phép**:
  * Đồ họa tự vẽ 100% bởi Artist của team.
  * Dữ liệu hình ảnh khoa học công khai từ NASA (NASA Open Media Archive - Public Domain).
  * Âm thanh từ các nguồn bản quyền miễn phí (CC0 / Freesound) hoặc tạo từ Web Audio API.

---

## 5. Ràng buộc Phạm vi (Scope Constraints)

* **KHÔNG** làm minigame 3D gom đồ 60 giây.
* Tập trung tối đa vào **Giai đoạn Vận hành Trạm (Outpost Survival Simulation)**:
  * 1 Màn hình Dashboard trung tâm (Cockpit).
  * 1 Terminal giao tiếp và nhật ký (Mission Log & Radio).
  * 1 Bảng phân bổ tài nguyên & hệ thống (Systems & Rationing).
  * 1 Cửa sổ quan sát ngoại cảnh (Surface Observation Window).
