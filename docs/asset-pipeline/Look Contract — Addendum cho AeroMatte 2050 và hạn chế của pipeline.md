# Look Contract — Addendum cho AeroMatte 2050 và hạn chế của pipeline

Bản nháp v0.1 · 12/11/2026 · Project Hail (NASA Space Apps 2026) · Trạng thái: CHƯA áp dụng vào hai file gốc. Chờ quyết định D1–D7 (mục 9) và phản biện.

Viết tắt: APS = ASSET\_PROMPT\_STANDARD.md; A25 = AEROMATTE\_2\_5D\_ASSET\_PIPELINE.md.

## 0. Cách đọc (dành cho agent phản biện)

Mỗi khẳng định mang một nhãn bằng chứng:

- &#91;Đo\]: số đo trên ảnh concept máy in 3D (PNG 494×360, kênh alpha toàn 255, không trong suốt). ΔE dùng CIE76, các ô lấy mẫu đặt tay, ảnh là screenshot đã nén. Số chỉ có giá trị chỉ báo.
- &#91;TL\]: trích từ APS hoặc A25 (ghi rõ file và mục).
- &#91;Web\]: tra cứu ngày 12/11/2026, nguồn ở mục 13.
- &#91;Đề xuất\]: thiết kế mới, chưa test.
- &#91;Chưa KC\]: chưa kiểm chứng.

Muốn bác bỏ mục \[Đo\], \[TL\] hoặc \[Web\], hãy đưa bằng chứng hoặc test thay thế. Muốn bác bỏ mục \[Đề xuất\], hãy đưa thiết kế hoặc test tốt hơn. Ý kiến thẩm mỹ thuần túy không đủ để bác bỏ.

## 1. Vấn đề

Mục tiêu: sprite đơn lẻ đặt trên nền game 2D phẳng, vẫn đẹp, có chiều sâu 2.5D và giữ cùng cảm giác thị giác với concept (glow, vết mòn, màu ấm).

Lo ngại: nếu mỗi asset tự tạo glow, shade, light thì sẽ lệch nhau và lệch concept; trong khi quy tắc hiện hành cấm bloom (APS §1 rule 3, A25 §5), cấm màu ngoài palette (APS §1 rule 4) và cấm bake ánh sáng nền cabin (A25 §7).

Nguyên nhân gốc: concept trộn ba loại thông tin vào một bức tranh — thuộc tính của vật, hiệu ứng ánh sáng của cảnh và cấu trúc chiều sâu — còn quy tắc hiện hành đối xử với cả ba như một.

Đính chính so với phân tích trước: vết mòn không bị quy tắc nào cấm; pipeline chỉ chưa định nghĩa nó. Bloom, màu ngoài palette và bake ánh sáng mới là các điều khoản cấm thật.

## 2. Nguyên tắc: tách Vật / Cảnh / Cấu trúc \[Đề xuất\]

- Vật (bake vào asset): thứ vẫn đúng khi đem asset sang cảnh khác.
- Cảnh (áp lúc chạy game, dùng chung): thứ chỉ đúng trong một môi trường.
- Cấu trúc: camera, thứ tự lớp, pass chiều sâu.

Phân loại các yếu tố trong concept:

- Vết xước, nứt, sơn bong, bẩn → Vật → bake vào albedo của chassis (mục 5).
- AO trong khoang, bóng giữa gantry và rail → Vật → giữ nguyên như A25 §7 (được bake có kiểm soát).
- Đèn LED, đầu phun, viền HUD → Vật là nguồn sáng, glow là hiệu ứng lan ra → pass emissive riêng (mục 6).
- Vỏ ám ấm, kính và bàn in ám tím → Cảnh → lớp grade chung ở runtime (mục 7), không bake.
- Bóng tiếp xúc với mặt bàn → Cảnh → lớp contact shadow ở runtime (mục 7).
- Chiều sâu 2.5D → Cấu trúc → giữ camera ortho 12°, z-layer, pass depth/occlusion (A25 §4, §5, §7).

Cơ sở để tách màu ấm khỏi albedo \[Đo\]: vỏ máy đo khoảng #BA887B (mặt dưới) và #926668 (khung phải); một cụm màu chủ đạo #DEAB9A chiếm 15,3% pixel. Palette canonical là #ECEFF1 và #CFD8DC, tông lạnh (APS §2). Chỉ 12,3% pixel có ΔE ≤ 10 so với palette, 40,7% có ΔE ≤ 20, ΔE trung vị 23,1. Số đo không tách được ánh sáng khỏi màu vật liệu, nên đây là chỉ báo chứ không phải chứng minh.

