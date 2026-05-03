# Hướng dẫn sử dụng

## Phát audio TikTok

```bash
chill-radio play <tiktok-url>
```

Input MVP đang hỗ trợ:

- TikTok video URL: phát một video.
- TikTok profile/kênh URL: trích xuất các video trả về và phát tuần tự.
- TikTok playlist/collection URL: trích xuất các video trả về và phát tuần tự khi `yt-dlp` hỗ trợ URL đó.

Ví dụ:

```bash
chill-radio play "https://www.tiktok.com/@creator/video/123"
chill-radio play "https://www.tiktok.com/@creator"
chill-radio play "https://www.tiktok.com/@creator/playlist/name-123"
```

Lệnh sẽ trích xuất luồng audio nhẹ, in tên bài/uploader/thời lượng nếu có, rồi phát bằng `mpv`.

## Giới hạn hiện tại

- Chỉ hỗ trợ TikTok; YouTube và SoundCloud là phase sau.
- Chưa có thanh tiến trình hoặc điều khiển bằng phím.
- Chưa có luồng cookies/authenticated TikTok.
- Profile/playlist TikTok phụ thuộc vào dữ liệu `yt-dlp` trả về.

## Xử lý lỗi

- `Please provide a valid TikTok URL.`: truyền TikTok URL đầy đủ bắt đầu bằng `http://` hoặc `https://`.
- `TikTok is currently the only supported platform.`: YouTube/SoundCloud chưa được bật.
- `No playable TikTok videos found.`: profile/playlist không trả về item phát được.
- `Could not extract TikTok audio stream`: cập nhật dependency hoặc thử TikTok URL public khác.
- `Could not start mpv`: cài `mpv` hoặc đặt binary tương thích trong `vendor/bin/mpv`.
