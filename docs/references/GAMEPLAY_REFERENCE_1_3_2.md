# Cơ chế gameplay tham chiếu · 60 Parsecs! 1.3.2

Phạm vi gồm các hệ thống sau khi bắt đầu vận hành tàu và nội dung phát sinh qua các lượt sinh tồn. Kịch bản, nhân vật hư cấu, lời thoại và các nhánh fantasy được thay bằng nhiệm vụ khoa học. Danh mục ghi nhận cơ chế ở cấp hệ thống. Các mục cần đối chiếu thêm được đánh dấu ở cuối.

| Hệ thống | Cơ chế trong bản tham chiếu |
|---|---|
| Vòng lặp theo ngày | Đọc báo cáo và sự kiện hiện tại, lựa chọn, lên lịch chế tạo và thám hiểm, phân khẩu phần, gạt cần kết thúc ngày. Lượt chuyển cảnh chạy xử lý theo nhóm listener, rồi hiện nhật ký và ngày mới. Scheduler có cơ chế xử lý ngày bỏ qua. |
| Buồng tàu point-and-click | Tương tác với máy tính sự kiện, nhân vật, vật phẩm trên kệ, máy chế tạo, module thám hiểm và điều khiển cuối ngày. Panel hiển thị lựa chọn, trạng thái khả dụng, chi phí, lý do khóa và thông tin tiến độ. |
| Phi hành đoàn | Vai trò thuyền trưởng và thành viên, thuộc tính Strength, Agility, Intelligence, trạng thái sống, khả năng hiện diện trên tàu, quan hệ và tinh thần. Kiểm tra có thể dùng điểm cá nhân hoặc điểm đội tùy sự kiện. |
| Nhu cầu và trạng thái | Health, Hunger, Morale, Sanity. Chỉ số thay đổi qua ngày, khẩu phần và sự kiện. Máy trạng thái năm bậc có ngưỡng lên xuống riêng. Có hiệu ứng khi nhận, duy trì hoặc mất trạng thái, miễn một số thay đổi và các trạng thái ảnh hưởng đến việc chọn người, nhận khẩu phần hoặc trở về. |
| Phân công độc quyền | Lựa chọn thám hiểm giữ chỗ nhân vật. Lựa chọn sự kiện dùng CanLock có thể bị chặn khi người đã được giữ chỗ. Khẩu phần có bộ lọc riêng. Quy tắc một việc mỗi Sol áp dụng toàn bộ việc trạm và robot là quyết định của Hail. |
| Khẩu phần và chữa trị | Lên kế hoạch phân đồ ăn và vật phẩm chữa trị theo người. Kiểm tra khả dụng và các trạng thái cho phép, xử lý khi qua ngày, rồi xóa kế hoạch khẩu phần. |
| Kho và vật phẩm | Kho Chemical, Mineral và Power có trần, có lượng đang dự kiến dùng. Vật phẩm gồm đồ tiêu hao và đồ tái sử dụng, có trạng thái khả dụng, hư hỏng, nâng cấp và đang mang đi thám hiểm. |
| Chế tạo và bảo trì | Chế tạo, sửa, nâng cấp và tái chế vật phẩm. Điều kiện và chi phí theo từng operation. Công việc đã lập lịch có tiến độ qua ngày và sự kiện hoàn tất. |
| Hệ thống tàu | Crafting, Engine, Expedition và Suit có chi phí và cấp nâng cấp. Một số panel yêu cầu vật phẩm hoặc tài nguyên để kích hoạt hay sửa hệ thống. Cấp module ảnh hưởng khả năng tiếp cận điểm đến hoặc thiết bị. |
| Hạ cánh và khu vực khảo sát | Hạ cánh gắn tàu với bộ dữ liệu hành tinh. Điểm đến có điều kiện mở khóa, cấp tối thiểu, mối nguy, phần thưởng và cờ đã ghé. |
| Thám hiểm | Chọn điểm đến, một người và trang bị. Xác nhận tạo kế hoạch. Qua ngày mới xuất phát, rút thời lượng, đưa sự kiện vào lịch và giữ người cùng trang bị ngoài tàu. Cập nhật so mốc về trước khi tăng thời gian. Trang bị có thể chặn mối nguy. Kết quả ảnh hưởng người đi, trang bị và phần thưởng. Hail chuyển phần khảo sát từ xa sang robot. |
| Lập lịch sự kiện | Sự kiện sinh tồn, sự kiện hệ thống và sự kiện thám hiểm. Deck có trọng số, điều kiện theo hành tinh hoặc trạng thái nhân vật. Scheduler hỗ trợ sự kiện đã đặt lịch, điều kiện kích hoạt, báo cáo, hành động ngày mới và các sự kiện phát sinh theo chuỗi. |
| Lựa chọn và hệ quả | Các dạng đã thấy gồm có/không, chọn thuộc tính, chọn vật phẩm và chỉ định người. Graph có thể kiểm tra chỉ số, vật tư, trạng thái, tag hoặc sự kiện trước đó. Kết quả có thể đổi kho, vật phẩm, trạng thái, mục tiêu và lịch sự kiện. |
| Nhật ký và phản hồi | Starlog, báo cáo lựa chọn, kết quả của chuyến và cập nhật trạng thái người, vật phẩm, hệ thống, ngày. |
| Nhiệm vụ và mục tiêu | Có cơ chế nhiệm vụ đang diễn ra, thêm hoặc hoàn thành mục tiêu, mở điểm đến và ghi tóm tắt nhiệm vụ. Nội dung mục tiêu của Hail sẽ theo chiến dịch Mặt Trăng và Sao Hỏa. |
| Kết thúc và tổng kết | Graph có thể ghi kết quả thắng hoặc thua. Trình xử lý cuối ngày hỗ trợ trạng thái thuyền trưởng và điều kiện tùy chỉnh. Có màn tổng kết, nội dung kết thúc, slideshow và thống kê. |
| Tiến trình và thành tích | Có lưu và tiếp tục tiến trình, thống kê trong và sau lượt chơi, hệ thống achievement và medal. |

## Phần cần đối chiếu thêm

- Chưa tái dựng toàn bộ graph, điều kiện kích hoạt, phần thưởng và cấu hình của từng nhiệm vụ hoặc biến thể chế độ. Đặc tả đã thống kê 445 asset SurvivalEvent, 87 SystemStatusEvent và 50 ExpeditionEvent. Các con số là số asset phân loại được.
- Cần xác minh đầy đủ quy tắc hủy hoặc đổi kế hoạch, sự kiện trùng lịch, tần suất và thời lượng Tired, và đường chọn người đặc thù của từng sự kiện.
- Danh mục dựa trên CIL, asset và các lớp có trong assembly. Mức bằng chứng của các cơ chế không đồng đều. Sự hiện diện của lớp hoặc node chưa xác nhận nó được kích hoạt trong mọi cấu hình. Chưa kiểm tra thực nghiệm toàn bộ qua UI 1.3.2.

Bằng chứng chi tiết và token CIL nằm trong [Đặc tả kiến trúc](SYSTEM_ARCHITECTURE.md) và [Truy vết gameplay Windows](WINDOWS_GAMEPLAY_TRACE.md).
