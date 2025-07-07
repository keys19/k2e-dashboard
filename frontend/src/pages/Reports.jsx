// // Reports.jsx - Teachers can view and manage student reports, generate AI reports, and add comments.
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "../components/Sidebar";
// import { useUser } from "@clerk/clerk-react";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import {
//   FileText,
//   StickyNote,
//   Brain,
//   Pencil,
// } from "lucide-react";
// import { translateText } from "@/utils/translateText";
// import { decodeHtml } from "@/utils/decodeHTML";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;



// function Reports() {
//   const [students, setStudents] = useState([]);
//   const [selectedStudentId, setSelectedStudentId] = useState("");
//   const [month, setMonth] = useState("May 2025");
//   const [comment, setComment] = useState("");
//   const [report, setReport] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [editingComment, setEditingComment] = useState(false);
//   const [editingReport, setEditingReport] = useState(false);
//   const { user } = useUser();
//   const teacherName = user?.fullName || "Teacher";
//   const [translatedReport, setTranslatedReport] = useState("");
//   const [translating, setTranslating] = useState(false);

//   useEffect(() => {
//     const fetchStudents = async () => {
//       const res = await axios.get(`${BASE_URL}/students`);
//       setStudents(res.data);
//       if (res.data.length > 0) setSelectedStudentId(res.data[0].id);
//     };
//     fetchStudents();
//   }, []);

//   useEffect(() => {
//     if (!selectedStudentId) return;
//     const fetchDetails = async () => {
//       const reportRes = await axios.get(`${BASE_URL}/reports`, {
//         params: { student_id: selectedStudentId, month },
//       });
//       setComment(reportRes.data?.teacher_comment || "");
//       setReport(reportRes.data?.content || "");
//     };
//     fetchDetails();
//   }, [selectedStudentId, month]);

//   const handleGenerateReport = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.post(`${BASE_URL}/ai-reports/generate-report`, {
//         student_id: selectedStudentId,
//         month,
//         clerk_user_id: user.id 
//       });
//       setReport(res.data.report);
//     } catch (err) {
//       alert("Failed to generate report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveComment = async () => {
//     try {
//       await axios.post(`${BASE_URL}/ai-reports/comment`, {
//         student_id: selectedStudentId,
//         month,
//         generated_by: teacherName,
//         teacher_comment: comment,
//       });
//       setEditingComment(false);
//     } catch (err) {
//       alert("Failed to save comment");
//     }
//   };

//   const handleSaveReport = async () => {
//     try {
//       await axios.post(`${BASE_URL}/ai-reports/edit-content`, {
//         student_id: selectedStudentId,
//         month,
//         content: report,
//         generated_by: teacherName,
//       });
//       setEditingReport(false);
//     } catch (err) {
//       alert("Failed to save report edits");
//     }
//   };

//   const handleTranslateToArabic = async () => {
//   try {
//     setTranslating(true);
//     const translated = await translateText(report, "ar");
//     setTranslatedReport(translated);
//   } catch (err) {
//     alert("Failed to translate.");
//   } finally {
//     setTranslating(false);
//   }
// };

//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
//           <FileText className="w-6 h-6 text-blue-600" />
//           Student Reports
//         </h1>

