import React, { useMemo, useState } from "react";
import { fetchQuestions, submitAnswers } from "./api.js";

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | quiz | submitting | done | error
  const [questions, setQuestions] = useState([]);
  const [selectedById, setSelectedById] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const totalSelected = useMemo(
    () => Object.values(selectedById).filter(Boolean).length,
    [selectedById]
  );

  async function start() {
    try {
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
        <p className="muted">FastAPI + React (demo tối giản)</p>
      </header>

      {status === "idle" && (
        <div className="card">
          <p>Bấm bắt đầu để làm bài (5–10 câu).</p>
          <button className="btn" onClick={start}>
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
              Số câu: <b>{questions.length}</b> — Đã chọn: <b>{totalSelected}</b>
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

