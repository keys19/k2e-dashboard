import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';
import { PlusCircle, Loader2 } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Quizzes() {
  const nav        = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/quizzes`)
      .then(res => setQuizzes(res.data))
      .catch(()  => setError('Failed to fetch quizzes'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* main content */}
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* header row */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <button
            onClick={() => nav('/teacher/quizzes/new')}
            className="flex items-center gap-2 bg-[#0072e5] hover:bg-[#005dbe] text-white px-4 py-2 rounded"
          >
            <PlusCircle size={18} /> Create quiz
          </button>
        </div>

        {/* existing quizzes */}
        <h2 className="text-lg font-semibold">Existing quizzes</h2>

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" /> Loading…
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && quizzes.length === 0 && (
          <p className="text-gray-500">No quizzes yet – press “Create quiz” to add one.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(q => (
            <div key={q.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{q.description}</p>
              <button
                onClick={() => nav(`/teacher/quizzes/${q.id}/edit`)}
                className="text-sm text-[#0072e5] hover:underline"
              >
                Edit / continue
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
