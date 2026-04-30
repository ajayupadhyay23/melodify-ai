const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

// Helper: check if error is "table not found" (tables not created yet)
function isTableMissingError(err) {
  return err?.message?.includes('schema cache') || err?.message?.includes('does not exist');
}

// ─────────────────────────────────────────────
//  CHAT HISTORY
// ─────────────────────────────────────────────

// Save a chat message pair
router.post('/chat/save', async (req, res) => {
  try {
    const { session_id, user_message, ai_reply, topic } = req.body;
    const { data, error } = await supabase
      .from('chat_history')
      .insert([{ session_id, user_message, ai_reply, topic }])
      .select();

    if (error) {
      if (isTableMissingError(error)) {
        return res.json({ success: false, setup_required: true, error: 'DB tables not set up yet. See supabase-schema.sql' });
      }
      throw error;
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('DB Error (chat/save):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent chat history
router.get('/chat/history', async (req, res) => {
  try {
    const { session_id } = req.query;
    let query = supabase
      .from('chat_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (session_id) query = query.eq('session_id', session_id);

    const { data, error } = await query;
    if (error) {
      if (isTableMissingError(error)) return res.json({ success: true, data: [], setup_required: true });
      throw error;
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('DB Error (chat/history):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
//  QUIZ RESULTS
// ─────────────────────────────────────────────

// Save a quiz result
router.post('/quiz/save', async (req, res) => {
  try {
    const { session_id, player_name, topic, score, total, level } = req.body;
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([{ session_id, player_name, topic, score, total, level }])
      .select();

    if (error) {
      if (isTableMissingError(error)) {
        return res.json({ success: false, setup_required: true, error: 'DB tables not set up yet' });
      }
      throw error;
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('DB Error (quiz/save):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get leaderboard (top 10)
router.get('/quiz/leaderboard', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      if (isTableMissingError(error)) return res.json({ success: true, data: [] });
      throw error;
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('DB Error (quiz/leaderboard):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get quiz stats for a session
router.get('/quiz/stats', async (req, res) => {
  try {
    const { session_id } = req.query;
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) return res.json({ success: true, data: [] });
      throw error;
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('DB Error (quiz/stats):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─────────────────────────────────────────────
//  GLOBAL STATS
// ─────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const [chatCount, quizCount, sessionCount] = await Promise.all([
      supabase.from('chat_history').select('*', { count: 'exact', head: true }),
      supabase.from('quiz_results').select('*', { count: 'exact', head: true }),
      supabase.from('quiz_results').select('session_id'),
    ]);

    if (isTableMissingError(chatCount.error) || isTableMissingError(quizCount.error)) {
      return res.json({
        success: true,
        stats: { total_chats: 0, total_quizzes: 0, active_learners: 0, setup_required: true }
      });
    }

    const uniqueSessions = new Set(
      (sessionCount.data || []).map((r) => r.session_id)
    ).size;

    res.json({
      success: true,
      stats: {
        total_chats: chatCount.count || 0,
        total_quizzes: quizCount.count || 0,
        active_learners: uniqueSessions,
      },
    });
  } catch (error) {
    console.error('DB Error (stats):', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
