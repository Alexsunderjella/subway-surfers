# 🏃 Subway Surfers 3D - Web Edition (HTML5 & Three.js)

Một phiên bản game **Subway Surfers** 3D hoàn chỉnh được xây dựng thuần bằng **HTML5, CSS3, JavaScript** và thư viện đồ họa **Three.js**. Trò chơi sẵn sàng để triển khai trực tiếp lên **GitHub Pages** để chơi trực tuyến trên mọi thiết bị (máy tính, điện thoại, máy tính bảng).

---

## 🎮 Tính Năng Nổi Bật

- **Đồ họa 3D Three.js mượt mà:** Khung cảnh đường ray tàu điện ngầm chân thực gồm 3 làn chạy, thanh tà vẹt gỗ, ray kim loại, tường gạch phong cách graffiti, cầu vượt và các tòa nhà chọc trời rực rỡ sắc màu.
- **Hệ thống nhân vật sinh động:** Nhân vật 3D phong cách Jake (đội mũ lưỡi trai ngược, áo hoodie, giày sneaker) với đầy đủ chuyển động bước chạy, nhảy cao, lộn nhào trượt đất và bay phản lực.
- **Vật cản đa dạng:**
  - 🚧 **Rào chắn thấp (Low Barrier):** Yêu cầu nhảy vọt qua.
  - ⚠️ **Rào chắn trên cao (High Barrier):** Yêu cầu cúi người trượt lướt qua dưới.
  - 🚆 **Đoàn tàu điện ngầm (Subway Trains):** Tàu cố định hoặc tàu đang chạy ngược chiều. Đặc biệt có những toa tàu gắn **cầu dốc (Ramp)** cho phép người chơi chạy thẳng lên nóc tàu và nhảy giữa các nóc tàu!
- **4 Vật phẩm đặc biệt (Power-ups):**
  - 🧲 **Nam Châm Hút Tiền (Coin Magnet):** Tự động hút tất cả đồng xu xung quanh trong 11 giây.
  - 👟 **Giày Bật Nhảy (Super Sneakers):** Nhảy siêu cao vượt qua cả đoàn tàu trong 13 giây.
  - 🚀 **Tên Lửa Phản Lực (Jetpack):** Phóng vút lên bầu trời an toàn, bay qua các dải tiền vàng trên cao với hiệu ứng khói lửa trong 8.5 giây.
  - ⭐ **Nhân Đôi Điểm (2x Multiplier):** Nhân gấp đôi tốc độ tích lũy điểm số trong 14 giây.
- **Hệ thống âm thanh tự tổng hợp (Web Audio API):**
  - Nhạc nền (BGM) phong cách Funky Arcade 8-bit / Synthwave bắt tai chạy liên tục.
  - Hiệu ứng âm thanh chân thực: tiếng bước nhảy, lướt trượt, chuyển làn, chuông lượm xu với thang âm ngũ cung biến hóa, âm va chạm nổ tung và tiếng động cơ phản lực.
  - Nút bật/tắt âm thanh (Mute) tiện lợi, lưu trạng thái.
- **Lưu kỷ lục (High Score):** Tự động lưu điểm kỷ lục cao nhất vào `localStorage` của trình duyệt.
- **Tương thích mọi thiết bị:** Hỗ trợ đầy đủ phím mũi tên / WASD trên bàn phím máy tính và thao tác vuốt (swipe) mượt mà trên màn hình cảm ứng điện thoại / iPad.

---

## 🕹️ Hướng Dẫn Điều Khiển

| Thao tác | Phím máy tính | Cảm ứng điện thoại / Tablet |
| :--- | :--- | :--- |
| **Chuyển làn sang trái** | Phím `A` hoặc `◀` | Vuốt sang **Trái** |
| **Chuyển làn sang phải** | Phím `D` hoặc `▶` | Vuốt sang **Phải** |
| **Nhảy lên** | Phím `W`, `▲` hoặc `Space` | Vuốt lên **Trên** |
| **Trượt cúi người / Rơi nhanh** | Phím `S` hoặc `▼` | Vuốt xuống **Dưới** |
| **Tạm dừng / Tiếp tục** | Phím `P` hoặc `Esc` | Nút `⏸` góc trên bên phải |

---

## 🚀 Cách Chạy Trò Chơi Trên Máy Tính (Local)

1. **Cách đơn giản nhất:** 
   - Nhấp đúp chuột trực tiếp vào file [`index.html`](index.html) để mở bằng bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Brave, Safari).
