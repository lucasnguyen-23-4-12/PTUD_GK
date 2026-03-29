import React, { useMemo, useState } from "react";
import { fetchQuestions, submitAnswers } from "./api.js";

function getTodayLocalISODate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | quiz | submitting | done | error
  const [questions, setQuestions] = useState([]);
  const [selectedById, setSelectedById] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [studentInfo, setStudentInfo] = useState({
    student_id: "",
    full_name: "",
    class_name: "",
    exam_date: getTodayLocalISODate()
  });

  const totalSelected = useMemo(
    () => Object.values(selectedById).filter(Boolean).length,
    [selectedById]
  );

  const canStart =
    studentInfo.student_id.trim() &&
    studentInfo.full_name.trim() &&
    studentInfo.class_name.trim() &&
    studentInfo.exam_date;

  async function start() {
    try {
      if (!canStart) {
        setError("Vui lòng nhập đầy đủ: Mã SV, Họ tên, Lớp, Ngày làm bài.");
        return;
      }
      setError("");
      setStatus("loading");
      const data = await fetchQuestions();
      setQuestions(data);
      setSelectedById({});
      setResult(null);
      setStatus("quiz");
    } catch (e) {
      setError(e.message || "Có lỗi xảy ra");
      setStatus("error");
    }
  }

  function choose(questionId, option) {
    setSelectedById((prev) => ({ ...prev, [questionId]: option }));
  }

  async function submit() {
    try {
      setError("");
      setStatus("submitting");
      const answers = questions
        .map((q) => ({
          question_id: q.id,
          selected_answer: selectedById[q.id]
        }))
        .filter((a) => a.selected_answer); // chỉ gửi câu đã chọn

      const data = await submitAnswers(answers);
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError(e.message || "Có lỗi xảy ra");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setQuestions([]);
    setSelectedById({});
    setResult(null);
    setError("");
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Quiz App</h1>
        <p className="muted">FastAPI + React </p>
      </header>

      {status === "idle" && (
        <div className="card">
          <h2>Thông tin làm bài</h2>
          <p className="muted">Nhập thông tin trước khi bắt đầu làm bài.</p>

          <div className="form">
            <label className="field">
              <div className="label">Mã sinh viên</div>
              <input
                value={studentInfo.student_id}
                onChange={(e) =>
                  setStudentInfo((prev) => ({ ...prev, student_id: e.target.value }))
                }
                placeholder="VD: 22123456"
              />
            </label>

            <label className="field">
              <div className="label">Họ và tên</div>
              <input
                value={studentInfo.full_name}
                onChange={(e) =>
                  setStudentInfo((prev) => ({ ...prev, full_name: e.target.value }))
                }
                placeholder="VD: Nguyễn Văn A"
              />
            </label>

            <label className="field">
              <div className="label">Lớp</div>
              <input
                value={studentInfo.class_name}
                onChange={(e) =>
                  setStudentInfo((prev) => ({ ...prev, class_name: e.target.value }))
                }
                placeholder="VD: CNTT-K20"
              />
            </label>

            <label className="field">
              <div className="label">Ngày làm bài</div>
              <input
                type="date"
                value={studentInfo.exam_date}
                onChange={(e) =>
                  setStudentInfo((prev) => ({ ...prev, exam_date: e.target.value }))
                }
              />
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn" onClick={start} disabled={!canStart}>
            Bắt đầu
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="card">
          <p>Đang tải câu hỏi...</p>
        </div>
      )}

      {status === "quiz" && (
        <div className="card">
          <div className="row space">
            <div className="muted">
              <div>
                SV: <b>{studentInfo.student_id}</b> — <b>{studentInfo.full_name}</b> — Lớp:{" "}
                <b>{studentInfo.class_name}</b> — Ngày: <b>{studentInfo.exam_date}</b>
              </div>
              <div>
                Số câu: <b>{questions.length}</b> — Đã chọn: <b>{totalSelected}</b>
              </div>
            </div>
            <button className="btn secondary" onClick={reset}>
              Thoát
            </button>
          </div>

          <div className="questions">
            {questions.map((q, idx) => (
              <div key={q.id} className="question">
                <div className="q-title">
                  <b>
                    Câu {idx + 1}:</b> {q.question}
                </div>

                <div className="options">
                  {q.options.map((opt) => (
                    <label key={opt} className="option">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={selectedById[q.id] === opt}
                        onChange={() => choose(q.id, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="btn" onClick={submit}>
            Nộp bài
          </button>
        </div>
      )}

      {status === "submitting" && (
        <div className="card">
          <p>Đang nộp bài...</p>
        </div>
      )}

      {status === "done" && result && (
        <div className="card">
          <div className="row space">
            <div>
              <h2>Kết quả</h2>
              <div className="muted">
                SV: <b>{studentInfo.student_id}</b> — <b>{studentInfo.full_name}</b> — Lớp:{" "}
                <b>{studentInfo.class_name}</b> — Ngày: <b>{studentInfo.exam_date}</b>
              </div>
              <div className="muted">
                Đúng: <b>{result.correct_count}</b> / {result.total_questions} — Điểm:{" "}
                <b>{result.score}</b> / 10
              </div>
            </div>
            <div className="row">
              <button className="btn secondary" onClick={start}>
                Làm lại
              </button>
              <button className="btn secondary" onClick={reset}>
                Về đầu
              </button>
            </div>
          </div>

          <div className="results">
            {result.results.map((r, idx) => (
              <div
                key={r.question_id}
                className={`result ${r.is_correct ? "correct" : "wrong"}`}
              >
                <div className="q-title">
                  <b>
                    Câu {idx + 1}:</b> {r.question}
                </div>
                <div className="muted">
                  Bạn chọn: <b>{r.selected_answer ?? "(chưa chọn)"}</b>
                </div>
                <div className="muted">
                  Đáp án đúng: <b>{r.correct_answer}</b>
                </div>
                <div className="badge">
                  {r.is_correct ? "Đúng" : "Sai"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="card">
          <h2>Có lỗi</h2>
          <p className="error">{error || "Không rõ lỗi"}</p>
          <div className="row">
            <button className="btn" onClick={start}>
              Thử lại
            </button>
            <button className="btn secondary" onClick={reset}>
              Về đầu
            </button>
          </div>
          <p className="muted">
            Gợi ý: hãy chạy backend FastAPI ở `http://localhost:8000`.
          </p>
        </div>
      )}

      <footer className="footer muted">
        Backend: <code>GET /questions</code> — <code>POST /submit</code>
      </footer>
    </div>
  );
}