//         <div className="flex flex-wrap gap-4 mb-6">
//           <Select value={month} onValueChange={setMonth}>
//             <SelectTrigger className="w-[160px]">
//               <SelectValue placeholder="Month" />
//             </SelectTrigger>
//             <SelectContent>
//               {["March 2025", "April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
//                 <SelectItem key={m} value={m}>
//                   {m}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
//             <SelectTrigger className="w-[220px]">
//               <SelectValue placeholder="Student" />
//             </SelectTrigger>
//             <SelectContent>
//               {students.map((s) => (
//                 <SelectItem key={s.id} value={s.id}>
//                   {s.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="mb-6">
//           <h2 className="font-semibold text-lg mb-2">Teacher's Comment</h2>
//           {editingComment ? (
//             <>
//               <textarea
//                 className="w-full border p-2 rounded"
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 rows={3}
//               />
//               <div className="mt-2 flex gap-2">
//                 <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveComment}>
//                   Save
//                 </Button>
//                 <Button variant="outline" className="bg-gray-400 text-white hover:bg-gray-500" onClick={() => setEditingComment(false)}>
//                   Cancel
//                 </Button>
//               </div>
//             </>
//           ) : (
//             <div className="flex justify-between items-start gap-2">
//               <p className="border bg-gray-50 p-3 rounded w-full whitespace-pre-line">
//                 {comment || <em>Please add a comment for this student this month.</em>}
//               </p>
//               <Button
//                 variant="outline"
//                 className="bg-[#0072e5] text-white hover:bg-[#1E40AF]"
//                 onClick={() => setEditingComment(true)}
//               >
//                 Edit
//               </Button>
//             </div>
//           )}
//         </div>

//         <div className="mb-6">
//           <h2 className="font-semibold text-lg mb-2">AI Report</h2>
//           <Button
//             onClick={handleGenerateReport}
//             className="mb-3 bg-[#0072e5] text-white hover:bg-[#1E40AF]"
//             disabled={loading}
//           >
//             {loading ? "Generating..." : "Generate AI Report"}
//           </Button>

//           {editingReport ? (
//             <>
//               <textarea
//                 className="w-full border p-2 rounded"
//                 value={report}
//                 onChange={(e) => setReport(e.target.value)}
//                 rows={8}
//               />
//               <div className="mt-2 flex gap-2">
//                 <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveReport}>
//                   Save
//                 </Button>
//                 <Button
//                   variant="outline"
//                   className="bg-gray-400 text-white hover:bg-gray-500"
//                   onClick={() => setEditingReport(false)}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </>
//           ) : (
//             <div className="flex justify-between items-start gap-2">
//               <div className="border bg-white p-3 rounded shadow w-full whitespace-pre-line min-h-[120px]">
//                 {report ? report : <em>No report yet generated.</em>}
//               </div>
//               <Button
//                 variant="outline"
//                 className="bg-[#0072e5] text-white hover:bg-[#1E40AF]"
//                 onClick={() => setEditingReport(true)}
//               >
//                 Edit
//               </Button>
//             </div>
//           )}

//           {report && !editingReport && (
//   <Button
//     onClick={handleTranslateToArabic}
//     className="mt-4 bg-[#0072e5] text-white hover:bg-[#1E40AF]"
//     disabled={translating}
//   >
//     {translating ? "Translating..." : "Show in Arabic"}
//   </Button>
// )}

// {translatedReport && (
//   <div className="mt-4 border bg-gray-50 p-3 rounded shadow whitespace-pre-line">
//     <h3 className="font-semibold mb-2">Arabic Version:</h3>
//     {/* <p>{translatedReport}</p> */}
//     <p>{decodeHtml(translatedReport)}</p>

//   </div>
// )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Reports;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "../components/Sidebar";
// import { useUser } from "@clerk/clerk-react";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { FileText } from "lucide-react";
// import { translateText } from "@/utils/translateText";
// import { decodeHtml } from "@/utils/decodeHTML";

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// function Reports() {
//   const [students, setStudents] = useState([]);
//   const [selectedStudentId, setSelectedStudentId] = useState("");
//   const [month, setMonth] = useState("May 2025");
//   const [comment, setComment] = useState("");
//   const [report, setReport] = useState("");
//   const [translatedReport, setTranslatedReport] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [translating, setTranslating] = useState(false);
//   const [editingComment, setEditingComment] = useState(false);
//   const [editingReport, setEditingReport] = useState(false);
//   const [editingArabic, setEditingArabic] = useState(false);

//   const { user } = useUser();
//   const teacherName = user?.fullName || "Teacher";

//   useEffect(() => {
//     const fetchStudents = async () => {
//       const res = await axios.get(`${BASE_URL}/students`);
//       setStudents(res.data);
//       if (res.data.length > 0) setSelectedStudentId(res.data[0].id);
//     };
//     fetchStudents();
//   }, []);