## 3. Light Rig duy nhất \[Đề xuất\]

Mọi asset render qua cùng một rig trong Master Scene Blender; không asset nào tự quyết định ánh sáng.

- Key: hướng (phương vị, độ cao) và màu ấm — TBD, rút từ tranh cockpit master, không suy từ crop máy in. Tôi chưa đo hướng sáng trên bất kỳ ảnh nào.
- Fill: màu lạnh, cường độ thấp — TBD.
- Rim: TBD.
- Ghi vào manifest: lightRig và số phiên bản. Đổi rig = tăng phiên bản và render lại toàn bộ asset.
- Các giá trị đo ở mục 2 chỉ để tham chiếu, không dùng làm albedo.

## 4. Pass và thứ tự lớp \[Đề xuất\]

Mỗi state xuất: composite, alpha, depth, outline, occlusion, internal-shadow (A25 §7) và thêm emissive.

Composite chứa: albedo palette + vết mòn + AO + cel 2–3 tông dưới Light Rig. Không specular, không bloom, không bóng đổ xuống sàn.

Thứ tự lớp ở runtime: nền phẳng → contact shadow → composite → emissive (blend sáng + blur) → HUD → lớp grade chung → lớp tương tác.

## 5. Wear pass \[Đề xuất\]

- Chỉ nằm trên phần tĩnh (chassis); cùng seed và cùng mặt nạ ở mọi state để chassis khớp từng pixel (APS §6, A25 §10).
- Đặt trong không gian UV/object, không phải không gian màn hình, để bộ phận chuyển động mang vết mòn theo vật.
- Màu là sắc phái sinh từ canonical HEX (A25 §6 cho phép derived shades sinh từ canonical HEX); biên độ phái sinh và độ mờ tối đa: TBD, quyết định bằng test mục 10.
- Không làm đổi silhouette (APS §1 rule 4).
- Crop concept chỉ 494×360 \[Đo\], nên chi tiết xước nhỏ không thể trích từ ảnh; wear phải tạo bằng mặt nạ procedural hoặc decal (APS §5 liệt kê DECALmachine/Stencil cho việc đóng tem và chi tiết).

## 6. Emissive pass \[Đề xuất\]

- Chỉ chứa nguồn phát sáng: dải LED, đầu phun, khung viền HUD, đèn báo; màu lấy từ token palette (Amber, Hazard Orange, Cyan, Nominal Green).
- Composite không có bloom nên không vi phạm điều khoản no bloom; glow là hiệu ứng runtime tách riêng.
- Mỗi state có emissive riêng (idle, working, complete, damaged).
- Cách dựng glow ở lớp React (blend mode, blur) chưa test hiệu năng \[Chưa KC\].

## 7. Grade chung và contact shadow \[Đề xuất\]

- Grade: một bộ token màu ấm/lạnh áp đều lên nền và mọi asset, sinh từ Light Rig; không bake.
- Grade chỉ đổi màu, không relight: bóng trong sprite giữ hướng cố định của rig (xem D6 và L9).
- Contact shadow: sinh ở runtime từ footprint trong manifest (anchor, baseLine, A25 §8); asset vẫn không bake bóng đổ xuống sàn.

Ví dụ trường manifest bổ sung (giá trị minh họa, không phải số đã chốt):

```json
{
  "lookContract": {
    "version": "0.1",
    "lightRig": "v1",
    "passes": ["composite", "emissive", "alpha", "depth", "outline", "occlusion", "internal-shadow"],
    "wear": { "seed": 1234, "space": "object", "staticOnly": true },
    "runtime": { "grade": "cabin-warm-v1", "contactShadow": true, "emissiveBlend": "screen" }
  }
}
```

## 8. Quy tắc đầu vào cho Image-to-3D \[Đề xuất\]

- Concept dùng làm tham chiếu hình học và đích nhìn; không lấy màu albedo từ concept vì màu đó đã chịu ánh sáng cảnh (mục 2). Tripo P1 có tham số bật/tắt texture, mặc định bật \[Web\]; nên tắt rồi gán vật liệu palette trong Blender. Nếu giữ texture, có rủi ro ám màu hai lần (một lần trong albedo, một lần ở grade) — \[Chưa KC\] vì chưa chạy thử.
- Crop sạch: bỏ con trỏ chuột, mặt bàn, thiết bị lân cận và vật foreground che góc. Crop hiện tại có cả bốn lỗi này \[quan sát\], trái với yêu cầu crop riêng từng món (APS §4 Bước 1).
- Độ phân giải: crop 494×360 (tỉ lệ 1,37) so với profile 1000×800 (tỉ lệ 1,25, A25 §5), phải phóng khoảng 2× \[Đo\].
- Tài liệu hãng khuyến nghị face\_limit từ 250 trở lên cho vật phức tạp; mức 5K–15K của APS §4 nằm trong giới hạn 48–20.000 \[Web\].

