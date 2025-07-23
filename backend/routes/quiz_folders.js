import express from 'express';
import supabase from '../config/supabaseClient.js';
import { getTeacherByClerkId } from '../utils/helpers.js';

const router = express.Router();

// GET all folders for a given teacher
router.get('/', async (req, res) => {
  const { clerk_user_id } = req.query;

  if (!clerk_user_id) {
    return res.status(400).json({ error: 'Missing clerk_user_id' });
  }

  try {
    const teacher = await getTeacherByClerkId(clerk_user_id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { data: folders, error } = await supabase
      .from('quiz_folders')
      .select('*')
      .eq('teacher_id', teacher.id);

    if (error) {
      console.error('Error fetching folders:', error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json(folders);
  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// POST create new folder and assign quizzes to it
router.post('/', async (req, res) => {
  const { folder_name, quiz_ids, clerk_user_id } = req.body;

  if (!folder_name || !Array.isArray(quiz_ids) || !clerk_user_id) {
    return res.status(400).json({ error: 'Missing required fields: folder_name, quiz_ids, clerk_user_id' });
  }

  try {
    const teacher = await getTeacherByClerkId(clerk_user_id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Insert the folder
    const { data: folder, error: folderError } = await supabase
      .from('quiz_folders')
      .insert([{ folder_name, teacher_id: teacher.id }])
      .select()
      .single();

    if (folderError) {
      console.error('Error creating folder:', folderError.message);
      return res.status(500).json({ error: folderError.message });
    }

    // Insert folder-to-quiz mappings
    const quizFolderEntries = quiz_ids.map(quiz_id => ({
      folder_id: folder.id,
      quiz_id
    }));

    const { error: mappingError } = await supabase
      .from('quiz_folder_quizzes')
      .insert(quizFolderEntries);

    if (mappingError) {
      console.error('Error mapping quizzes to folder:', mappingError.message);
      return res.status(500).json({ error: mappingError.message });
    }

    res.status(201).json(folder);
  } catch (err) {
    console.error('Unexpected server error:', err.message);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;
