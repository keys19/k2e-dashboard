import express from 'express';
const router = express.Router();

let quizzes = [];
let id = 1;

/* GET all quizzes */
router.get('/', (_req, res) => res.json(quizzes));

/* GET single quiz */
router.get('/:id', (req, res) => {
  const quiz = quizzes.find(q => q.id === req.params.id);
  quiz ? res.json(quiz) : res.status(404).json({ error: 'Quiz not found' });
});

/* POST create */
router.post('/', (req, res) => {
  const { title, description, slides } = req.body;
  const newQuiz = {
    id: String(id++),
    title,
    description,
    slides: slides || [],
    createdAt: new Date()
  };
  quizzes.push(newQuiz);
  res.status(201).json(newQuiz);
});

/* PUT update */
router.put('/:id', (req, res) => {
  const idx = quizzes.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Quiz not found' });

  quizzes[idx] = { ...quizzes[idx], ...req.body };
  res.json({ ok: true });
});

/* DELETE remove */
router.delete('/:id', (req, res) => {
  quizzes = quizzes.filter(q => q.id !== req.params.id);
  res.json({ ok: true });
});

export default router;