//   useEffect(() => {
//     if (!selectedStudentId) return;
//     const fetchDetails = async () => {
//       const res = await axios.get(`${BASE_URL}/reports`, {
//         params: { student_id: selectedStudentId, month },
//       });
//       setComment(res.data?.teacher_comment || "");
//       setReport(res.data?.content || "");
//       setTranslatedReport(res.data?.content_arabic || "");
//     };
//     fetchDetails();
//   }, [selectedStudentId, month]);

//   const handleGenerateReport = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.post(`${BASE_URL}/ai-reports/generate-report`, {
//         student_id: selectedStudentId,
//         month,
//         clerk_user_id: user.id,
//       });
//       setReport(res.data.report);
//     } catch {
//       alert("Failed to generate report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveComment = async () => {
//     try {
//       await axios.post(`${BASE_URL}/ai-reports/comment`, {
//         student_id: selectedStudentId,
//         month,
//         teacher_comment: comment,
//         generated_by: teacherName,
//       });
//       setEditingComment(false);
//     } catch {
//       alert("Failed to save comment");
//     }
//   };

//   const handleSaveReport = async () => {
//     try {
//       await axios.post(`${BASE_URL}/ai-reports/edit-content`, {
//         student_id: selectedStudentId,
//         month,
//         content: report,
//         generated_by: teacherName,
//       });
//       setEditingReport(false);
//     } catch {
//       alert("Failed to save report edits");
//     }
//   };

//   const handleTranslateToArabic = async () => {
//     try {
//       setTranslating(true);
//       const translated = await translateText(report, "ar");
//       setTranslatedReport(translated);

//       // Save Arabic to DB
//       await axios.post(`${BASE_URL}/ai-reports/edit-arabic`, {
//         student_id: selectedStudentId,
//         month,
//         content_arabic: translated,
//       });
//     } catch {
//       alert("Failed to translate to Arabic");
//     } finally {
//       setTranslating(false);
//     }
//   };

//   const handleSaveArabic = async () => {
//     try {
//       await axios.post(`${BASE_URL}/ai-reports/edit-arabic`, {
//         student_id: selectedStudentId,
//         month,
//         content_arabic: translatedReport,
//       });
//       setEditingArabic(false);
//     } catch {
//       alert("Failed to save Arabic version");
//     }
//   };

//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
//           <FileText className="w-6 h-6 text-blue-600" />
//           Student Reports
//         </h1>

//         {/* Selectors */}
//         <div className="flex flex-wrap gap-4 mb-6">
//           <Select value={month} onValueChange={setMonth}>
//             <SelectTrigger className="w-[160px]">
//               <SelectValue placeholder="Month" />
//             </SelectTrigger>
//             <SelectContent>
//               {["March 2025", "April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
//                 <SelectItem key={m} value={m}>{m}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
//             <SelectTrigger className="w-[220px]">
//               <SelectValue placeholder="Student" />
//             </SelectTrigger>
//             <SelectContent>
//               {students.map((s) => (
//                 <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Teacher Comment */}
//         <div className="mb-6">
//           <h2 className="font-semibold text-lg mb-2">Teacher's Comment</h2>
//           {editingComment ? (
//             <>
//               <textarea
//                 className="w-full border p-2 rounded"
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 rows={3}
//               />
//               <div className="mt-2 flex gap-2">
//                 <Button className="bg-green-600 text-white" onClick={handleSaveComment}>Save</Button>
//                 <Button variant="outline" onClick={() => setEditingComment(false)}>Cancel</Button>
//               </div>
//             </>
//           ) : (
//             <div className="flex justify-between gap-2">
//               <p className="border bg-gray-50 p-3 rounded w-full whitespace-pre-line">{comment || <em>Add a comment for this student.</em>}</p>
//               <Button onClick={() => setEditingComment(true)}>Edit</Button>
//             </div>
//           )}
//         </div>

