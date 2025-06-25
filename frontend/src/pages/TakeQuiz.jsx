/* ────────────────────────────────────────────────
   TakeQuiz.jsx  –  play-mode for a single quiz
───────────────────────────────────────────────── */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* fixed colours / symbols so Tailwind can keep classes */
const COLORS = ["red", "blue", "yellow", "green"];
const ICONS  = ["▲",  "◆",   "●",     "■"  ];

/* handy array compare helper */
const sameArray = (a = [], b = []) =>
  a.length === b.length && a.slice().sort().every((v, i) => v === b.slice().sort()[i]);

export default function TakeQuiz() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [quiz, set] = useState(null);        // quiz JSON from backend
  const [idx,  setI]= useState(0);           // current question index
  const [sel,  setS]= useState([]);          // selections [ [idx,idx], [], … ]
  const [busy,setB] = useState(true);        // loading flag

  /* ─ fetch quiz once ─ */
  useEffect(() => {
    axios.get(`${BASE_URL}/quizzes/${id}`)
      .then(res => {
        set(res.data);
        setS(Array(res.data.slides.length).fill([])); // one empty array per slide
      })
      .catch(() => {
        alert("❌ Failed to load quiz");
        navigate("/teacher/quizzes");
      })
      .finally(() => setB(false));
  }, [id]);

  if (busy || !quiz) return <div className="p-6">Loading…</div>;

  const q     = quiz.slides[idx];
  const chose = sel[idx] || [];

  /* toggle answer */
  const toggle = (aIdx) =>
    setS(prev => {
      const copy = prev.map(a => [...a]);
      const cur  = copy[idx];
      const pos  = cur.indexOf(aIdx);
      pos >= 0 ? cur.splice(pos,1) : cur.push(aIdx);
      copy[idx]  = cur;
      return copy;
    });

  /* next / finish */
  const next = () => {
    if (idx + 1 < quiz.slides.length) return setI(idx + 1);

    /* ─ build results payload ─ */
    const answerObjs = quiz.slides.map((slide, i) => ({
      question        : slide.text,
      image           : slide.image || null,
      allAnswers      : slide.answers,
      correctIndexes  : slide.correct || [],
      selectedIndexes : sel[i] || [],
    }));

    const score = answerObjs
      .filter(o => sameArray(o.correctIndexes, o.selectedIndexes)).length;

    navigate("/teacher/quizzes/results", {
      state: {
        score,
        total   : quiz.slides.length,
        answers : answerObjs,
      },
    });
  };

  /* ─ UI ─ */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f6] px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

      <div className="bg-white shadow rounded-lg p-8 w-full max-w-3xl">
        <h2 className="text-lg font-semibold text-center mb-4">{q.text}</h2>

        {q.image && (
          <img
            src={q.image}
            alt="Question visual"
            className="mx-auto mb-4 rounded max-h-56"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.answers.map((ans, i) => {
            const colour = COLORS[i % 4];
            const picked = chose.includes(i);

            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded font-medium text-lg text-white
                  bg-${colour}-600 hover:bg-${colour}-700
                  ${picked ? "ring-4 ring-purple-400" : ""}`}
              >
                <span className="text-xl">{ICONS[i % 4]}</span> {ans}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={next}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
          >
            {idx + 1 < quiz.slides.length ? "Next" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
