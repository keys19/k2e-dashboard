/* ────────────────────────────────────────────────
   Quizzes.jsx – list, create, edit, take & delete
───────────────────────────────────────────────── */
import { useState, useEffect }   from "react";
import { useNavigate }           from "react-router-dom";
import axios                     from "axios";
import Sidebar                   from "@/components/Sidebar";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Quizzes() {
  const navigate          = useNavigate();
  const [quizzes, setQs]  = useState([]);
  const [loading, setL]   = useState(true);
  const [error, setErr]   = useState(null);

  /* ─ fetch once ─ */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/quizzes`)
      .then(res => setQs(res.data))
      .catch(() => setErr("Failed to fetch quizzes"))
      .finally(() => setL(false));
  }, []);

  /* ─ delete handler ─ */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`${BASE_URL}/quizzes/${id}`);
      setQs(prev => prev.filter(q => q.id !== id));
    } catch (e) {
      alert("❌ Could not delete quiz.");
      console.error(e);
    }
  };

  /* helper to wrap loading / error */
  const wrapper = (inner) => (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">{inner}</div>
    </div>
  );

  if (loading) return wrapper(<Loader2 size={32} className="animate-spin" />);
  if (error)   return wrapper(<p className="text-red-500">{error}</p>);

  /* ─ normal list view ─ */
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 space-y-6">
        {/* header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quizzes</h1>

          <button
            onClick={() => navigate("/teacher/quizzes/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <PlusCircle size={18} /> New Quiz
          </button>
        </div>

        {/* grid of quizzes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(q => (
            <div
              key={q.id}
              className="relative bg-white p-4 rounded shadow flex flex-col gap-2"
            >
              <h2 className="text-lg font-semibold">{q.title}</h2>
              <p className="text-sm text-gray-500">A custom quiz</p>

              {/* action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/teacher/quizzes/${q.id}/edit`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit / Continue
                </button>

                <button
                  onClick={() => navigate(`/teacher/quizzes/${q.id}/take`)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Take Quiz
                </button>
              </div>

              {/* delete */}
              <button
                onClick={() => handleDelete(q.id)}
                className="absolute bottom-3 right-3 text-gray-400 hover:text-red-600"
                title="Delete quiz"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {quizzes.length === 0 && (
          <p>No quizzes yet. Click “New Quiz” to start!</p>
        )}
      </main>
    </div>
  );
}
