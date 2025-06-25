// src/pages/TakeQuiz.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/quizzes/${id}`)
      .then((res) => setQuiz(res.data))
      .catch(() => {
        alert("❌ Failed to load quiz");
        navigate("/teacher/quizzes");
      });
  }, [id]);

  if (!quiz) return <div className="p-6">Loading quiz...</div>;

  const q = quiz.slides?.[current];
  if (!q) return <div className="p-6">No questions found.</div>;

  const colors = ["red", "blue", "yellow", "green"];
  const icons = ["▲", "◆", "●", "■"];

  const toggleAnswer = (index) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleNext = () => {
    // Check if selected answers match correct indexes
    const correctIndexes = q.correct || []; // should be array of indexes
    const isCorrect =
      selected.length === correctIndexes.length &&
      selected.every((val) => correctIndexes.includes(val));
    if (isCorrect) setScore((prev) => prev + 1);

    setSelected([]);
    if (current + 1 < quiz.slides.length) {
      setCurrent(current + 1);
    } else {
      navigate(`/teacher/quizzes/${id}/results`, {
        state: { score, total: quiz.slides.length },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f4f6] px-6">
      <h1 className="text-xl font-bold mb-4">{quiz.title}</h1>

      <div className="bg-white shadow rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-lg font-semibold text-center mb-4">{q.text}</h2>

        {q.image && (
          <img
            src={q.image}
            alt="Question"
            className="mx-auto mb-4 rounded max-h-64"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.answers.map((ans, i) => (
            <button
              key={i}
              onClick={() => toggleAnswer(i)}
              className={`flex items-center gap-2 px-4 py-3 rounded text-white font-medium justify-center text-center text-lg
                ${
                  selected.includes(i) ? "ring-4 ring-purple-400" : ""
                } 
                bg-${colors[i % 4]}-600 hover:bg-${colors[i % 4]}-700`}
            >
              <span className="text-xl">{icons[i % 4]}</span> {ans}
            </button>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleNext}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
          >
            {current + 1 < quiz.slides.length ? "Next" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}
