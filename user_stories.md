# 🎵 Dự Án: chill-radio - Trạm Phát Thanh Terminal Của Lập Trình Viên

> Một gói NPM (NPM package) cho phép phát nhạc trực tiếp từ YouTube, SoundCloud, TikTok ngay trên Terminal với trải nghiệm "Cài là chạy" (Zero-Config), sử dụng cực kỳ ít RAM/CPU và không yêu cầu cài đặt thêm phần mềm bên ngoài.

## 🛠 Ngăn Xếp Công Nghệ (Tech Stack) & Thư Viện Đề Xuất

**1. Lõi Hệ Thống (Core & CLI)**
*   **Môi trường:** Node.js.
*   **CLI Framework:** `commander` (Xử lý cú pháp lệnh đầu vào, ví dụ: `chill-radio play <url>`).
*   **Giao diện dòng lệnh (UI/UX):** 
    *   `chalk`: Tô màu văn bản trên Terminal.
    *   `ora`: Tạo hiệu ứng xoay (spinner) mượt mà khi đang tải/đệm nhạc (buffering).
    *   `cli-progress`: Vẽ thanh tiến trình (progress bar) hiển thị thời lượng bài hát.

**2. Xử Lý Luồng Âm Thanh (Stream & Playback)**
*   **Trích xuất Link (The Scraper):** `youtube-dl-exec` (Công cụ bọc `yt-dlp`, dùng để lấy luồng audio trực tiếp từ hàng trăm nền tảng mà không bị chặn).
*   **Trình phát nhạc (The Player):** `mpv` (Sử dụng tệp nhị phân thực thi độc lập - Portable binary).
*   **Giao tiếp Hệ điều hành:** Sử dụng module `child_process` của Node.js để gọi trình phát nhạc chạy ngầm.

**3. Tiện Ích Cài Đặt (Post-Install Setup)**
*   `axios`: Dùng để tải tệp nhị phân của trình phát nhạc về máy ngay lúc người dùng cài đặt package.
*   `unzipper` / `tar`: Dùng để giải nén tệp nhị phân vừa tải.

---

## 📋 Danh Sách Yêu Cầu Tính Năng (User Stories)

### Epic 1: Cài đặt Không-Cấu-Hình (Zero-Config Setup)
*Mục tiêu: Người dùng không cần thao tác gì thêm, chỉ cần cài qua NPM là có thể nghe nhạc ngay lập tức.*

*   **Tính năng 1.1: Tự động nạp Trình phát nhạc ngầm (Post-install Script)**
    *   **Là một** người dùng, **tôi muốn** khi gõ `npm i -g chill-radio`, hệ thống sẽ tự động nhận diện hệ điều hành (Win/Mac/Linux) và tải ngầm tệp `mpv` tương ứng vào thư mục hệ thống, **để** tôi không phải tự đi cài đặt các phần mềm phức tạp.
*   **Tính năng 1.2: Cập nhật thư viện lõi tự động**
    *   **Là một** nhà phát triển dự án, **tôi muốn** hệ thống tự động tải phiên bản `yt-dlp` mới nhất khi cài đặt, **để** đảm bảo ứng dụng không bị lỗi mỗi khi YouTube hay TikTok thay đổi thuật toán.

### Epic 2: Phân tích Đường Dẫn & Xử lý Âm thanh (Core Logic)
*Mục tiêu: Đọc hiểu các loại đường dẫn khác nhau và bắt đầu phát nhạc ổn định.*

*   **Tính năng 2.1: Phát nhạc từ một Video đơn lẻ**
    *   **Là một** người dùng, **tôi muốn** gõ lệnh (ví dụ: `chill-radio play <link-tiktok>`), ứng dụng sẽ trích xuất ngay luồng âm thanh nhẹ nhất và phát ra loa, **để** tôi vừa lập trình vừa nghe nhạc mà không tốn RAM mở trình duyệt web.
*   **Tính năng 2.2: Xử lý Danh sách phát (Playlist) / Kênh**
    *   **Là một** người dùng, **tôi muốn** dán một đường dẫn Playlist YouTube hoặc trang cá nhân SoundCloud, ứng dụng sẽ quét và tự động chuyển bài khi kết thúc, **để** tôi có thể nghe liên tục hàng giờ liền.
*   **Tính năng 2.3: Bắt lỗi & Báo cáo thông minh**
    *   **Là một** người dùng, **tôi muốn** nhận được thông báo văn bản màu đỏ rõ ràng (ví dụ: "Video bị giới hạn quốc gia" hoặc "Đường dẫn không hợp lệ") thay vì ứng dụng bị sập (crash) đột ngột, **để** tôi biết mình cần xử lý thế nào tiếp theo.

### Epic 3: Giao diện Dòng lệnh & Tương tác (CLI UI/UX)
*Mục tiêu: Mang lại giao diện đẹp mắt và khả năng điều khiển mượt mà ngay trong Terminal.*

*   **Tính năng 3.1: Bảng điều khiển Hiện tại (Now Playing)**
    *   **Là một** người dùng, **tôi muốn** nhìn thấy Tên bài hát, Tên kênh, và tổng thời lượng bài hát được in ra với màu sắc nổi bật khi nhạc bắt đầu phát, **để** tôi biết chính xác mình đang nghe gì.
*   **Tính năng 3.2: Thanh trạng thái & Thời gian (Progress Bar)**
    *   **Là một** người dùng, **tôi muốn** thấy một thanh tiến trình cập nhật liên tục trên terminal (ví dụ: `[=====>----] 1:20 / 3:45`), **để** cảm nhận được ứng dụng đang hoạt động và theo dõi thời gian bài hát.
*   **Tính năng 3.3: Điều khiển phát nhạc cơ bản**
    *   **Là một** người dùng, **tôi muốn** dùng các phím mũi tên `->` hoặc `<-` để tua nhạc, và phím `Khoảng trắng` (Space) để Tạm dừng/Phát tiếp (Pause/Resume) trực tiếp trên cửa sổ terminal, **để** không phải chuyển cửa sổ và dùng chuột.