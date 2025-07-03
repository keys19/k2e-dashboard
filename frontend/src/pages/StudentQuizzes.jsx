// StudentQuizzes.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${BASE_URL}/quizzes`)
      .then(res => res.json())
      .then(setQuizzes)
      .catch(() => setError("Failed to fetch quizzes"));
  }, []);

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="p-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.quiz_id} className="p-6 bg-white shadow rounded">
              <h2 className="font-semibold text-lg mb-2">{quiz.quiz_name || "Untitled Quiz"}</h2>
              <p className="text-sm text-gray-500 mb-4">A custom quiz</p>
              <Link
                to={`/student/quizzes/take/${quiz.quiz_id}`}
                className="text-blue-600 hover:underline"
              >
                Take Quiz
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
