const groq = require('../config/groq');

// Generate AI counselling based on user responses
exports.generateCounselling = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { responses } = req.body;

    console.log('🤖 Generating AI counselling for user:', userId);

    // Create a comprehensive prompt for the AI
    const prompt = `You are an experienced career counselor with expertise in guiding students and professionals toward fulfilling careers. Based on the following information about a student, provide comprehensive, personalized career counselling:

Student Profile:
- Interests: ${responses.interests}
- Strengths: ${responses.strengths}
- Current Education Level: ${responses.education}
- Currently Pursuing: ${responses.pursuing || 'Nothing specific yet'}
- Academic Performance: ${responses.academics}
- Work Style: ${responses.workStyle}
- Passion Areas: ${responses.passion}
- Family Suggestions: ${responses.familySuggestion}
- 5-Year Goals: ${responses.goals}
- Concerns: ${responses.concerns}

Please provide a detailed career counselling report that includes:

1. **Career Assessment Summary**: Analyze their profile holistically

2. **Recommended Career Paths** (Top 3-5): 
   - For each career, explain why it fits their profile
   - Include required education and skills
   - Mention salary prospects and growth potential

3. **Strengths Analysis**: Highlight their key strengths and how to leverage them

4. **Areas for Development**: Skills or knowledge they should work on

5. **Action Plan**: Concrete steps they should take in the next 6-12 months

6. **Addressing Concerns**: Directly address their fears and concerns

7. **Final Advice**: Encouraging words and wisdom

Make the response warm, encouraging, and practical. Use emojis sparingly for emphasis. Format the response clearly with sections and bullet points.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert career counselor with 20+ years of experience. You provide personalized, empathetic, and actionable career guidance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
    });

    const counsellingReport = chatCompletion.choices[0]?.message?.content || 'Unable to generate counselling at this time.';

    console.log('✅ Counselling generated successfully');

    res.json({
      success: true,
      counselling: {
        report: counsellingReport,
        generatedAt: new Date()
      }
    });

  } catch (err) {
    console.error('Error generating counselling:', err);
    res.status(500).json({ error: 'Failed to generate counselling' });
  }
};

// Save counselling session (optional - for history tracking)
exports.saveCounsellingSession = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { responses, counsellingReport } = req.body;

    // TODO: Save to database if you want to track counselling history
    // For now, just return success

    res.json({ success: true, message: 'Session saved' });
  } catch (err) {
    console.error('Error saving counselling session:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
};
