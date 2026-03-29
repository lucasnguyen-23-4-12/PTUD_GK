# Quiz App (FastAPI + React)

## Cấu trúc thư mục

```
PTUD_GK/
  backend/
    app/
      __init__.py        # đánh dấu package Python
      data.py            # dữ liệu câu hỏi (seed cứng để dễ sửa)
      main.py            # FastAPI app: CORS + GET /questions + POST /submit
    requirements.txt     # thư viện backend (fastapi, uvicorn)
  frontend/
    index.html           # HTML entry cho Vite
    package.json         # scripts + dependencies React/Vite
    vite.config.js       # cấu hình Vite (port dev server)
    src/
      api.js             # gọi API backend (/questions, /submit)
      App.jsx            # UI chính: start quiz, chọn đáp án, nộp bài, xem kết quả
      main.jsx           # mount React vào #root
      styles.css         # CSS giao diện
  .gitignore             # bỏ qua venv, node_modules, dist, ...
  README.md              # hướng dẫn chạy và mô tả project
```

## 1) Backend (FastAPI)

Mở terminal ở thư mục `backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API:
- `GET http://localhost:8000/questions`
- `POST http://localhost:8000/submit`

## 2) Frontend (React + Vite)

Mở terminal ở thư mục `frontend`:

```powershell
npm install
npm run dev
```

Mở trình duyệt: `http://localhost:5173`

## Ghi chú

- Câu hỏi đang được lưu cứng trong `backend/app/data.py` để dễ sửa theo yêu cầu giảng viên.
- `GET /questions` không trả `correct_answer` để tránh “lộ đáp án”; chấm điểm nằm ở `POST /submit`.
- Trước khi làm bài, frontend yêu cầu nhập: mã SV, họ tên, lớp, ngày làm bài (hiển thị lại ở màn hình làm bài và kết quả).
