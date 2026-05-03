# chill-radio

`chill-radio` là CLI phát nhạc ngay trong terminal dành cho lập trình viên. Mục tiêu là cho phép nghe nhạc từ YouTube, SoundCloud, TikTok và các nguồn được `yt-dlp` hỗ trợ mà không cần mở trình duyệt, không tốn nhiều RAM/CPU, và hướng tới trải nghiệm “cài là chạy”.

## Mục tiêu sản phẩm

- Cài qua NPM và chạy được ngay, không bắt người dùng tự cấu hình phức tạp.
- Phát âm thanh từ URL media bằng luồng nhẹ nhất có thể.
- Dùng trình phát nền `mpv` để tiết kiệm tài nguyên hơn trình duyệt.
- Hiển thị thông tin bài đang phát trực quan trong terminal.
- Báo lỗi rõ ràng khi URL không hợp lệ, nội dung bị chặn, hoặc không phát được.

## Trạng thái hiện tại

Dự án đang ở giai đoạn setup codebase. Plan triển khai ban đầu nằm tại:

```text
plans/260503-1450-setup-chill-radio-codebase/plan.md
```

Các tính năng như playlist, thanh tiến trình và điều khiển bằng phím sẽ được triển khai sau khi MVP phát một track hoạt động ổn định.

## Tính năng dự kiến

### MVP

```bash
chill-radio play <url>
```

Luồng xử lý dự kiến:

1. Nhận URL từ terminal.
2. Dùng `yt-dlp` để lấy metadata và audio stream.
3. Hiển thị tên bài, kênh/uploader, thời lượng nếu có.
4. Phát audio bằng `mpv` chạy nền.
5. Trả lỗi dễ hiểu thay vì crash với stack trace thô.

### Sau MVP

- Phát playlist/kênh và tự chuyển bài.
- Thanh tiến trình dạng `[=====>----] 1:20 / 3:45`.
- Phím tắt trong terminal: pause/resume, tua tới/lùi.
- Post-install tự tải binary phù hợp cho macOS, Linux, Windows.

## Ngăn xếp công nghệ dự kiến

- Node.js 18+
- TypeScript
- `commander` cho CLI
- `chalk`, `ora`, `cli-progress` cho UI terminal
- `youtube-dl-exec` / `yt-dlp` để trích xuất media
- `mpv` để phát âm thanh
- `child_process.spawn` để chạy tiến trình phát nhạc an toàn

## Cấu trúc dự kiến

```text
src/
├── cli.ts
├── commands/
│   └── play.ts
├── services/
│   ├── media-extractor.ts
│   └── audio-player.ts
├── platform/
│   ├── binary-paths.ts
│   └── platform-info.ts
├── ui/
│   ├── errors.ts
│   └── now-playing.ts
└── types/
    └── media.ts
```

## Cài đặt và phát triển

```bash
npm install
npm run typecheck
npm run build
npm test
npm run dev -- play <url>
```

Runtime hiện tìm `mpv` trong `vendor/bin` trước, sau đó fallback sang `mpv` trên `PATH`. Luồng tự tải `mpv` portable vẫn đang chờ xác minh nguồn phát hành và checksum trước khi publish.

## Tài liệu liên quan

- `user_stories.md`: yêu cầu tính năng chính.
- `plans/260503-1450-setup-chill-radio-codebase/plan.md`: plan setup codebase.
- `docs/`: tài liệu cài đặt, phát triển, hướng dẫn sử dụng và kiến trúc sau khi được tạo.

## Lưu ý bảo mật

- URL và metadata từ nền tảng bên ngoài được xem là input không tin cậy.
- Không chạy input người dùng qua shell string.
- Không commit binary tải về, token, API key, hoặc file môi trường nhạy cảm.

## License

Chưa xác định.
