
import express from 'express';
import supabase from '../supabaseClient.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const apiKey = process.env.OPENROUTER_API_KEY;

// Single POST /comment route with proper error handling
router.post('/comment', async (req, res) => {
  const { student_id, month, teacher_comment } = req.body;

  console.log("🔄 Received POST /comment");
  console.log("📦 Payload:", req.body);

  if (!student_id || !month || !teacher_comment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('ai_reports')
      .upsert([{ student_id, month, teacher_comment }], {
        onConflict: ['student_id', 'month']
      })
      .select();

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("✅ Comment saved:", data);
    res.json(data[0]);
  } catch (err) {
    console.error("🔥 Unexpected error in /comment:", err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Improved generate-report route
router.post('/generate-report', async (req, res) => {
  try {
    const { student_id, month, generated_by = 'ai@system',clerk_user_id  } = req.body;

    if (!student_id || !month) {
      return res.status(400).json({ error: 'Missing required fields: student_id and month' });
    }

    // Fetch student name
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('name')
      .eq('id', student_id)
      .single();

    if (studentError || !studentData) {
      console.error("Student fetch error:", studentError);
      return res.status(404).json({ error: 'Student not found' });
    }

    const { data: teacherData, error: teacherError } = await supabase
  .from('teachers')
  .select('name')
  .eq('clerk_user_id', clerk_user_id)
  .single();

  if (teacherError || !teacherData) {
    console.error("Teacher fetch error:", teacherError);
    return res.status(404).json({ error: 'Teacher not found' });
  }

  const teacherName = teacherData.name;

    // Fetch assessment scores
    const { data: scores, error: scoresError } = await supabase
      .from('assessment_scores')
      .select('category, raw_score, max_score')
      .eq('student_id', student_id)
      .eq('month', month);

    if (scoresError) {
      console.error("Scores fetch error:", scoresError);
      return res.status(500).json({ error: 'Failed to fetch assessment scores' });
    }

    // Format assessment scores
    const scoreLines = scores
      .map(s => `- ${s.category}: ${s.raw_score}/${s.max_score}`)
      .join('\n');

    // Fetch lesson plans
    const { data: plans, error: lessonError } = await supabase
      .from('lesson_plans')
      .select('category, content')
      .eq('month', month);

    if (lessonError) {
      console.error("Lesson plans fetch error:", lessonError);
      return res.status(500).json({ error: 'Failed to fetch lesson plans' });
    }

    // Process lesson plans
    const planMap = {};
    plans.forEach(p => {
      if (!planMap[p.category]) planMap[p.category] = [];
      planMap[p.category].push(p.content);
    });

    const planSummary = Object.entries(planMap)
      .map(([cat, items]) => `- ${cat}: ${[...new Set(items)].join(', ')}`)
      .join('\n');

    // Fetch teacher's comment
   const { data: commentRow, error: commentError } = await supabase
    .from('ai_reports')
    .select('teacher_comment')
    .eq('student_id', student_id)
    .eq('month', month)
    .maybeSingle();


    const teacherComment = commentRow?.teacher_comment || 'No teacher comment provided.';


    // Build AI prompt
    const prompt = `Generate a monthly student progress report for ${studentData.name} for ${month}.

Subjects covered this month include the following dynamic categories based on assessments and lesson plans:
${[...new Set([...scores.map(s => s.category), ...plans.map(p => p.category)])].join(', ')}.

Make sure you include the following sections exactly and do not skip any, for assessment scores, use numbers of score directly not the percenatge they rose by:
Assessment Scores:
${scoreLines}

Monthly Lesson Plans:
${planSummary}

Teacher Comments:
${teacherComment}

Write in super SIMPLE, CLEAR, teacher-style language. Keep it specific to the subjects above.- Frame all feedback positively — do NOT use words like "struggled", "weak", or "failed" and dont use difficult or extra fancy vocubulary.
- Emphasize effort, improvement, and areas to keep working on using encouraging phrasing only.
- Dont need to bold any text, just use simple, clear language.
- Use assessment scores and lesson plans to highlight specific achievements.
- End the report with: "Regards, ${teacherName}"`

;

console.log("API KEY:", apiKey);
console.log("REFERER:", process.env.OPENROUTER_REFERER);


    // Send to OpenRouter
    const completion = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
  role: 'system',
  content: `You are an assistant that writes simple, encouraging student progress reports for teachers based on dynamic subjects such as letters, numbers, emotions, shapes, or any other learning area. Always be positive, specific, and focus on effort and improvement in plain text only. Never use Markdown`
},{ role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.OPENROUTER_REFERER, // Replace with your actual domain
          'X-Title': 'Student Report Generator',
          'Content-Type': 'application/json'
        }
      }
    );

    const report = completion.data.choices[0].message.content;

    // Save report to DB
    const { error: saveError } = await supabase
  .from('ai_reports')
  .upsert(
    [{ student_id, month, generated_by, content: report }],
    { onConflict: ['student_id', 'month'] } // This tells Supabase to match using this composite key
  );


    if (saveError) {
      console.error("Save report error:", saveError);
      return res.status(500).json({ error: 'Failed to save report' });
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error("Generate report error:", err.response?.data || err);
    res.status(500).json({
      error: 'Failed to generate report',
      details: err.response?.data?.error || err.message
    });
  }
});

// GET route for fetching reports
router.get('/', async (req, res) => {
  const { student_id, month } = req.query;

  if (!student_id || !month) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  try {
    const { data, error } = await supabase
      .from('ai_reports')
      .select('*')
      .eq('student_id', student_id)
      .eq('month', month)
      .maybeSingle();

    if (error) {
      console.error("Fetch report error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data || {});
  } catch (err) {
    console.error("Unexpected error in GET /:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /edit-content — manually update AI-generated content
router.post('/edit-content', async (req, res) => {
  const { student_id, month, content, generated_by = 'teacher@manual' } = req.body;

  console.log("✍️ Received manual content update:", req.body);

  if (!student_id || !month || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { error } = await supabase
      .from('ai_reports')
      .upsert(
        [{ student_id, month, content, generated_by }],
        { onConflict: ['student_id', 'month'] }
      );

    if (error) {
      console.error("❌ Supabase error in edit-content:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("🔥 Unexpected error in /edit-content:", err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


export default router;