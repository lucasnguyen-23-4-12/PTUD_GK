# Quiz App (FastAPI + React)

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

