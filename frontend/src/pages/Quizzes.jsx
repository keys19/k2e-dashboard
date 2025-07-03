import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { PlusCircle, Loader2, Trash2, Users, Pencil } from "lucide-react";
import QuizGroupModal from "@/components/QuizGroupModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Quizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [groups, setGroups] = useState([]); // ✅ ADD THIS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [quizRes, groupRes] = await Promise.all([
          axios.get(`${BASE_URL}/quizzes`),
          axios.get(`${BASE_URL}/groups`),
        ]);
        setQuizzes(quizRes.data);
        setGroups(groupRes.data); // ✅ SET GROUPS
      } catch {
        setError("Failed to fetch quizzes or groups");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDelete = async (quiz_id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`${BASE_URL}/quizzes/${quiz_id}`);
      setQuizzes((prev) => prev.filter((q) => q.quiz_id !== quiz_id));
    } catch (err) {
      console.error(err);
      alert("❌ Could not delete quiz.");
    }
  };

  const wrapper = (content) => (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">{content}</div>
    </div>
  );

  if (loading) return wrapper(<Loader2 size={32} className="animate-spin" />);
  if (error) return wrapper(<p className="text-red-500">{error}</p>);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <button
            onClick={() => navigate("/teacher/quizzes/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <PlusCircle size={18} /> New Quiz
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((q) => (
            <div
              key={q.quiz_id}
              className="relative bg-white p-4 rounded shadow flex flex-col gap-2"
            >
              <h2 className="text-lg font-semibold">{q.quiz_name}</h2>
              <p className="text-sm text-gray-500">A custom quiz</p>

              <div className="flex gap-4 items-center">
                <button
                  onClick={() => navigate(`/teacher/quizzes/${q.quiz_id}/edit`)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit quiz"
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => {
                    setSelectedQuizId(q.quiz_id);
                    setModalOpen(true);
                  }}
                  className="text-green-600 hover:text-green-800"
                  title="Assign groups"
                >
                  <Users size={16} />
                </button>

                <button
                  onClick={() => navigate(`/teacher/quizzes/${q.quiz_id}/take`)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Take Quiz
                </button>
              </div>

              <button
                onClick={() => handleDelete(q.quiz_id)}
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

      {/* ✅ FIX: pass allGroups prop to modal */}
      {modalOpen && (
        <QuizGroupModal
          quizId={selectedQuizId}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          allGroups={groups}
        />
      )}
    </div>
  );
}
