// backend/routes/teachers.js
import express from 'express';
import supabase from '../supabaseClient.js';

const router = express.Router();


// POST /teachers
router.post('/teachers', async (req, res) => {
  const { name, email, clerk_user_id } = req.body;

  if (!name || !email || !clerk_user_id) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Check if teacher already exists
  const { data: existing, error: findError } = await supabase
    .from('teachers')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });

  if (existing) {
    return res.status(200).json({ success: true, message: 'Teacher already exists', data: existing });
  }

  const { data, error } = await supabase
    .from('teachers')
    .insert([{ name, email, clerk_user_id }]);

  if (error) {
    console.error("❌ Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true, data });
});


// GET /teachers/by-clerk-id?clerk_user_id=...
router.get('/by-clerk-id', async (req, res) => {
  const { clerk_user_id } = req.query;

  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('clerk_user_id', clerk_user_id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data || null);
});

export default router;
