# Truy vết gameplay 60 Parsecs! 1.3.2

Đối chiếu CIL của Assembly-CSharp-firstpass.dll. SHA-256 trùng với SYSTEM_ARCHITECTURE.md. Không chạy game trong lượt truy vết này.

| Cơ chế | Bằng chứng tĩnh | Điểm còn mở |
|---|---|---|
| Thám hiểm | 0600350E tạo ô từ danh sách nhân vật và xử lý riêng ô thuyền trưởng. 06003510 giữ ô đang hiện, kiểm tra CanLock và cờ trạng thái để đặt khả năng chọn và độ mờ. Ô đã bật có thể giữ khả năng tương tác ở nhánh bị chặn. 06002E87 kiểm tra Locked. 06002F8B duyệt mọi trạng thái hiện hành, chỉ cần một cờ AllowsGoingOnExpedition sai để chặn. 060031C1 gửi chuyến đã lên kế hoạch khi listener chạy. | Đọc giá trị cờ của Tired, Sick, Hurt trong asset 12133, 12129, 12117. Xác minh xử lý khi điều kiện thay đổi sau khi lên kế hoạch. |
| Sự kiện | 06001E08 chọn ngẫu nhiên thành viên theo cấu hình node. Predicate 06001E0E loại người có trạng thái cấm lựa chọn. 06001E12 dùng điều kiện thám hiểm riêng. 06002F8C đọc AllowsSelectionInEventChoice trên từng trạng thái. | Đối chiếu hai cờ trong asset và lần theo đường hiển thị khi người chơi trực tiếp chỉ định người. |
| Sửa hệ thống | 06003416 và 06003558 xử lý vật phẩm và tài nguyên ở các panel sửa Crafting và Expedition. Hai đường này không lấy người sửa. | Sửa chữa qua lựa chọn sự kiện vẫn phụ thuộc graph của sự kiện. |
| Kết thúc | EndGameNode.Execute (06002195) đọc kết quả từ đầu vào, gọi EndGameManager.EndGame (06003164), rồi tiếp tục flow. EndGame đặt ShouldEndGame và IsGameWon. OnEndDayVisual (06003162) có đường thua riêng dựa trên HasEndGameStatus của thuyền trưởng nếu bật kiểm tra tương ứng, và đường điều kiện tùy chỉnh. Nội dung và slide có node riêng (06001D1B, 06001E5F). | Chưa nối graph sự kiện cụ thể từ điểm kích hoạt đến EndGameNode hoặc quan sát màn kết thúc. |

## Phạm vi Hail

Giữ cấu trúc vòng lặp theo lượt, đánh đổi tài nguyên, lập kế hoạch, và cockpit point-and-click 16:9. Kịch bản và mục tiêu thắng dùng nhiệm vụ NASA của Hail. Kết quả nhiệm vụ có thể được tính trong engine, rồi được UI trình bày ở màn chuyển Sol cùng Science Brief.

Cấu hình hiện có 0,84 kg oxy và 2,5 L nước mỗi người mỗi Sol, WRS 85/90/93% theo cấp, tiếp tế 4/22 Sol, radio 1,3 giây ở Mặt Trăng và một giá trị cố định 14 phút trên Sao Hỏa. Chín điều kiện Moon-to-Mars hiện gồm năm ngưỡng tồn kho và bốn ngưỡng nhiệm vụ. Kiểm tra quân số đếm người chưa sơ tán. Kiểm tra Sol chỉ so ngưỡng. Cần chốt nghĩa của đủ sức khỏe và vượt qua đêm trăng trước khi coi hai kiểm tra này tương đương yêu cầu thiết kế.

## Cờ trạng thái trong asset Unity

Đọc bảng object của sharedassets0.assets (serialized file v17) và đối chiếu thứ tự trường SerializeField của CharacterStatus trong assembly. Các offset bên dưới tính từ đầu payload của object, dạng thập phân. Giá trị là 0 hoặc 1, mỗi trường bool được căn 4 byte trong các object này.

| PathID | Trạng thái | AllowsGoingOnExpedition | AllowsSelectionInEventChoice | AllowsRationing | PreventsReturnFromExpedition |
|---|---|---|---|---|---|
| 12117 | Hurt | 1 tại 204 | 1 tại 212 | 1 tại 216 | 0 tại 208 |
| 12129 | Sick | 1 tại 204 | 1 tại 212 | 1 tại 216 | 0 tại 208 |
| 12133 | Tired | 0 tại 212 | 1 tại 220 | 1 tại 224 | 0 tại 216 |

Các getter tương ứng là 06002F50, 06002F51, 06002F55 và 06002F59. Bộ lọc 06002F8B và 06002F8C duyệt mọi trạng thái đang hoạt động. Tired tự nó chặn lượt chọn EVA mới. Cả ba trạng thái vẫn cho phép lựa chọn sự kiện qua bộ lọc trạng thái chung, nhưng sự kiện có thể đặt thêm điều kiện, kể cả điều kiện đủ sức đi thám hiểm. Đây là xác minh tĩnh, không phải quan sát UI game đang chạy.
