import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

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
  console.log("🔎 role is:", role);

  const slides = quiz.slides;
  console.log("🧪 selected answers:", sel);

  try {
    if (role === "student") {
      console.log("🎯 Student submitting answers...");

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

            console.log("📤 Sending answer:", responsePayload);
            await axios.post(`${BASE_URL}/student-answers`, responsePayload);
          } else {
            console.warn("⚠️ Skipping invalid answer:", {
              slide,
              answerIndex,
              answer,
            });
          }
        }
      }

      console.log("✅ All answers submitted, navigating...");
      navigate("/student/quizzes");
    } else {
      console.log("👤 Not student role, showing results instead");
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
    alert("Could not save your answers.");
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
                <span className="text-xl">{ICONS[i % 4]}</span> {ans.answer_text || ans.text || ans}
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
