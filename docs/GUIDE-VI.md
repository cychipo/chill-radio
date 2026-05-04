# Hướng dẫn sử dụng

## Trình phát TikTok tương tác

```bash
chill-radio start
```

Dùng mode này khi muốn có màn hình phát nhạc trong terminal. Dán TikTok video, profile/kênh, hoặc playlist/collection URL khi được hỏi.

Phím điều khiển:

- Space: pause/resume.
- `n` hoặc mũi tên phải: bài tiếp theo.
- `p` hoặc mũi tên trái: bài trước hoặc phát lại bài hiện tại.
- `q` hoặc Ctrl+C: dừng và thoát.

Màn hình hiển thị tên bài, uploader, vị trí queue, thời gian đã nghe, thời gian còn lại, tổng thời lượng và progress bar.

## Phát audio TikTok một lần

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
- Progress và điều khiển phím đã có trong `chill-radio start`; `play` vẫn là lệnh chạy một lần.
- Chưa có luồng cookies/authenticated TikTok.
- Profile/playlist TikTok phụ thuộc vào dữ liệu `yt-dlp` trả về.

## Xử lý lỗi

- `Please provide a valid TikTok URL.`: truyền TikTok URL đầy đủ bắt đầu bằng `http://` hoặc `https://`.
- `TikTok is currently the only supported platform.`: YouTube/SoundCloud chưa được bật.
- `No playable TikTok videos found.`: profile/playlist không trả về item phát được.
- `Could not extract TikTok audio stream`: cập nhật dependency hoặc thử TikTok URL public khác.
- `Could not start mpv`: cài `mpv` hoặc đặt binary tương thích trong `vendor/bin/mpv`.
