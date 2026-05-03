# Hướng dẫn sử dụng

## Phát một track

```bash
chill-radio play <url>
```

URL có thể là một media đơn lẻ được `yt-dlp` hỗ trợ, ví dụ YouTube, SoundCloud hoặc TikTok. Lệnh sẽ trích xuất luồng audio nhẹ, in tên bài/uploader/thời lượng nếu có, rồi phát bằng `mpv`.

## Giới hạn hiện tại

- Chỉ phát một track.
- Chưa có playlist queue.
- Chưa có thanh tiến trình hoặc điều khiển bằng phím.
- Một số nền tảng có thể cần đăng nhập, cookies, hoặc chặn trích xuất; các luồng này nằm ngoài MVP.

## Xử lý lỗi

- `Please provide a valid media URL.`: truyền URL đầy đủ bắt đầu bằng `http://` hoặc `https://`.
- `Could not extract audio stream`: cập nhật dependency hoặc thử URL khác được hỗ trợ.
- `Could not start mpv`: cài `mpv` hoặc đặt binary tương thích trong `vendor/bin/mpv`.
