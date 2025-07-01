// routes/student_answers.js
import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();

// GET all student answers
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('student_answers')
    .select('*')
    .order('response_id', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET answers by student and quiz
router.get('/student/:student_id/quiz/:quiz_id', async (req, res) => {
  const { student_id, quiz_id } = req.params;

  const { data, error } = await supabase
    .from('student_answers')
    .select('*')
    .eq('student_id', student_id)
    .eq('quiz_id', quiz_id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET a single response by ID
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('student_answers')
    .select('*')
    .eq('response_id', req.params.id)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ error: 'Response not found' });
  }

  res.json(data);
});

// POST create a new student answer
router.post('/', async (req, res) => {
  const { student_id, quiz_id, question_id, answer_id, is_correct } = req.body;

  if (!student_id || !quiz_id || !question_id || !answer_id || is_correct === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('student_answers')
    .insert([{ student_id, quiz_id, question_id, answer_id, is_correct }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PUT update a student's answer
router.put('/:id', async (req, res) => {
  const { answer_id, is_correct } = req.body;

  const { error } = await supabase
    .from('student_answers')
    .update({ answer_id, is_correct })
    .eq('response_id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// DELETE a student answer
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('student_answers')
    .delete()
    .eq('response_id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
