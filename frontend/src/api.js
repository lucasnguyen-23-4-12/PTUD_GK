const API_BASE = "http://localhost:8000";

export async function fetchQuestions() {
  const res = await fetch(`${API_BASE}/questions`);
  if (!res.ok) throw new Error("Không lấy được danh sách câu hỏi");
  return res.json();
}

export async function submitAnswers(answers) {
  const res = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers })
  });
  if (!res.ok) throw new Error("Nộp bài thất bại");
  return res.json();
}

