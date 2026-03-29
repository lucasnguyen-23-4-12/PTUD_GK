from typing import Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .data import QUESTIONS


class QuestionPublic(BaseModel):
    id: int
    question: str
    options: List[str]


class AnswerIn(BaseModel):
    question_id: int
    selected_answer: str


class SubmitIn(BaseModel):
    answers: List[AnswerIn]


class QuestionResult(BaseModel):
    question_id: int
    question: str
    options: List[str]
    selected_answer: Optional[str]
    correct_answer: str
    is_correct: bool


class SubmitOut(BaseModel):
    total_questions: int
    correct_count: int
    score: float
    results: List[QuestionResult]


app = FastAPI(title="Quiz API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite
        "http://localhost:3000",  # CRA (nếu bạn đổi sau này)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/questions", response_model=List[QuestionPublic])
def get_questions():
    # Không trả correct_answer để người dùng không “nhìn đáp án” trước.
    return [
        {"id": q["id"], "question": q["question"], "options": q["options"]}
        for q in QUESTIONS
    ]


@app.post("/submit", response_model=SubmitOut)
def submit(payload: SubmitIn):
    answers_by_id: Dict[int, str] = {
        a.question_id: a.selected_answer for a in payload.answers
    }

    results: List[QuestionResult] = []
    correct_count = 0

    for q in QUESTIONS:
        selected = answers_by_id.get(q["id"])
        is_correct = selected == q["correct_answer"]
        if is_correct:
            correct_count += 1

        results.append(
            QuestionResult(
                question_id=q["id"],
                question=q["question"],
                options=q["options"],
                selected_answer=selected,
                correct_answer=q["correct_answer"],
                is_correct=is_correct,
            )
        )

    total = len(QUESTIONS)
    score = round((correct_count / total) * 10, 2) if total else 0.0  # thang điểm 10

    return SubmitOut(
        total_questions=total,
        correct_count=correct_count,
        score=score,
        results=results,
    )