## 9. Quyết định cần chốt trước khi sửa tài liệu gốc

- D1 — Bộ HEX chuẩn. APS §2 dùng #ECEFF1 / #FF6D00 / #1E293B; checklist APS §7 dùng #F5F2EB / #FF5722 / #2B2D42 \[TL\]. Khác biệt ΔE: 5,2 / 14,7 / 4,8 \[Đo\]. Đề xuất: chọn APS §2 làm chuẩn, sửa APS §7, bù độ ấm bằng grade. Đây chưa phải kết luận bắt buộc.
- D2 — Màu tím trên kính và bàn in: thêm token riêng (kèm quy tắc dùng) hay bỏ để chỉ còn palette. Giá trị đo (#B490A4 bàn in, #9F6474 kính) đã chịu ánh sáng, không dùng làm albedo.
- D3 — Màu HUD khi WORKING: APS §2 và A25 §9 ghi Amber; concept dùng màn cyan với thanh tiến độ xanh (#83F28B, gần Nominal Green, ΔE 19,1 \[Đo\]). Chọn: theo FSM hoặc sửa FSM theo concept.
- D4 — Hình học: A25 §4.1 yêu cầu vát thẳng với fillet nhỏ; APS §1 rule 6 ưu tiên fillet liên tục thay cho vát 45°, nhưng đoạn bổ sung ở APS §3 lại cho phép vát \[TL\]. Concept có vỏ vát góc. Đề xuất lấy A25 §4.1 làm chuẩn và sửa rule 6.
- D5 — Chữ/số trên HUD: A25 §7 cấm bake text runtime; ví dụ ở APS §3 bake 67%. Đề xuất: HUD là lớp runtime; asset chỉ chứa khung và kính.
- D6 — Grade chỉ đổi màu, hay thêm normal pass để relight động. Bản này giả định chỉ đổi màu.
- D7 — Route Blender AI bằng prompt text (APS §3) không nêu công cụ cụ thể; giữ và chỉ định công cụ, hay bỏ.

## 10. Kiểm chứng đề xuất

Các ngưỡng dưới đây là đề xuất, chưa có cơ sở thực nghiệm.

- T1 Số part: sau import có ít nhất 7 object rời (vỏ, khung cửa + kính, gantry, bàn in, đầu in, HUD, tay nắm/chốt) theo APS §1 rule 7. Dự kiến fail với Tripo P1 (xem L3), cần phương án thủ công hoặc procedural.
- T2 Silhouette: IoU giữa mask render ortho 12° và mask concept ≥ 0,90.
- T3 Palette trước grade: ΔE trung vị (nên dùng CIEDE2000) so với palette và sắc phái sinh ≤ ngưỡng TBD.
- T4 State: diff mask chassis giữa hai state = 0 pixel (APS §6).
- T5 Độ gần concept sau grade: ΔE trung vị so với crop, kèm so sánh mù A/B bởi ít nhất 3 người cho glow, vết mòn, màu.
- T6 Hiệu năng: số lớp emissive đồng thời ở FPS mục tiêu trên thiết bị mục tiêu (TBD).
- T7 Các cổng alpha, background, floor, cast shadow như A25 §10, không đổi.

## 11. Hạn chế của pipeline (để phản biện)

- L1 Khoảng cách phong cách. Concept là tranh có gradient và ánh sáng; đích của pipeline là cel 2–3 tông, ink-line đều 2,5px (APS §4), specular 0 và roughness 1,0 (APS §7). Có thể tiệm cận nhưng chưa có bằng chứng sẽ đạt mức chấp nhận; gradient kiểu vẽ tay có thể không tái tạo đúng \[Chưa KC\].
- L2 Image-to-3D từ một ảnh chỉ thấy một mặt; phần khuất do mô hình tự suy. Crop hiện có vật foreground che góc phải dưới nên góc đó sẽ bị suy đoán \[quan sát\]. Việc kính trong suốt cùng nội thất có bị gộp thành một bề mặt hay không là \[Chưa KC\] — cần chạy thử.
- L3 Tripo P1 (Smart Mesh): nhận ảnh, face 48–20.000, nhưng tài liệu hãng ghi không hỗ trợ generate\_parts, quad, smart\_low\_poly, geometry\_quality \[Web\]. Xung đột với yêu cầu part rời (APS §1 rule 7, A25 §3). Endpoint segmentation của Tripo được một bài báo ngành nhắc tới \[Web\] nhưng chưa kiểm chứng trên asset này; Meshy chưa tra.
- L4 State ngoài ảnh. Concept chỉ cho state WORKING. Idle, complete, damaged và chassis dùng chung phải dựng ngoài bước AI; A25 §11 ghi hiện mới có idle/working bằng script procedural, chưa có manifest, validator hay test cabin.
- L5 Khóa phiên bản. Lightning Boy Shader 2.1.4 chạy với Blender 3.4, không tương thích 3.5 trở lên và không có bản vá cho 4.0 \[Web\]; A25 §11 chưa pin phiên bản Blender. Khả năng chạy chung của plugin Tripo, Grease Pencil Line Art, DECALmachine trên Blender 3.4: \[Chưa KC\]. Tên Tripo3D Blender Bridge và Meshy 3D Agent: \[Chưa KC\] (một bài báo ngành có nhắc plugin Tripo cho Blender \[Web\]).
- L6 Tỉ lệ thành công trong APS §5 (>85%, 98%, 95%, 90%) không có log test, cỡ mẫu hay định nghĩa thành công; tôi không tìm thấy nguồn công khai. Không dùng làm bằng chứng. Chỉ có một bài test độc lập trên asset nhân vật báo mesh dùng được không cần retopo và texture giữ chi tiết \[Web\]; bài đó không đo độ tương đương với concept art.
- L7 Mâu thuẫn trong tài liệu gốc: hai bộ HEX (D1), quy tắc hình học (D4), bake HUD (D5), màu WORKING (D3). Chừng nào chưa chốt, validator không viết được.
- L8 Độ phân giải nguồn: chi tiết nhỏ (xước, nứt, chữ trên tem) không thể phục hồi từ crop 494×360; phải tạo mới (mục 5).
- L9 Grade chỉ đổi màu không phải relight: bóng trong sprite cố định theo Light Rig; vật di chuyển hoặc đổi nguồn sáng trong cảnh sẽ không phản ứng đúng. Chấp nhận được nếu mọi cảnh dùng một rig; nếu không, cần normal pass (D6) \[Đề xuất\].
- L10 Lệ thuộc runtime: ngoại hình cuối phụ thuộc grade và blend ở React/CSS; tính nhất quán giữa trình duyệt và thiết bị chưa kiểm chứng \[Chưa KC\].
- L11 Giới hạn của chính phân tích này: ΔE CIE76, ô lấy mẫu đặt tay, ảnh nén; không tách được màu vật liệu khỏi ánh sáng; chưa đo hướng sáng; chưa chạy thử công cụ nào trên asset này.
- L12 Route Blender AI bằng prompt text chưa được đánh giá (D7).

## 12. Câu hỏi mở cho agent phản biện

1. Có cách nào giữ emissive đủ gần concept mà không cần lớp glow runtime và vẫn không bloom trong composite?
2. Ở mức nào thì grade chỉ-đổi-màu làm sprite trông phẳng so với concept? Test nào đo được điều đó?
3. Nếu P1 không sinh part rời, chi phí tách thủ công 20+ asset so với dựng procedural toàn bộ là bao nhiêu? Khi đó AI chỉ còn dùng cho phần nào?
4. Có nên thay ink-line đều bằng outline độ dày biến thiên để gần concept hơn không, và điều đó có phá quy tắc pixel-perfect giữa các state không?
5. Tranh cockpit master có thực sự dùng một hướng sáng thống nhất không? Cần kiểm chứng trước khi khóa Light Rig.
6. Nếu mục tiêu là màu sau grade khớp concept nhất, nên chọn D1 theo hướng nào?
7. Điều khoản nào trong addendum này tự mâu thuẫn với APS hoặc A25 mà chưa được liệt kê ở D1–D7?

## 13. Nguồn (tra cứu 12/11/2026)

- Tripo P1 (Smart Mesh): https://developers.tripo3d.com/en/models/p1 — giới hạn face, đầu vào, tham số texture, tính năng không hỗ trợ.
- Lightning Boy Shader 2.1: https://lightningboystudio.gumroad.com/l/aYbiH — tương thích Blender.
- Bài test Smart Mesh độc lập (một người dùng, asset nhân vật): https://levelup.gitconnected.com/tripo-ais-new-smart-mesh-feature-60-faster-33-cheaper-c9278f0579f3
- Bài báo ngành về hệ sinh thái Tripo (plugin DCC, endpoint, khuyến cáo kiểm tra sau import): https://www.jonpeddie.com/news/tripo-ai-aims-to-revolutionize-the-3d-content-creation-landscape/