//         {/* English Report */}
//         <div className="mb-6">
//           <h2 className="font-semibold text-lg mb-2">AI Report (English)</h2>
//           <Button
//             onClick={handleGenerateReport}
//             disabled={loading}
//             className="mb-3 bg-blue-600 text-white"
//           >
//             {loading ? "Generating..." : "Generate AI Report"}
//           </Button>

//           {editingReport ? (
//             <>
//               <textarea
//                 className="w-full border p-2 rounded"
//                 value={report}
//                 onChange={(e) => setReport(e.target.value)}
//                 rows={8}
//               />
//               <div className="mt-2 flex gap-2">
//                 <Button className="bg-green-600 text-white" onClick={handleSaveReport}>Save</Button>
//                 <Button variant="outline" onClick={() => setEditingReport(false)}>Cancel</Button>
//               </div>
//             </>
//           ) : (
//             <div className="flex justify-between gap-2">
//               <div className="border bg-white p-3 rounded shadow w-full whitespace-pre-line min-h-[120px]">
//                 {report || <em>No report yet generated.</em>}
//               </div>
//               <Button onClick={() => setEditingReport(true)}>Edit</Button>
//             </div>
//           )}

//           {report && !editingReport && (
//             <Button
//               onClick={handleTranslateToArabic}
//               disabled={translating}
//               className="mt-4 bg-blue-600 text-white"
//             >
//               {translating ? "Translating..." : "Show in Arabic"}
//             </Button>
//           )}
//         </div>

