

// stats.js
import express from 'express';
import supabase from '../supabaseClient.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const moodSupabase = createClient(
  process.env.MOOD_DB_URL,
  process.env.MOOD_DB_KEY
);

// Helper: get current month label like "June 2025"
function getCurrentMonthLabel() {
  const now = new Date();
  return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
}

// // ✅ Mood Summary from External DB
// router.get('/mood-summary', async (req, res) => {
//   const monthLabel = req.query.month || getCurrentMonthLabel();
//   console.log("🌈 mood-summary called:", { month: monthLabel });

//   try {
//     const [monthName, year] = monthLabel.split(" ");
//     const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
//     const formattedMonth = `${year}-${monthIndex.toString().padStart(2, '0')}`;

//     const { data, error } = await moodSupabase
//       .from('mood_entries')
//       .select('mood, timestamp');

//     if (error) {
//       console.error("❌ Supabase mood fetch error:", error);
//       return res.status(500).json({ error: error.message });
//     }

//     const filtered = data.filter(entry => entry.timestamp.startsWith(formattedMonth));

//     const moodCounts = {};
//     for (const entry of filtered) {
//       moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
//     }

//     res.json(moodCounts);
//   } catch (err) {
//     console.error("🔥 Unexpected mood summary error:", err);
//     res.status(500).json({ error: 'Unexpected server error' });
//   }
// });

// ✅ Mood Summary with day/week/month filters
router.get('/mood-summary', async (req, res) => {
  const type = req.query.type || 'month';
  const now = new Date();

  try {
    const { data, error } = await moodSupabase
      .from('mood_entries')
      .select('mood, timestamp');

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    let filtered = [];

    if (type === 'today') {
      const today = now.toISOString().split('T')[0];
      filtered = data.filter(entry => entry.timestamp.startsWith(today));
    } else if (type === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      filtered = data.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= start && entryDate <= end;
      });
    } else {
      // Default: month
      const [monthName, year] = (req.query.month || getCurrentMonthLabel()).split(" ");
      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
      const formattedMonth = `${year}-${monthIndex.toString().padStart(2, '0')}`;

      filtered = data.filter(entry => entry.timestamp.startsWith(formattedMonth));
    }

    const moodCounts = {};
    for (const entry of filtered) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }

    res.json(moodCounts);
  } catch (err) {
    console.error("🔥 Unexpected mood summary error:", err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// ✅ Weekly Attendance
router.get('/attendance/weekly', async (req, res) => {
  const { group_id, week_start } = req.query;
  if (!group_id || !week_start) return res.status(400).json({ error: 'Missing group_id or week_start' });

  const startDate = new Date(week_start);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const { data, error } = await supabase
    .from('attendance_entries')
    .select('date, status')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .eq('group_id', group_id);

  if (error) return res.status(500).json({ error: error.message });

  const resultMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
  data.forEach(entry => {
    const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' });
    if (entry.status === 'P' && resultMap[day] !== undefined) resultMap[day]++;
  });

  const result = Object.entries(resultMap).map(([day, present]) => ({ day, present }));
  res.json(result);
});

// ✅ Monthly Assessments by Category
// router.get('/assessments/monthly-categories', async (req, res) => {
//   const { group_id, month } = req.query;
//   if (!group_id || !month) return res.status(400).json({ error: 'Missing group_id or month' });

//   const { data, error } = await supabase
//     .from('assessment_scores')
//     .select('category, raw_score, max_score, students!inner(id, group_id)')
//     .eq('month', month)
//     .eq('students.group_id', group_id);

//   if (error) return res.status(500).json({ error: error.message });

//   const categoryStats = {};
//   data.forEach(score => {
//     const cat = score.category;
//     if (!categoryStats[cat]) categoryStats[cat] = { total: 0, max: 0 };
//     categoryStats[cat].total += score.raw_score;
//     categoryStats[cat].max += score.max_score;
//   });

//   const result = Object.entries(categoryStats).map(([category, { total, max }]) => ({
//     category,
//     percentage: max ? Math.round((total / max) * 100) : 0
//   }));

//   res.json(result);
// });
router.get('/assessments/monthly-categories', async (req, res) => {
  const { group_id, month } = req.query;
  if (!group_id || !month) return res.status(400).json({ error: 'Missing group_id or month' });

  const { data, error } = await supabase
  .from('assessment_scores')
  .select('category, language, raw_score, max_score, students!inner(id, group_id)')
  .eq('month', month)
  .eq('students.group_id', group_id);

  if (error) return res.status(500).json({ error: error.message });

  const categoryStats = {};

  data.forEach(({ category, language, raw_score, max_score }) => {
    if (!categoryStats[category]) categoryStats[category] = {};
    if (!categoryStats[category][language]) categoryStats[category][language] = { total: 0, max: 0 };

    categoryStats[category][language].total += raw_score;
    categoryStats[category][language].max += max_score;
  });

  const result = Object.entries(categoryStats).map(([category, langs]) => {
    const entry = { category };
    for (const lang in langs) {
      const { total, max } = langs[lang];
      entry[lang] = max ? Math.round((total / max) * 100) : 0;
    }
    return entry;
  });

  res.json(result);
});



export default router;
