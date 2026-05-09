# Hướng dẫn sử dụng

## Trình phát terminal tương tác

```bash
chill-radio start
```

Dùng mode này khi muốn có màn hình phát nhạc trong terminal. Dán TikTok hoặc YouTube URL được hỗ trợ khi được hỏi.

Input đang hỗ trợ:

- TikTok video, profile/kênh, hoặc playlist/collection URL.
- YouTube video URL.
- YouTube playlist URL.
- YouTube livestream URL.

Phím điều khiển:

- Space: pause/resume.
- `n` hoặc mũi tên phải: bài tiếp theo.
- `p` hoặc mũi tên trái: bài trước hoặc phát lại bài hiện tại.
- `q` hoặc Ctrl+C: dừng và thoát.

Màn hình hiển thị tên bài, uploader, vị trí queue, thời gian đã nghe, thời gian còn lại, tổng thời lượng nếu có và progress bar. Livestream có thể chỉ hiển thị thời gian đã nghe vì không có tổng thời lượng cố định.

## Phát audio một lần

```bash
chill-radio play <url>
```

Ví dụ:

```bash
chill-radio play "https://www.tiktok.com/@creator/video/123"
chill-radio play "https://www.tiktok.com/@creator"
chill-radio play "https://www.tiktok.com/@creator/playlist/name-123"
chill-radio play "https://www.youtube.com/watch?v=abc123"
chill-radio play "https://www.youtube.com/playlist?list=PL123"
chill-radio play "https://www.youtube.com/live/abc123"
```

Lệnh sẽ trích xuất luồng audio nhẹ, in tên bài/uploader/thời lượng nếu có, rồi phát bằng `mpv`. YouTube `watch` URL có tham số `list` sẽ được xem như playlist.

## Giới hạn hiện tại

- SoundCloud là phase sau.
- Chưa có search trong terminal.
- Chưa có luồng cookies/auth cho nội dung private, age-restricted, trả phí, member-only, hoặc bị giới hạn vùng.
- Playlist/profile phụ thuộc vào dữ liệu `yt-dlp` trả về.
- Progress và điều khiển phím có trong `chill-radio start`; `play` vẫn là lệnh chạy một lần.

## Xử lý lỗi

- `Please provide a valid media URL.`: truyền URL đầy đủ bắt đầu bằng `http://` hoặc `https://`.
- `Supported platforms: TikTok and YouTube.`: nền tảng URL chưa được hỗ trợ.
- `No playable media found.`: queue rỗng.
- `No playable YouTube videos found.`: playlist không trả về item phát được.
- `Could not extract YouTube audio stream`: cập nhật dependency hoặc thử YouTube URL public khác.
- `Could not start mpv`: cài `mpv` hoặc đặt binary tương thích trong `vendor/bin/mpv`.