//         {/* Arabic Report */}
//         {translatedReport && (
//           <div className="mb-10 border bg-gray-50 p-4 rounded shadow">
//             <h3 className="font-semibold mb-2">Arabic Version:</h3>
//             {editingArabic ? (
//               <>
//                 <textarea
//                   className="w-full border p-2 rounded"
//                   value={translatedReport}
//                   onChange={(e) => setTranslatedReport(e.target.value)}
//                   rows={8}
//                 />
//                 <div className="mt-2 flex gap-2">
//                   <Button className="bg-green-600 text-white" onClick={handleSaveArabic}>Save Arabic</Button>
//                   <Button variant="outline" onClick={() => setEditingArabic(false)}>Cancel</Button>
//                 </div>
//               </>
//             ) : (
//               <div className="flex justify-between gap-2">
//                 <div className="whitespace-pre-line w-full">{decodeHtml(translatedReport)}</div>
//                 <Button onClick={() => setEditingArabic(true)}>Edit Arabic</Button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Reports;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Sidebar from "../components/Sidebar";
// import { useUser } from "@clerk/clerk-react";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Download, FileText } from "lucide-react";
// import { translateText } from "@/utils/translateText";
// import { decodeHtml } from "@/utils/decodeHTML";
// import { downloadReportPDF } from "@/utils/downloadReportPDF";
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export default function Reports() {
//   const [students, setStudents] = useState([]);
//   const [selectedStudentId, setSelectedStudentId] = useState("");
//   const [month, setMonth] = useState("May 2025");

//   const [comment, setComment] = useState("");
//   const [editingComment, setEditingComment] = useState(false);

//   const [reportEn, setReportEn] = useState("");
//   const [reportAr, setReportAr] = useState("");

//   const [editing, setEditing] = useState(false);
//   const [activeLang, setActiveLang] = useState("en");

//   const [loading, setLoading] = useState(false);
//   const [translating, setTranslating] = useState(false);

//   const { user } = useUser();
//   const teacherName = user?.fullName || "Teacher";

//   // Load students on mount
//   useEffect(() => {
//     const fetchStudents = async () => {
//       const res = await axios.get(`${BASE_URL}/students`);
//       setStudents(res.data);
//       if (res.data.length > 0) setSelectedStudentId(res.data[0].id);
//     };
//     fetchStudents();
//   }, []);

//   // Load report + comment for selected student/month
//   useEffect(() => {
//     if (!selectedStudentId) return;
//     const fetchDetails = async () => {
//       const res = await axios.get(`${BASE_URL}/reports`, {
//         params: { student_id: selectedStudentId, month },
//       });
//       setComment(res.data?.teacher_comment || "");
//       setReportEn(res.data?.content || "");
//       setReportAr(res.data?.content_arabic || "");
//     };
//     fetchDetails();
//   }, [selectedStudentId, month]);

//   // Actions
//   const handleGenerateReport = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.post(`${BASE_URL}/ai-reports/generate-report`, {
//         student_id: selectedStudentId,
//         month,
//         clerk_user_id: user.id,
//       });
//       setReportEn(res.data.report);
//     } catch {
//       alert("Failed to generate report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTranslateToArabic = async () => {
//     try {
//       setTranslating(true);
//       const translated = await translateText(reportEn, "ar");
//       setReportAr(translated);

//       await axios.post(`${BASE_URL}/ai-reports/edit-arabic`, {
//         student_id: selectedStudentId,
//         month,
//         content_arabic: translated,
//       });
//     } catch {
//       alert("Failed to translate to Arabic");
//     } finally {
//       setTranslating(false);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (activeLang === "en") {
//         await axios.post(`${BASE_URL}/ai-reports/edit-content`, {
//           student_id: selectedStudentId,
//           month,
//           content: reportEn,
//           generated_by: teacherName,
//         });
//       } else {
//         await axios.post(`${BASE_URL}/ai-reports/edit-arabic`, {
//           student_id: selectedStudentId,
//           month,
//           content_arabic: reportAr,
//           generated_by: teacherName,
//         });
//       }
//       setEditing(false);
//     } catch {
//       alert("Failed to save changes");
//     }
//   };

//   const handleSaveComment = async () => {
//     try {
//       await axios.post(`${BASE_URL}/ai-reports/comment`, {
//         student_id: selectedStudentId,
//         month,
//         teacher_comment: comment,
//         generated_by: teacherName,
//       });
//       setEditingComment(false);
//     } catch {
//       alert("Failed to save comment");
//     }
//   };

//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
//           <FileText className="w-6 h-6 text-blue-600" />
//           Student Reports
//         </h1>

//         <div className="flex flex-wrap gap-4 mb-6">
//           <Select value={month} onValueChange={setMonth}>
//             <SelectTrigger className="w-[160px]">
//               <SelectValue placeholder="Month" />
//             </SelectTrigger>
//             <SelectContent>
//               {["March 2025", "April 2025", "May 2025", "June 2025", "July 2025"].map((m) => (
//                 <SelectItem key={m} value={m}>{m}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
//             <SelectTrigger className="w-[220px]">
//               <SelectValue placeholder="Student" />
//             </SelectTrigger>
//             <SelectContent>
//               {students.map((s) => (
//                 <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Teacher Comment */}
//         <div className="mb-6">
//           <h2 className="font-semibold text-lg mb-2">Teacher's Comment</h2>
//           {editingComment ? (
//             <>
//               <textarea
//                 className="w-full border p-2 rounded"
//                 rows={3}
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//               />
//               <div className="mt-2 flex gap-2">
//                 <Button className="bg-green-600 text-white" onClick={handleSaveComment}>Save</Button>
//                 <Button variant="outline" onClick={() => setEditingComment(false)}>Cancel</Button>
//               </div>
//             </>
//           ) : (
//             <div className="flex justify-between gap-2">
//               <p className="border bg-gray-50 p-3 rounded w-full whitespace-pre-line">
//                 {comment || <em>Add a comment for this student.</em>}
//               </p>
//               <Button className="bg-blue-600 text-white" onClick={() => setEditingComment(true)}>Edit</Button>
//             </div>
//           )}
//         </div>

//         {/* AI Report */}
//         <div>
//           <h2 className="font-semibold text-lg mb-2">AI Report</h2>
//           <Button
//             onClick={handleGenerateReport}
//             disabled={loading}
//             className="mb-3 bg-blue-600 text-white"
//           >
//             {loading ? "Generating..." : "Generate AI Report"}
//           </Button>

//           <Button
//   onClick={() =>
//     downloadReportPDF(
//       students.find((s) => s.id === selectedStudentId)?.name || "Student",
//       month,
//       report || "No English report yet.",
//       translatedReport || "No Arabic report yet."
//     )
//   }
// >
//   Download PDF
// </Button>

//           <div className="flex gap-2 mb-2">
//             <Button
//               variant={activeLang === "en" ? "default" : "outline"}
//               onClick={() => setActiveLang("en")}
//             >
//               English
//             </Button>
//             <Button
//               variant={activeLang === "ar" ? "default" : "outline"}
//               onClick={() => setActiveLang("ar")}
//             >
//               Arabic
//             </Button>
//           </div>

//           <div className="border bg-white p-4 rounded shadow min-h-[150px]">
//             {editing ? (
//               <>
//                 <textarea
//                   className="w-full border p-2 rounded"
//                   rows={8}
//                   value={activeLang === "en" ? reportEn : reportAr}
//                   onChange={(e) =>
//                     activeLang === "en"
//                       ? setReportEn(e.target.value)
//                       : setReportAr(e.target.value)
//                   }
//                 />
//                 <div className="mt-2 flex gap-2">
//                   <Button className="bg-green-600 text-white" onClick={handleSave}>Save</Button>
//                   <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="whitespace-pre-line mb-2">
//                   {activeLang === "en"
//                     ? reportEn || <em>No English report yet.</em>
//                     : reportAr
//                     ? decodeHtml(reportAr)
//                     : <em>No Arabic report yet.</em>}
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                   className="bg-blue-600 text-white"
//                     onClick={() => setEditing(true)}
//                     disabled={activeLang === "ar" && !reportAr && !translating}
//                   >
//                     Edit
//                   </Button>

//                   {activeLang === "ar" && !reportAr && (
//                     <Button
//                       className="bg-blue-600 text-white"
//                       onClick={handleTranslateToArabic}
//                       disabled={translating}
//                     >
//                       {translating ? "Translating..." : "Translate to Arabic"}
//                     </Button>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


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
import { Download, FileText } from "lucide-react";
import { translateText } from "@/utils/translateText";
import { decodeHtml } from "@/utils/decodeHTML";
import { downloadReportPDF } from "@/utils/downloadReportPDF";
import { downloadStudentStylePNG } from "@/utils/downloadReportPNG";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Reports() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [month, setMonth] = useState("May 2025");

  const [comment, setComment] = useState("");
  const [editingComment, setEditingComment] = useState(false);

  const [reportEn, setReportEn] = useState("");
  const [reportAr, setReportAr] = useState("");

  const [editing, setEditing] = useState(false);
  const [activeLang, setActiveLang] = useState("en");

  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);

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
      const res = await axios.get(`${BASE_URL}/reports`, {
        params: { student_id: selectedStudentId, month },
      });
      setComment(res.data?.teacher_comment || "");
      setReportEn(res.data?.content || "");
      setReportAr(res.data?.content_arabic || "");
    };
    fetchDetails();
  }, [selectedStudentId, month]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/ai-reports/generate-report`, {
        student_id: selectedStudentId,
        month,
        clerk_user_id: user.id,
      });
      setReportEn(res.data.report);
    } catch {
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateToArabic = async () => {
    try {
      setTranslating(true);
      const translated = await translateText(reportEn, "ar");
      setReportAr(translated);

      await axios.post(`${BASE_URL}/ai-reports/edit-arabic`, {
        student_id: selectedStudentId,
        month,
        content_arabic: translated,
      });
    } catch {
      alert("Failed to translate to Arabic");
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async () => {
    try {
      if (activeLang === "en") {
        await axios.post(`${BASE_URL}/ai-reports/edit-content`, {
          student_id: selectedStudentId,
          month,
          content: reportEn,
          generated_by: teacherName,
        });
      } else {
        await axios.post(`${BASE_URL}/ai-reports/edit-arabic`, {
          student_id: selectedStudentId,
          month,
          content_arabic: reportAr,
          generated_by: teacherName,
        });
      }
      setEditing(false);
    } catch {
      alert("Failed to save changes");
    }
  };

  const handleSaveComment = async () => {
    try {
      await axios.post(`${BASE_URL}/ai-reports/comment`, {
        student_id: selectedStudentId,
        month,
        teacher_comment: comment,
        generated_by: teacherName,
      });
      setEditingComment(false);
    } catch {
      alert("Failed to save comment");
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
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teacher Comment */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Teacher's Comment</h2>
          {editingComment ? (
            <>
              <textarea
                className="w-full border p-2 rounded"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button className="bg-green-600 text-white" onClick={handleSaveComment}>Save</Button>
                <Button variant="outline" onClick={() => setEditingComment(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <div className="flex justify-between gap-2">
              <p className="border bg-gray-50 p-3 rounded w-full whitespace-pre-line">
                {comment || <em>Add a comment for this student.</em>}
              </p>
              <Button className="bg-blue-600 text-white" onClick={() => setEditingComment(true)}>Edit</Button>
            </div>
          )}
        </div>

        {/* AI Report */}
        <div>
          <h2 className="font-semibold text-lg mb-2">AI Report</h2>

          <div className="flex items-center gap-2 mb-3">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-blue-600 text-white"
            >
              {loading ? "Generating..." : "Generate AI Report"}
            </Button>

            {/* PDF Download */}
            {/* <Button
              onClick={() =>
                downloadReportPDF(
                  students.find((s) => s.id === selectedStudentId)?.name || "Student",
                  month,
                  reportEn || "No English report yet.",
                  reportAr || "No Arabic report yet."
                )
              }
              variant="outline"
              className="bg-blue-600 text-white"
            >
              <Download className="w-5 h-5" />
            </Button> */}
            
            {/* PNG Download */}
            <Button
              onClick={() =>
                downloadStudentStylePNG(
                  "studentStyleReport",
                  students.find((s) => s.id === selectedStudentId)?.name || "Student",
                  month
                )
              }
              className="bg-blue-600 text-white"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-2 mb-2">
            <Button
              variant={activeLang === "en" ? "default" : "outline"}
              onClick={() => setActiveLang("en")}
            >
              English
            </Button>
            <Button
              variant={activeLang === "ar" ? "default" : "outline"}
              onClick={() => setActiveLang("ar")}
            >
              Arabic
            </Button>
          </div>

          <div className="border bg-white p-4 rounded shadow min-h-[150px]">
            {editing ? (
              <>
                <textarea
                  className="w-full border p-2 rounded"
                  rows={8}
                  value={activeLang === "en" ? reportEn : reportAr}
                  onChange={(e) =>
                    activeLang === "en"
                      ? setReportEn(e.target.value)
                      : setReportAr(e.target.value)
                  }
                />
                <div className="mt-2 flex gap-2">
                  <Button className="bg-green-600 text-white" onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <div className="whitespace-pre-line mb-2">
                  {activeLang === "en"
                    ? reportEn || <em>No English report yet.</em>
                    : reportAr
                    ? decodeHtml(reportAr)
                    : <em>No Arabic report yet.</em>}
                </div>
                <div className="flex gap-2">
              <Button
                className="bg-blue-600 text-white"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>

              {activeLang === "ar" && (
                <Button
                  className="bg-blue-600 text-white"
                  onClick={handleTranslateToArabic}
                  disabled={translating}
                >
                  {translating
                    ? reportAr
                      ? "Retranslating..."
                      : "Translating..."
                    : reportAr
                    ? "Retranslate to Arabic"
                    : "Translate to Arabic"}
                </Button>
              )}
            </div>

              </>
            )}
          </div>
        </div>
        {/* Hidden student style for PNG */}
        <div
          id="studentStyleReport"
          className="hidden p-8 max-w-[700px] mx-auto bg-white text-black rounded shadow"
        >
          <p className="whitespace-pre-line">{reportEn || "No English report yet."}</p>

          {reportAr && (
            <>
              <h3 className="mt-6 font-bold">Arabic Version:</h3>
              <p dir="rtl" className="whitespace-pre-line">{decodeHtml(reportAr)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
