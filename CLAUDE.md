# CLAUDE.md

Tài liệu này hướng dẫn Claude Code khi làm việc trong repository `chill-radio`.

## Tổng quan dự án

`chill-radio` là một gói NPM/CLI giúp lập trình viên phát nhạc trực tiếp trong terminal từ các nguồn như YouTube, SoundCloud, TikTok bằng cách trích xuất luồng âm thanh và phát qua trình phát nền. Mục tiêu sản phẩm là trải nghiệm “cài là chạy”, ít tốn RAM/CPU, không cần người dùng tự cấu hình phần mềm ngoài.

## Vai trò khi làm việc trong repo

- Phân tích yêu cầu từ `user_stories.md` trước khi thiết kế tính năng.
- Ưu tiên triển khai code thật, không mô phỏng tính năng chính.
- Giữ kiến trúc đơn giản, dễ kiểm thử, bám YAGNI/KISS/DRY.
- Tách rõ CLI, xử lý media, phát nhạc, cài binary, và UI terminal.
- Cập nhật tài liệu trong `docs/` khi hành vi người dùng hoặc kiến trúc thay đổi.

## Workflow bắt buộc

- Primary workflow: `./.claude/rules/primary-workflow.md`
- Development rules: `./.claude/rules/development-rules.md`
- Orchestration protocols: `./.claude/rules/orchestration-protocol.md`
- Documentation management: `./.claude/rules/documentation-management.md`
- Các rule khác: `./.claude/rules/*`

**Quan trọng:** Trước khi lập plan hoặc implement, luôn đọc `README.md` để nắm trạng thái hiện tại của dự án.

## Ngăn xếp dự kiến

- Runtime: Node.js 18+
- Ngôn ngữ: TypeScript
- CLI: `commander`
- UI terminal: `chalk`, `ora`, `cli-progress`
- Trích xuất media: `youtube-dl-exec` / `yt-dlp`
- Phát âm thanh: `mpv` chạy nền qua `child_process.spawn`
- Test: ưu tiên test runner đơn giản như Vitest khi scaffold được tạo

## Nguyên tắc triển khai

- Không dùng shell string để chạy URL hoặc input người dùng; dùng argument array với `spawn`.
- Không commit binary tải về, cache build, `node_modules`, token, API key, hoặc file môi trường nhạy cảm.
- Nếu code file vượt khoảng 200 dòng, cân nhắc tách module theo trách nhiệm.
- File JS/TS/Python/Shell dùng kebab-case và tên mô tả rõ mục đích.
- Không claim feature đã hoàn thành nếu mới là placeholder.
- Playlist, progress bar, phím tắt điều khiển phát nhạc là các phase sau; MVP trước tiên là `chill-radio play <url>` phát được một track.

## Quy tắc chất lượng code và hiệu năng

- Luôn ưu tiên code dễ đọc, ít nhánh rẽ, ít trạng thái ẩn, tên biến/hàm rõ nghĩa.
- Trước khi implement logic xử lý dữ liệu, cân nhắc độ phức tạp Big-O và chọn cấu trúc dữ liệu phù hợp.
- Ưu tiên thuật toán `O(1)` hoặc `O(log n)` khi thực tế phù hợp; chỉ dùng `O(n)` khi cần duyệt tuyến tính rõ ràng và dữ liệu không lớn.
- Tránh `O(n²)` hoặc vòng lặp lồng nhau trên dữ liệu có thể tăng theo input; nếu bắt buộc, ghi rõ lý do trong code review/plan.
- Dùng `Map`, `Set`, index lookup, hoặc precomputed lookup table khi cần tra cứu nhiều lần.
- Không tạo N+1 query hoặc N+1 external call; batch, preload, hoặc gom request khi làm việc với database/API.
- Tránh cache trong memory nếu không thật sự cần; nếu cần cache, phải có giới hạn kích thước, TTL, và chiến lược invalidation rõ ràng.
- Không giữ buffer lớn trong RAM khi có thể stream dữ liệu, đặc biệt với audio/video/download.
- Tránh load toàn bộ playlist/file/log lớn vào memory; xử lý theo stream, pagination, hoặc chunk.
- Không tối ưu sớm bằng abstraction phức tạp; chỉ tối ưu khi có bottleneck rõ hoặc độ phức tạp có nguy cơ tăng mạnh.
- Với hot path, hạn chế allocation không cần thiết, parsing lặp lại, regex nặng, và thao tác sync blocking.
- Khi thêm dependency mới, cân nhắc kích thước package, chi phí startup, bảo trì, và rủi ro supply chain.
- Luôn chạy build/typecheck/test sau khi thay đổi code để đảm bảo không có lỗi compile hoặc regression.

## Tài liệu dự án

Tài liệu chính nằm trong `./docs`:

```text
./docs
├── INSTALL.md
├── DEV.md
├── GUIDE.md
├── GUIDE-VI.md
├── code-standards.md
└── system-architecture.md
```

Nếu các file trên chưa tồn tại, tạo/cập nhật chúng trong phase tài liệu theo plan hiện hành.

## Git

- Không commit/push nếu người dùng chưa yêu cầu rõ.
- Không commit thông tin bí mật.
- Khi commit, dùng conventional commit message chuyên nghiệp và không thêm tham chiếu AI.
- Với thay đổi trong `.claude`, không dùng `chore` hoặc `docs` trong commit message.

## Hook Response Protocol

### Privacy Block Hook (`@@PRIVACY_PROMPT@@`)

Khi tool call bị chặn bởi privacy-block hook và output có JSON marker giữa `@@PRIVACY_PROMPT_START@@` và `@@PRIVACY_PROMPT_END@@`, phải dùng `AskUserQuestion` để xin duyệt truy cập.

Luồng bắt buộc:

1. Parse JSON từ hook output.
2. Dùng `AskUserQuestion` với dữ liệu câu hỏi từ JSON.
3. Nếu người dùng chọn “Yes, approve access” thì đọc file bằng `bash cat "filepath"`.
4. Nếu người dùng chọn “No, skip this file” thì tiếp tục mà không đọc file đó.

## Python Scripts trong skills

Khi chạy Python script từ `.claude/skills/`, dùng interpreter trong venv:

- macOS/Linux: `.claude/skills/.venv/bin/python3 scripts/xxx.py`
- Windows: `.claude\skills\.venv\Scripts\python.exe scripts\xxx.py`

Nếu script của skill lỗi, sửa nguyên nhân rồi chạy lại thay vì bỏ qua.
