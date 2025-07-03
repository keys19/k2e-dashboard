import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const COLORS = ["red", "blue", "yellow", "green"];
const ICONS = ["▲", "◆", "●", "■"];

const sameArray = (a = [], b = []) =>
  a.length === b.length && a.slice().sort().every((v, i) => v === b.slice().sort()[i]);

export default function TakeQuiz() {
  const { user } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    axios.get(`${BASE_URL}/quizzes/${id}`)
      .then(res => {
        setQuiz(res.data);
        setSel(Array(res.data.slides.length).fill([]));
      })
      .catch(() => {
        alert("❌ Failed to load quiz");
        navigate("/teacher/quizzes");
      })
      .finally(() => setBusy(false));
  }, [id]);

  if (busy || !quiz) return <div className="p-6">Loading…</div>;

  const currentSlide = quiz.slides[idx];
  const chosen = sel[idx] || [];

  const toggle = (aIdx) =>
    setSel(prev => {
      const copy = prev.map(a => [...a]);
      const cur = copy[idx];
      const pos = cur.indexOf(aIdx);
      pos >= 0 ? cur.splice(pos, 1) : cur.push(aIdx);
      copy[idx] = cur;
      return copy;
    });

  const finishQuiz = async () => {
    const role = user?.publicMetadata?.role;
    const slides = quiz.slides;

    try {
      if (role === "student") {
        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          const selected = sel[i] || [];

          for (let answerIndex of selected) {
            const answerObj = slide.answers[answerIndex];
            const answer_id = answerObj?.id;
            const is_correct = slide.correct?.includes(answerIndex) || false;

            if (answer_id != null && slide.id != null) {
              const responsePayload = {
                response_id: Date.now() + Math.floor(Math.random() * 1000),
                student_id: user.id,
                quiz_id: id,
                question_id: slide.id,
                answer_id,
                is_correct: Boolean(is_correct),
              };

              await axios.post(`${BASE_URL}/student-answers`, responsePayload);
            } else {
              console.warn("Missing IDs", { slide, answerIndex, answerObj });
            }
          }
        }

        navigate("/student/quizzes");
      } else {
        const answerObjs = slides.map((slide, i) => ({
          question: slide.text,
          image: slide.image || null,
          allAnswers: slide.answers,
          correctIndexes: slide.correct || [],
          selectedIndexes: sel[i] || [],
        }));

        const score = answerObjs.filter(o => sameArray(o.correctIndexes, o.selectedIndexes)).length;

        navigate("/teacher/quizzes/results", {
          state: {
            score,
            total: slides.length,
            answers: answerObjs,
          },
        });
      }
    } catch (err) {
      console.error("❌ Error posting student answers", err);
      alert("Failed to save your answers.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f6] px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

      <div className="bg-white shadow rounded-lg p-8 w-full max-w-3xl">
        <h2 className="text-lg font-semibold text-center mb-4">{currentSlide.text}</h2>

        {currentSlide.image && (
          <img
            src={currentSlide.image}
            alt="Question visual"
            className="mx-auto mb-4 rounded max-h-56"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSlide.answers.map((ans, i) => {
            const colour = COLORS[i % 4];
            const picked = chosen.includes(i);

            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded font-medium text-lg text-white
                bg-${colour}-600 hover:bg-${colour}-700
                ${picked ? "ring-4 ring-purple-400" : ""}`}
              >
                <span className="text-xl">{ICONS[i % 4]}</span> {ans.text || ans}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={idx + 1 < quiz.slides.length ? () => setIdx(idx + 1) : finishQuiz}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
          >
            {idx + 1 < quiz.slides.length ? "Next" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
