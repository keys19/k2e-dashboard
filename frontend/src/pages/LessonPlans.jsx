
// File: LessonPlans.jsx - teachers
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import CategoryCard from "../components/CategoryCard";
import CategoryModal from "../components/CategoryModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function LessonPlans() {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [language, setLanguage] = useState("English");
  const [initialMetadata, setInitialMetadata] = useState({});
  const [groups, setGroups] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchAllLessonPlans = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/lesson-plans/all`);
      setLessonPlans(res.data);
    } catch (err) {
      console.error("Fetching lesson plans failed:", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error("Fetching groups failed:", err);
    }
  };

  useEffect(() => {
    fetchAllLessonPlans();
    fetchGroups();
  }, []);

  const getGroupName = (id) => {
    const match = groups.find((g) => g.id === id);
    return match ? match.name : id;
  };

  const handleCardClick = (plan) => {
    setSelectedCategory(plan.category);
    setEditingContent(plan.content);
    setInitialMetadata({
      month: plan.month,
      week: plan.week,
      group_ids: plan.group_ids,
    });
    setIsNewCategory(false);
    setModalOpen(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory("");
    setEditingContent("");
    setInitialMetadata({});
    setIsNewCategory(true);
    setModalOpen(true);
  };

  const handleDelete = (plansToDelete) => {
    setConfirmDelete({
      category: plansToDelete[0].category,
      month: plansToDelete[0].month,
      week: plansToDelete[0].week,
      language: plansToDelete[0].language,
      content: plansToDelete[0].content,
    });
  };

  const confirmDeletePlan = async () => {
    const matchingPlans = lessonPlans.filter(
      (p) =>
        p.category === confirmDelete.category &&
        p.month === confirmDelete.month &&
        p.week === confirmDelete.week &&
        p.language === confirmDelete.language &&
        p.content === confirmDelete.content
    );

    try {
      for (const plan of matchingPlans) {
        await axios.delete(`${BASE_URL}/lesson-plans/${plan.id}`);
      }
      await fetchAllLessonPlans();
      setConfirmDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleModalSave = async (entries) => {
    try {
      for (let entry of entries) {
        const res = await axios.get(`${BASE_URL}/lesson-plans`, {
          params: {
            month: entry.month,
            week: entry.week,
            language: entry.language,
            group_id: entry.groupId,
          },
        });

        const existing = res.data.find((p) => p.category === entry.header);

        if (existing) {
          await axios.put(`${BASE_URL}/lesson-plans/${existing.id}`, {
            month: entry.month,
            week: entry.week,
            week_start: entry.week_start,
            week_end: entry.week_end,
            category: entry.header,
            language: entry.language,
            content: entry.content,
          });
        } else {
          await axios.post(`${BASE_URL}/lesson-plans`, {
            month: entry.month,
            week: entry.week,
            week_start: entry.week_start,
            week_end: entry.week_end,
            category: entry.header,
            language: entry.language,
            content: entry.content,
            group_id: entry.groupId,
          });
        }
      }
      await fetchAllLessonPlans();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const groupedPlans = Array.isArray(lessonPlans)
    ? lessonPlans.reduce((acc, plan) => {
        const key = `${plan.month}-${plan.week}-${plan.category}-${plan.language}-${plan.content}`;
        if (!acc[key]) {
          acc[key] = {
            ...plan,
            group_ids: [plan.group_id],
          };
        } else {
          acc[key].group_ids.push(plan.group_id);
        }
        return acc;
      }, {})
    : {};

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold mt-4 mb-8">Lesson Planning</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                {language} <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage("English")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("Arabic")}>Arabic</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.values(groupedPlans)
            .filter((plan) => plan.language === language)
            .map((plan, index) => (
              <CategoryCard
                key={index}
                title={plan.category}
                month={plan.month}
                week={plan.week}
                groupNames={plan.group_ids.map(getGroupName)}
                onClick={() => handleCardClick(plan)}
                onEdit={() => handleCardClick(plan)}
                onDelete={() => {
                  const matchingPlans = lessonPlans.filter(
                    (p) =>
                      p.category === plan.category &&
                      p.month === plan.month &&
                      p.week === plan.week &&
                      p.language === plan.language &&
                      plan.group_ids.includes(p.group_id)
                  );
                  setConfirmDelete({ ...plan, plans: matchingPlans });
                }}
              />
            ))}
        </div>

        {modalOpen && (
          <CategoryModal
            initialHeader={selectedCategory}
            initialContent={editingContent}
            initialMetadata={initialMetadata}
            language={language}
            onClose={() => setModalOpen(false)}
            onSave={handleModalSave}
          />
        )}
        {confirmDelete && (
          <DeleteConfirmModal
            onCancel={() => setConfirmDelete(null)}
            onConfirm={confirmDeletePlan}
          />
        )}
      </div>
    </div>
  );
}

export default LessonPlans;
