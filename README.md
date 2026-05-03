# chill-radio

`chill-radio` là CLI phát nhạc ngay trong terminal dành cho lập trình viên. MVP hiện bắt đầu với TikTok: phát link video, link kênh/user profile, và link playlist/collection khi `yt-dlp` hỗ trợ. Mục tiêu dài hạn là mở rộng sang YouTube, SoundCloud và các nguồn được `yt-dlp` hỗ trợ mà không cần mở trình duyệt, không tốn nhiều RAM/CPU, và hướng tới trải nghiệm “cài là chạy”.

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
chill-radio play <tiktok-url>
```

Luồng xử lý hiện tại:

1. Nhận TikTok URL từ terminal.
2. Phân loại URL thành video, profile/kênh, hoặc playlist/collection.
3. Dùng `yt-dlp` để lấy metadata và audio stream.
4. Với video URL: phát một video.
5. Với profile/kênh hoặc playlist/collection: phát tuần tự các video trích xuất được.
6. Hiển thị tên bài, kênh/uploader, thời lượng nếu có trước mỗi video.
7. Phát audio bằng `mpv` chạy nền.
8. Trả lỗi dễ hiểu thay vì crash với stack trace thô.

### Sau MVP

- Mở rộng sang YouTube và SoundCloud.
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

### 1. Cài dependency

```bash
npm install
```

`postinstall` hiện tải native `yt-dlp` binary vào `vendor/bin/yt-dlp/<platform-arch>/` để tránh phụ thuộc Python hệ thống quá cũ. Trên macOS, `postinstall` cũng tải bundled `mpv` vào `vendor/bin/mpv/<platform-arch>/`. Runtime sẽ tìm `mpv` trong `vendor/bin` trước, sau đó fallback sang `mpv` trên `PATH`.

### 2. Chạy kiểm tra code

```bash
npm run typecheck
npm run build
npm test
```

Ý nghĩa:

- `npm run typecheck`: kiểm tra TypeScript không emit file.
- `npm run build`: build source sang `dist/`.
- `npm test`: chạy unit test deterministic, không phụ thuộc live YouTube/TikTok/SoundCloud.

### 3. Chạy CLI ở chế độ dev

Dùng `tsx` để chạy trực tiếp source TypeScript:

```bash
npm run dev -- --help
npm run dev -- play <tiktok-url>
```

Ví dụ test lỗi input nhanh:

```bash
npm run dev -- play not-a-url
```

Kỳ vọng: CLI trả lỗi dễ hiểu và exit non-zero, không in stack trace thô.

### 4. Test playback thật trước khi publish

Để test phát nhạc thật trên máy dev:

1. Chạy `npm install` hoặc `node scripts/postinstall.js` để chuẩn bị native `yt-dlp` và bundled `mpv` trên macOS.
2. Chọn một TikTok URL public mà `yt-dlp` hỗ trợ.
3. Chạy một hoặc nhiều lệnh tùy loại URL:

```bash
npm run dev -- play "https://www.tiktok.com/@creator/video/123"
npm run dev -- play "https://www.tiktok.com/@creator"
npm run dev -- play "https://www.tiktok.com/@creator/playlist/name-123"
```

Kỳ vọng:

- CLI in thông tin bài đang phát trước mỗi video.
- `yt-dlp` lấy được audio stream.
- Video URL phát một item.
- Profile/kênh hoặc playlist/collection phát tuần tự các item trích xuất được.
- `mpv` bắt đầu phát audio.
- Khi URL bị chặn/không hỗ trợ hoặc queue rỗng, CLI báo lỗi ngắn gọn.

Không dùng live URL trong unit test mặc định vì TikTok thay đổi thường xuyên, có thể cần cookies/auth, hoặc bị giới hạn vùng.

### 5. Smoke test bản build

Sau khi `npm run build`, có thể chạy CLI build bằng Node:

```bash
node dist/src/cli.js --help
node dist/src/cli.js play <tiktok-url>
```

Nếu dùng npm package local để giả lập cài đặt global:

```bash
npm pack
npm install -g ./chill-radio-0.1.0.tgz
chill-radio --help
chill-radio play <tiktok-url>
```

### 6. Checklist trước khi đẩy product

- `npm install` chạy thành công trên môi trường sạch.
- `npm run typecheck` pass.
- `npm run build` pass.
- `npm test` pass.
- `npm run dev -- --help` hiển thị đúng command.
- `npm run dev -- play not-a-url` trả lỗi dễ hiểu.
- Test thủ công ít nhất một URL public phát được với `mpv`.
- Không commit `node_modules`, `dist`, `vendor/bin`, token, API key, hoặc file `.env`.
- Kiểm tra lại `npm audit`; không dùng `npm audit fix --force` nếu chưa đánh giá breaking changes.

Luồng tự tải `mpv` portable vẫn đang chờ xác minh nguồn phát hành, license, archive layout và checksum trước khi publish.

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
