// Reports.jsx - Teachers can view and manage student reports, generate AI reports, and add comments.
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  FileText,
  StickyNote,
  Brain,
  Pencil,
} from "lucide-react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Reports() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [month, setMonth] = useState("May 2025");
  const [comment, setComment] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(false);
  const [editingReport, setEditingReport] = useState(false);
  const { user } = useUser();
  const teacherName = user?.fullName || "Teacher";

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await axios.get(`${BASE_URL}/students`);
      setStudents(res.data);
      if (res.data.length > 0) setSelectedStudentId(res.data[0].id);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchDetails = async () => {
      const reportRes = await axios.get(`${BASE_URL}/reports`, {
        params: { student_id: selectedStudentId, month },
      });
      setComment(reportRes.data?.teacher_comment || "");
      setReport(reportRes.data?.content || "");
    };
    fetchDetails();
  }, [selectedStudentId, month]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/ai-reports/generate-report`, {
        student_id: selectedStudentId,
        month,
        clerk_user_id: user.id 
      });
      setReport(res.data.report);
    } catch (err) {
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComment = async () => {
    try {
      await axios.post(`${BASE_URL}/ai-reports/comment`, {
        student_id: selectedStudentId,
        month,
        generated_by: teacherName,
        teacher_comment: comment,
      });
      setEditingComment(false);
    } catch (err) {
      alert("Failed to save comment");
    }
  };

  const handleSaveReport = async () => {
    try {
      await axios.post(`${BASE_URL}/ai-reports/edit-content`, {
        student_id: selectedStudentId,
        month,
        content: report,
        generated_by: teacherName,
      });
      setEditingReport(false);
    } catch (err) {
      alert("Failed to save report edits");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Student Reports
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {["March 2025", "April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Teacher's Comment</h2>
          {editingComment ? (
            <>
              <textarea
                className="w-full border p-2 rounded"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveComment}>
                  Save
                </Button>
                <Button variant="outline" className="bg-gray-400 text-white hover:bg-gray-500" onClick={() => setEditingComment(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-start gap-2">
              <p className="border bg-gray-50 p-3 rounded w-full whitespace-pre-line">
                {comment || <em>Please add a comment for this student this month.</em>}
              </p>
              <Button
                variant="outline"
                className="bg-[#0072e5] text-white hover:bg-[#1E40AF]"
                onClick={() => setEditingComment(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">AI Report</h2>
          <Button
            onClick={handleGenerateReport}
            className="mb-3 bg-[#0072e5] text-white hover:bg-[#1E40AF]"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate AI Report"}
          </Button>

          {editingReport ? (
            <>
              <textarea
                className="w-full border p-2 rounded"
                value={report}
                onChange={(e) => setReport(e.target.value)}
                rows={8}
              />
              <div className="mt-2 flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveReport}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-400 text-white hover:bg-gray-500"
                  onClick={() => setEditingReport(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-start gap-2">
              <div className="border bg-white p-3 rounded shadow w-full whitespace-pre-line min-h-[120px]">
                {report ? report : <em>No report yet generated.</em>}
              </div>
              <Button
                variant="outline"
                className="bg-[#0072e5] text-white hover:bg-[#1E40AF]"
                onClick={() => setEditingReport(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
