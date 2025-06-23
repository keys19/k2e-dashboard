
import express from 'express';
import supabase from '../supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET attendance entries (optionally filter by month)
router.get('/', async (req, res) => {
  const { month , group_id } = req.query;

  let query = supabase
    .from("attendance_entries")
    .select("*, students(name, group_id)");

  if (month) {
    query = query.eq("month", month);
  }
  if (group_id) query = query.eq("group_id", group_id);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


// POST attendance entry (new)
router.post('/', async (req, res) => {
  const { student_id, date, status, month, country } = req.body;

  if (!student_id || !date || !status || !month || !country) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Fetch group_id from student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('group_id')
    .eq('id', student_id)
    .single();

  if (studentError || !student) {
    return res.status(404).json({ error: 'Student or group not found' });
  }

  const { data, error } = await supabase
    .from('attendance_entries')
    .insert([{
      id: uuidv4(),
      student_id,
      date,
      status,
      month,
      country,
      group_id: student.group_id
    }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: 'Attendance recorded', data });
});

// PUT update attendance status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['P', 'A', 'H'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const { error } = await supabase
    .from('attendance_entries')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error("Supabase update error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Attendance updated successfully' });
});

// Fill missing holidays for a given month
router.post('/fill-holidays', async (req, res) => {
  const { month } = req.body;
  if (!month) return res.status(400).json({ error: "Missing month" });

  const [monthName, year] = month.split(" ");
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const { data: students, error: studentErr } = await supabase
    .from("students")
    .select("id, country, group_id");

  if (studentErr) return res.status(500).json({ error: studentErr.message });

  const missingEntries = [];

  for (const student of students) {
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, monthIndex, d).toISOString().split("T")[0];

      const { data: existing, error } = await supabase
        .from("attendance_entries")
        .select("id")
        .eq("student_id", student.id)
        .eq("date", date)
        .in("status", ["P", "A"]);

      if (error) return res.status(500).json({ error: error.message });

      if (!existing || existing.length === 0) {
        missingEntries.push({
          id: uuidv4(),
          student_id: student.id,
          date,
          status: "H",
          month,
          country: student.country,
          group_id: student.group_id
        });
      }
    }
  }

  if (missingEntries.length > 0) {
    const { error: insertError } = await supabase
      .from("attendance_entries")
      .insert(missingEntries);

    if (insertError) return res.status(500).json({ error: insertError.message });
  }

  res.json({ message: `Inserted ${missingEntries.length} H entries` });
});

export default router;
