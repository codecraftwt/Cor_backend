const express = require('express');
const router = express.Router();
const { getOpenRouterCompletion } = require('../openrouter');
const jwt = require('jsonwebtoken');
const Draft = require('../models/Draft');
const mongoose = require('mongoose');




router.post('/generate-press-release', async (req, res) => {
    const {
        type,
        spokespersons,
        reason,
        facts,
        company
    } = req.body;


    console.log("port_ai", process.env.OPENROUTER_API_KEY)

    if (!type || !spokespersons || !reason || !company) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = `
Write a professional press release.
Type: ${type}
Spokesperson(s): ${Array.isArray(spokespersons) ? spokespersons.join(', ') : spokespersons}
Reason: ${reason}
Facts/Quotes: ${facts || 'N/A'}
Company Description: ${company}
`;

    try {
        const aiResponse = await getOpenRouterCompletion(prompt);
        const generatedText = aiResponse.choices?.[0]?.message?.content || "No response generated.";
        res.json({ pressRelease: generatedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/generate-blog', async (req, res) => {
    const {
        topic,
        mainPoints,
        audience,
        goal,
        lengthAndTone,
        keywords
    } = req.body;

    if (!topic || !mainPoints || !audience || !goal) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = `
Write a professional blog post.
Topic: ${topic}
Main Points: ${mainPoints}
Audience: ${audience}
Goal: ${goal}
Length and Tone: ${lengthAndTone || 'N/A'}
Keywords: ${keywords || 'N/A'}
`;

    try {
        const aiResponse = await getOpenRouterCompletion(prompt);
        const generatedText = aiResponse.choices?.[0]?.message?.content || "No response generated.";
        res.json({ blog: generatedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware to authenticate and extract userId from JWT
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'No token provided' });
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.userId = user.userId;
//     next();
//   });
// }


router.post('/drafts/save', async (req, res) => {
  const { content, type, userEmail } = req.body;
  if (!content) return res.status(400).json({ error: "No content provided" });
  if (!userEmail) return res.status(400).json({ error: "No userEmail provided" });
  try {
    const draft = new Draft({ type, content, userEmail });
    await draft.save();
    res.json({ success: true, draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get drafts for authenticated user
router.get('/drafts', async (req, res) => {
  const userEmail = req.query.email; // or get from req.user if using JWT
  if (!userEmail) return res.status(400).json({ error: 'Email required' });

  const drafts = await Draft.find({ userEmail });
  res.json(drafts);
});

// Update a draft by id
router.put('/drafts/:id', async (req, res) => {
  const { id } = req.params;
  const { content, type } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid draft id' });
  }
  try {
    const updatedDraft = await Draft.findByIdAndUpdate(
      id,
      { content, type, date: Date.now() },
      { new: true }
    );
    if (!updatedDraft) return res.status(404).json({ error: 'Draft not found' });
    res.json({ success: true, draft: updatedDraft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a draft by id
router.delete('/drafts/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid draft id' });
  }
  try {
    const deletedDraft = await Draft.findByIdAndDelete(id);
    if (!deletedDraft) return res.status(404).json({ error: 'Draft not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