2. **Sử dụng Live Server / Web Server:**
   - Nếu bạn dùng Visual Studio Code: Cài extension **Live Server** -> Chuột phải vào `index.html` -> Chọn **Open with Live Server**.
   - Hoặc mở terminal trong thư mục game và gõ:
     ```bash
     python -m http.server 8000
     ```
     Sau đó truy cập `http://localhost:8000`.

---

## 🌐 Hướng Dẫn Đưa Lên GitHub & Bật GitHub Pages (Chơi Online)

Bạn có thể đưa toàn bộ thư mục này lên GitHub và bật **GitHub Pages** để có một đường link web miễn phí chia sẻ cho bạn bè cùng chơi.

### Cách 1: Tải trực tiếp trên giao diện web GitHub (Không cần cài Git)

1. Truy cập [github.com](https://github.com) và đăng nhập tài khoản của bạn.
2. Bấm vào dấu `+` ở góc trên bên phải -> Chọn **New repository**.
3. Đặt tên repository (ví dụ: `subway-surfers-3d`), chọn chế độ **Public**, sau đó bấm **Create repository**.
4. Ở trang hiển thị repository mới, bấm vào dòng chữ **"uploading an existing file"**.
5. Kéo toàn bộ các file và thư mục (`index.html`, `style.css`, `README.md`, `.gitignore`, và thư mục `js/`) vào khung tải lên của GitHub.
6. Bấm nút **Commit changes** màu xanh ở phía dưới.

### Cách 2: Sử dụng Git CLI / Terminal (Nếu đã cài Git)

Mở terminal tại thư mục này và chạy các lệnh sau:

```bash
# 1. Khởi tạo repository git
git init

# 2. Thêm tất cả các file vào staging
git add .

# 3. Tạo commit đầu tiên
git commit -m "feat: complete Subway Surfers 3D HTML5 game"

# 4. Đổi nhánh chính thành main
git branch -M main

# 5. Liên kết tới repository GitHub của bạn (thay username và reponame của bạn vào)
git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repository>.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```

---

### ⚡ Bật GitHub Pages Để Nhận Link Chơi Trực Tuyến

Sau khi đã tải code lên GitHub:
1. Vào repository của bạn trên GitHub -> Bấm vào tab **Settings** (ở thanh menu phía trên).
2. Ở thanh điều hướng bên trái, bấm chọn mục **Pages**.
3. Trong phần **Build and deployment**:
   - **Source**: Chọn `Deploy from a branch`.
   - **Branch**: Chọn nhánh `main` (hoặc `master`), thư mục giữ nguyên `/ (root)`.
4. Bấm nút **Save**.
5. Đợi khoảng 1 - 2 phút, GitHub sẽ tạo link trang web có dạng:
   `https://<ten-tai-khoan>.github.io/<ten-repository>/`
6. Bạn có thể mở link này trên bất kỳ máy tính hay điện thoại thông minh nào để chơi ngay!

---

## 📁 Cấu Trúc Mã Nguồn

```text
game/
├── index.html           # Khung HTML5, giao diện HUD, màn hình Menu & Game Over
├── style.css            # Toàn bộ CSS phong cách arcade hiện đại, responsive
├── README.md            # Tài liệu giới thiệu và hướng dẫn triển khai
├── .gitignore           # Bỏ qua các file rác của hệ điều hành
└── js/
    ├── constants.js     # Hằng số trò chơi (tốc độ, trọng lực, màu sắc, thời lượng power-up)
    ├── audio.js         # Bộ tổng hợp âm thanh Web Audio API (BGM & SFX tự phát)
    ├── world.js         # Khởi tạo thế giới 3D, đường ray, ánh sáng, tòa nhà thành phố
    ├── player.js        # Mô hình 3D nhân vật, hoạt ảnh chạy, nhảy, trượt, va chạm
    ├── obstacles.js     # Tạo vật cản, tàu hỏa, dốc trèo nóc tàu, tiền vàng, power-up
    └── game.js          # Vòng lặp game loop, điều khiển bàn phím/cảm ứng, tính điểm
```

---

## 🏆 Giấy Phép & Bản Quyền

Dự án được xây dựng phục vụ mục đích học tập, giải trí và nghiên cứu công nghệ đồ họa web 3D Three.js. Mã nguồn hoàn toàn mở và miễn phí sử dụng.

