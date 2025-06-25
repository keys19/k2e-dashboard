// src/pages/QuizResults.jsx
import { useLocation, useNavigate } from "react-router-dom";

export default function QuizResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { score = 0, total = 0 } = location.state || {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] px-6">
      <div className="bg-white p-8 rounded shadow text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">🎉 Quiz Completed!</h1>
        <p className="text-lg mb-6">
          You got <span className="font-semibold">{score}</span> out of{" "}
          <span className="font-semibold">{total}</span> correct.
        </p>
        <button
          onClick={() => navigate("/teacher/quizzes")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Go Back to Quiz Page
        </button>
      </div>
    </div>
  );
}
