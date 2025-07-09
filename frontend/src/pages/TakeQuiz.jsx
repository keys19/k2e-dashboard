import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

import shape1 from "../assets/shape1.png";
import shape2 from "../assets/shape2.png";
import shape3 from "../assets/shape3.png";
import shape4 from "../assets/shape4.png";
import shape5 from "../assets/shape5.png";
import shape6 from "../assets/shape6.png";
import shape7 from "../assets/shape7.png";
import shape8 from "../assets/shape8.png";
import shape9 from "../assets/shape9.png";
import nextIcon from "../assets/shape11.png";
import backIcon from "../assets/shape12.png";

const ICONS = [shape1, shape2, shape3, shape4, shape5, shape6, shape7, shape8, shape9];
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = [
  "bg-[#F0DF3A]", "bg-[#E28C2C]", "bg-[#8C6849]",
  "bg-[#38A24E]", "bg-[#3E3D3F]", "bg-[#C8422B]",
  "bg-[#1E78C8]", "bg-[#5E2B90]", "bg-[#D061A8]",
];

const sameArray = (a = [], b = []) =>
  a.length === b.length && a.slice().sort().every((v, i) => v === b.slice().sort()[i]);

export default function TakeQuiz() {
  const { user } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const fetchQuizAndStudent = async () => {
      try {
        const quizRes = await axios.get(`${BASE_URL}/quizzes/${id}`);
        setQuiz(quizRes.data);
        setSel(Array(quizRes.data.slides.length).fill([]));

        const studentRes = await axios.get(`${BASE_URL}/students?clerk_user_id=${user.id}`);
        setStudentId(studentRes.data[0]?.id);
      } catch (err) {
        console.error("❌ Failed to load quiz or student", err);
        alert("❌ Failed to load quiz");
        navigate("/student/quizzes");
      } finally {
        setBusy(false);
      }
    };

    fetchQuizAndStudent();
  }, [id, user]);

  const currentSlide = quiz?.slides?.[idx] || [];
  const chosen = sel[idx] || [];

  const toggle = (aIdx) =>
    setSel((prev) => {
      const copy = prev.map((a) => [...a]);
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
            const answer = slide.answers[answerIndex];
            const answer_id = answer?.answer_id;
            const answer_text = answer?.answer_text || answer?.text || "";
            const is_correct = Boolean(answer?.is_correct);

            if (answer_id && slide.question_id) {
              const responsePayload = {
                response_id: Date.now() + Math.floor(Math.random() * 1000),
                student_id: studentId,
                quiz_id: id,
                question_id: slide.question_id,
                answer_id,
                answer_text,
                is_correct,
              };

              await axios.post(`${BASE_URL}/student-answers`, responsePayload);
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

        const score = answerObjs.filter((o) =>
          sameArray(o.correctIndexes, o.selectedIndexes)
        ).length;

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
      alert("Could not save your answers.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const shapeKeyMap = {
        '7': 0, '8': 1, '9': 2,
        '4': 3, '5': 4, '6': 5,
        '1': 6, '2': 7, '3': 8,
      };
      const key = e.key.toLowerCase();

      const answerIdx = shapeKeyMap[key];
      if (answerIdx !== undefined && answerIdx < currentSlide.answers.length) {
        toggle(answerIdx);
      }

      if (key === "b") {
        idx + 1 < quiz.slides.length ? setIdx(idx + 1) : finishQuiz();
      }

      if (key === "a") {
        if (idx > 0) {
          setIdx(idx - 1);
        } else {
          navigate("/student/quizzes");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, idx, quiz]);

  if (busy || !quiz) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f6] px-6 py-10 relative">
      {/* Back Button */}
      <button
        onClick={() => {
          if (idx > 0) setIdx(idx - 1);
          else navigate("/student/quizzes");
        }}
        className="absolute top-4 left-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        <img src={backIcon} alt="Back" className="w-9 h-9" />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">{quiz.title}</h1>

      <div className="bg-white shadow rounded-lg p-8 w-full max-w-4xl">
        <h2 className="text-lg font-semibold text-center mb-4">{currentSlide.text}</h2>

        {currentSlide.image && (
          <img
            src={currentSlide.image}
            alt="Question"
            className="mx-auto mb-4 rounded max-h-56"
          />
        )}

        <div
          className={`grid gap-4 ${
            currentSlide.answers.length > 4
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {currentSlide.answers.map((ans, i) => {
            const picked = chosen.includes(i);
            const image = ans.image || ans.image_url || null;

            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`flex items-center gap-4 w-full px-6 py-6 rounded font-medium text-white text-lg
                  ${COLORS[i % COLORS.length]} ${picked ? "ring-4 ring-purple-400" : ""}`}
              >
                <img
                  src={ICONS[i % ICONS.length]}
                  alt="icon"
                  className="w-28 h-28 shrink-0"
                />

                <div className="flex-1 text-left">
                  {typeof ans.answer_text === "string" &&
                    ans.answer_text.trim() !== "" && (
                      <div className="text-2xl font-semibold">{ans.answer_text}</div>
                    )}

                  {image && (
                    <img
                      src={image}
                      alt={`Answer ${i + 1}`}
                      className="mt-2 w-32 h-32 object-cover rounded bg-white p-1 shadow"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={idx + 1 < quiz.slides.length ? () => setIdx(idx + 1) : finishQuiz}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            <img src={nextIcon} alt="Next" className="w-10 h-10" />
            {idx + 1 < quiz.slides.length ? "Next" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
