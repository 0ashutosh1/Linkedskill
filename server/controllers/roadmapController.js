const Roadmap = require('../models/Roadmap');
const Notification = require('../models/Notification');
const groq = require('../config/groq');

// Generate AI roadmap using Groq
const generateAIRoadmap = async (careerGoal, duration) => {
  try {
    console.log(`🤖 Calling Groq AI for: ${careerGoal} (${duration} weeks)`);
    
    const prompt = `Create a detailed ${duration}-week learning roadmap for someone who wants to become a ${careerGoal}.

Requirements:
- Break down the learning path into exactly ${duration} weeks
- Each week should have 3-5 specific, actionable tasks
- Each task should include a title, description, and estimated hours (2-8 hours)
- Progress from beginner to intermediate to advanced topics
- Include practical projects and hands-on tasks
- Make it realistic and achievable

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "description": "Brief description of the roadmap",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week title",
      "description": "What this week focuses on",
      "tasks": [
        {
          "taskId": "week1_task1",
          "title": "Task title",
          "description": "Detailed task description",
          "estimatedHours": 4,
          "completed": false
        }
      ],
      "completed": false
    }
  ]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert career advisor and curriculum designer. You create practical, actionable learning roadmaps. Always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 8000
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '';
    console.log('📝 Groq AI Response received, parsing...');
    
    // Clean response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }
    
    const aiRoadmap = JSON.parse(cleanedResponse);
    console.log(`✅ Generated roadmap with ${aiRoadmap.weeks.length} weeks`);
    
    return aiRoadmap;
  } catch (error) {
    console.error('❌ Error generating AI roadmap:', error.message);
    console.log('⚠️ Falling back to template roadmap');
    
    // Fallback to template if AI fails
    const weeks = [];
    const tasksPerWeek = Math.max(3, Math.ceil(15 / duration));
    
    for (let i = 1; i <= duration; i++) {
      const weekTasks = [];
      const phase = i <= duration/3 ? 'Foundation' : i <= 2*duration/3 ? 'Intermediate' : 'Advanced';
      
      for (let j = 1; j <= tasksPerWeek; j++) {
        weekTasks.push({
          taskId: `week${i}_task${j}`,
          title: `${phase} Task ${j}`,
          description: `Complete this ${phase.toLowerCase()} milestone for ${careerGoal}`,
          estimatedHours: Math.floor(Math.random() * 5) + 3,
          completed: false
        });
      }
      
      weeks.push({
        weekNumber: i,
        title: `Week ${i} - ${phase} Phase`,
        description: `Focus on ${phase.toLowerCase()} concepts and skills for ${careerGoal}`,
        tasks: weekTasks,
        completed: false
      });
    }
    
    return {
      description: `A comprehensive ${duration}-week roadmap to become a ${careerGoal}`,
      weeks
    };
  }
};

// Create new roadmap
exports.createRoadmap = async (req, res) => {
  try {
    const { careerGoal, duration } = req.body;
    const userId = req.user.sub;
    
    if (!careerGoal || !duration) {
      return res.status(400).json({ error: 'Career goal and duration are required' });
    }
    
    if (duration < 1 || duration > 52) {
      return res.status(400).json({ error: 'Duration must be between 1 and 52 weeks' });
    }
    
    // Allow multiple active roadmaps - users can pursue multiple career goals
    console.log(`🤖 Generating AI roadmap for: ${careerGoal} (${duration} weeks)`);
    
    // Generate AI roadmap
    const aiRoadmap = await generateAIRoadmap(careerGoal, duration);
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (duration * 7));
    
    const newRoadmap = new Roadmap({
      userId,
      careerGoal,
      description: aiRoadmap.description,
      duration,
      startDate,
      endDate,
      weeks: aiRoadmap.weeks,
      currentWeek: 1,
      overallProgress: 0,
      status: 'active'
    });
    
    await newRoadmap.save();
    
    // Send welcome notification
    const welcomeNotification = new Notification({
      type: 'roadmap_created',
      message: `🎯 Your roadmap to become a ${careerGoal} is ready! Start your journey today.`,
      receiverId: userId,
      senderId: userId, // Self-notification
      priority: 'high'
    });
    
    await welcomeNotification.save();
    
    console.log(`✅ Roadmap created successfully for user ${userId}`);
    
    res.status(201).json({ 
      message: 'Roadmap created successfully',
      roadmap: newRoadmap
    });
  } catch (err) {
    console.error('❌ Error creating roadmap:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get user's active roadmap
exports.getMyRoadmap = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const roadmap = await Roadmap.findOne({ 
      userId, 
      status: 'active' 
    });
    
    if (!roadmap) {
      return res.status(404).json({ error: 'No active roadmap found' });
    }
    
    res.json({ roadmap });
  } catch (err) {
    console.error('Error fetching roadmap:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all user roadmaps
exports.getAllMyRoadmaps = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const roadmaps = await Roadmap.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json({ roadmaps });
  } catch (err) {
    console.error('Error fetching roadmaps:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get specific roadmap by ID
exports.getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    
    const roadmap = await Roadmap.findOne({ _id: id, userId });
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    
    res.json({ roadmap });
  } catch (err) {
    console.error('Error fetching roadmap:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update task completion
exports.updateTaskCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekNumber, taskId, completed } = req.body;
    const userId = req.user.sub;
    
    const roadmap = await Roadmap.findOne({ _id: id, userId });
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    
    const week = roadmap.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) {
      return res.status(404).json({ error: 'Week not found' });
    }
    
    const task = week.tasks.find(t => t.taskId === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const wasCompleted = task.completed;
    task.completed = completed;
    task.completedAt = completed ? new Date() : null;
    
    // Award points for completion
    if (completed && !wasCompleted) {
      const pointsAwarded = 10; // Base points per task
      roadmap.totalPoints += pointsAwarded;
      roadmap.pointsThisWeek += pointsAwarded;
      
      // Update streak
      roadmap.updateStreak();
      
      // Bonus points for streak
      if (roadmap.streak >= 7) {
        roadmap.totalPoints += 50; // Weekly streak bonus
      }
      
      // Send encouragement notification
      const notification = new Notification({
        type: 'roadmap_task_completed',
        message: `🎉 Great job! You earned ${pointsAwarded} points. Keep up the streak!`,
        receiverId: userId,
        senderId: userId, // Self-notification
        priority: 'normal'
      });
      await notification.save();
    }
    
    // Check if week is completed
    const allTasksCompleted = week.tasks.every(t => t.completed);
    if (allTasksCompleted && !week.completed) {
      week.completed = true;
      week.completedAt = new Date();
      roadmap.totalPoints += 50; // Week completion bonus
      
      // Send week completion notification
      const weekNotification = new Notification({
        type: 'roadmap_task_completed',
        message: `🏆 Week ${weekNumber} completed! You earned 50 bonus points!`,
        receiverId: userId,
        senderId: userId, // Self-notification
        priority: 'high'
      });
      await weekNotification.save();
    }
    
    // Update overall progress
    roadmap.overallProgress = roadmap.calculateProgress();
    
    // Check if roadmap is completed
    if (roadmap.overallProgress === 100 && roadmap.status === 'active') {
      roadmap.status = 'completed';
      roadmap.totalPoints += 500; // Completion bonus
      
      const completionNotification = new Notification({
        type: 'roadmap_task_completed',
        message: `🎊 Congratulations! You've completed your ${roadmap.careerGoal} roadmap! You earned 500 bonus points!`,
        receiverId: userId,
        senderId: userId, // Self-notification
        priority: 'high'
      });
      await completionNotification.save();
    }
    
    await roadmap.save();
    
    res.json({ 
      message: 'Task updated successfully',
      roadmap,
      pointsAwarded: completed && !wasCompleted ? 10 : 0
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update roadmap status
exports.updateRoadmapStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.sub;
    
    if (!['active', 'paused', 'abandoned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const roadmap = await Roadmap.findOne({ _id: id, userId });
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    
    roadmap.status = status;
    await roadmap.save();
    
    res.json({ 
      message: 'Roadmap status updated',
      roadmap
    });
  } catch (err) {
    console.error('Error updating roadmap status:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete roadmap
exports.deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;
    
    const roadmap = await Roadmap.findOneAndDelete({ _id: id, userId });
    
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }
    
    res.json({ message: 'Roadmap deleted successfully' });
  } catch (err) {
    console.error('Error deleting roadmap:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;
