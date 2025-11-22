import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:4000';

export default function MentoringPage({ onBack }) {
  const [step, setStep] = useState('select'); // 'select', 'create', 'view', 'list'
  const [roadmap, setRoadmap] = useState(null);
  const [allRoadmaps, setAllRoadmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Create roadmap form
  const [careerGoal, setCareerGoal] = useState('');
  const [duration, setDuration] = useState(12);
  
  // Expanded weeks
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([1]));
  
  // Popup for task completion
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDailyReminder, setShowDailyReminder] = useState(false);
  const [reminderTask, setReminderTask] = useState(null);
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRoadmapId, setDeletingRoadmapId] = useState(null);

  useEffect(() => {
    const lastViewedRoadmapId = localStorage.getItem('lastViewedRoadmap');
    if (lastViewedRoadmapId) {
      fetchRoadmapById(lastViewedRoadmapId);
    } else {
      fetchActiveRoadmap();
    }
    fetchAllRoadmaps();
  }, []);

  // Check for daily reminder when roadmap loads
  useEffect(() => {
    if (roadmap && step === 'view') {
      checkForDailyReminder();
    }
  }, [roadmap, step]);

  const checkForDailyReminder = () => {
    if (!roadmap) return;

    const currentWeek = roadmap.weeks.find(w => w.weekNumber === roadmap.currentWeek);
    if (!currentWeek) return;

    const incompleteTasks = currentWeek.tasks.filter(t => !t.completed);
    if (incompleteTasks.length > 0) {
      // Check if we've shown reminder today
      const lastShown = localStorage.getItem('lastRoadmapReminder');
      const today = new Date().toDateString();
      
      if (lastShown !== today) {
        // Show reminder for first incomplete task
        setReminderTask({
          week: currentWeek,
          task: incompleteTasks[0],
          totalIncomplete: incompleteTasks.length
        });
        setShowDailyReminder(true);
        localStorage.setItem('lastRoadmapReminder', today);
      }
    }
  };

  const fetchActiveRoadmap = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/roadmaps/my/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoadmap(data.roadmap);
        setStep('view');
      } else {
        setStep('select');
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setStep('select');
    }
  };

  const fetchAllRoadmaps = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/roadmaps/my/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllRoadmaps(data.roadmaps || []);
      }
    } catch (error) {
      console.error('Error fetching all roadmaps:', error);
    }
  };

  const fetchRoadmapById = async (roadmapId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/roadmaps/${roadmapId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoadmap(data.roadmap);
        localStorage.setItem('lastViewedRoadmap', roadmapId);
        setStep('view');
      } else {
        setMessage({ type: 'error', text: 'Failed to load roadmap' });
        // If fetch fails, try loading active roadmap instead
        fetchActiveRoadmap();
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setMessage({ type: 'error', text: 'Failed to load roadmap' });
      fetchActiveRoadmap();
    }
  };

  const deleteRoadmap = async (roadmapId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/roadmaps/${roadmapId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Roadmap deleted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        
        // If deleted roadmap was active, redirect to select
        if (roadmap && roadmap._id === roadmapId) {
          setRoadmap(null);
          setStep('select');
        }
        
        await fetchAllRoadmaps();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to delete roadmap' });
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      setMessage({ type: 'error', text: 'Failed to delete roadmap' });
    } finally {
      setShowDeleteConfirm(false);
      setDeletingRoadmapId(null);
    }
  };

  const changeRoadmap = async (roadmapId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // First, pause current active roadmap if exists
      if (roadmap && roadmap._id !== roadmapId) {
        await fetch(`${API_URL}/roadmaps/${roadmap._id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'paused' })
        });
      }
      
      // Then activate the selected roadmap
      const response = await fetch(`${API_URL}/roadmaps/${roadmapId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        await fetchRoadmapById(roadmapId);
        await fetchAllRoadmaps();
        setMessage({ type: 'success', text: 'Switched to selected roadmap!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error changing roadmap:', error);
      setMessage({ type: 'error', text: 'Failed to switch roadmap' });
    }
  };

  const createRoadmap = async () => {
    if (!careerGoal.trim()) {
      setMessage({ type: 'error', text: 'Please enter your career goal' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/roadmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ careerGoal, duration })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Roadmap created:', data.roadmap);
        setRoadmap(data.roadmap);
        setStep('view');
        setMessage({ type: 'success', text: 'Roadmap created successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to create roadmap' });
      }
    } catch (error) {
      console.error('Error creating roadmap:', error);
      setMessage({ type: 'error', text: 'Failed to create roadmap' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (weekNumber, taskId, currentStatus) => {
    try {
      if (!roadmap || !roadmap._id) {
        console.error('Roadmap ID is missing:', roadmap);
        setMessage({ type: 'error', text: 'Roadmap not found. Please refresh the page.' });
        return;
      }

      const token = localStorage.getItem('authToken');
      const url = `${API_URL}/roadmaps/${roadmap._id}/task`;
      console.log('Updating task:', { url, weekNumber, taskId, completed: !currentStatus });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weekNumber,
          taskId,
          completed: !currentStatus
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRoadmap(data.roadmap);
        
        if (!currentStatus) {
          setMessage({ type: 'success', text: `🎉 +${data.pointsAwarded} points!` });
          setTimeout(() => setMessage({ type: '', text: '' }), 2000);
        }
      } else {
        const errorData = await response.json();
        console.error('Task update failed:', errorData);
        setMessage({ type: 'error', text: errorData.error || 'Failed to update task' });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setMessage({ type: 'error', text: 'Failed to update task' });
    }
  };

  const toggleWeek = (weekNumber) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const showCompletionPopup = (week, task) => {
    setSelectedTask({ week, task });
    setShowTaskPopup(true);
  };

  const handlePopupComplete = () => {
    if (selectedTask) {
      toggleTaskCompletion(selectedTask.week.weekNumber, selectedTask.task.taskId, selectedTask.task.completed);
    }
    setShowTaskPopup(false);
    setSelectedTask(null);
  };

  // Select Step
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Career Mentoring</h1>
            <p className="text-xl text-gray-300">Your AI-Powered Roadmap to Success</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">🎯 Start Your Journey</h2>
            <p className="text-gray-300 mb-8">
              Tell us your dream career, and our AI will create a personalized roadmap with weekly goals, 
              tasks, and milestones to help you achieve it!
            </p>
            
            <button
              onClick={() => setStep('create')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                       text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 
                       shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create My Roadmap
            </button>
            
            {allRoadmaps.length > 0 && (
              <button
                onClick={() => {
                  fetchAllRoadmaps();
                  setStep('list');
                }}
                className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-xl 
                         font-bold text-lg transition-all duration-200 border border-slate-600"
              >
                View My Roadmaps ({allRoadmaps.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <h3 className="font-bold mb-2">Personalized Path</h3>
              <p className="text-sm text-gray-400">AI-generated roadmap tailored to your goals</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold mb-2">Earn Points</h3>
              <p className="text-sm text-gray-400">Stay motivated with gamification & rewards</p>
            </div>
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="font-bold mb-2">Track Progress</h3>
              <p className="text-sm text-gray-400">Visual progress bars & completion stats</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create Step
  if (step === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
        <button onClick={() => setStep('select')} className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Create Your Roadmap</h1>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 border border-red-500' : 'bg-green-500/20 border border-green-500'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">What's your dream career?</label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g., Full Stack Developer, Data Scientist, Digital Marketer..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                How many weeks to achieve your goal?
              </label>
              <div className="flex items-center gap-4 mb-2">
                <input
                  type="range"
                  min="4"
                  max="52"
                  value={duration}
                  onChange={(e) => {
                    console.log('Slider changed:', e.target.value);
                    setDuration(Number(e.target.value));
                  }}
                  className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  style={{
                    WebkitAppearance: 'none',
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((duration - 4) / 48) * 100}%, #475569 ${((duration - 4) / 48) * 100}%, #475569 100%)`
                  }}
                />
                <input
                  type="number"
                  min="4"
                  max="52"
                  value={duration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 4 && val <= 52) {
                      setDuration(val);
                    }
                  }}
                  className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">weeks</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Approximately {Math.ceil(duration / 4)} months
              </p>
            </div>

            <button
              onClick={createRoadmap}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                       text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 
                       shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Generating Roadmap...
                </span>
              ) : (
                '🚀 Generate My Roadmap'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  if (step === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
        <button onClick={() => setStep('select')} className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">My Roadmaps</h1>
            <p className="text-gray-300">Manage all your career goals in one place</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 border border-red-500' : 'bg-green-500/20 border border-green-500'}`}>
              {message.text}
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => setStep('create')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                       text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 
                       shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              + Create New Roadmap
            </button>
          </div>

          <div className="space-y-4">
            {allRoadmaps.map((rm) => (
              <div key={rm._id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{rm.careerGoal}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rm.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                        rm.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                      }`}>
                        {rm.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <div className="text-2xl font-bold text-blue-400">{rm.totalPoints}</div>
                        <div className="text-xs text-gray-400">Total Points</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <div className="text-2xl font-bold text-purple-400">{rm.overallProgress}%</div>
                        <div className="text-xs text-gray-400">Progress</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <div className="text-2xl font-bold text-orange-400">{rm.streak}</div>
                        <div className="text-xs text-gray-400">Streak</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <div className="text-2xl font-bold text-green-400">{rm.currentWeek}/{rm.weeks?.length || 0}</div>
                        <div className="text-xs text-gray-400">Weeks</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 mt-3">
                      Created: {new Date(rm.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {rm.status !== 'active' && (
                      <button
                        onClick={() => changeRoadmap(rm._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                                 font-semibold transition-all duration-200 text-sm"
                      >
                        Switch To
                      </button>
                    )}
                    {rm.status === 'active' && (
                      <button
                        onClick={() => fetchRoadmapById(rm._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg 
                                 font-semibold transition-all duration-200 text-sm"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDeletingRoadmapId(rm._id);
                        setShowDeleteConfirm(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg 
                               font-semibold transition-all duration-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {allRoadmaps.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No roadmaps yet. Create your first one!</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-red-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-red-500/20 rounded-full mb-4">
                  <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Delete Roadmap?</h3>
                <p className="text-gray-400">This action cannot be undone. All your progress will be lost.</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => deleteRoadmap(deletingRoadmapId)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl 
                           font-bold transition-all duration-200"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingRoadmapId(null);
                  }}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-gray-300 px-6 py-3 rounded-xl 
                           font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View Roadmap
  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const currentWeek = roadmap.weeks.find(w => w.weekNumber === roadmap.currentWeek) || roadmap.weeks[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Task Completion Popup */}
      {showTaskPopup && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="inline-block p-4 bg-purple-500/20 rounded-full mb-4">
                <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Complete This Task?</h3>
              <p className="text-gray-300 mb-2">{selectedTask.task.title}</p>
              <p className="text-sm text-gray-400 mb-6">{selectedTask.task.description}</p>
              
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                <p className="text-lg font-semibold">You'll earn <span className="text-blue-400 text-2xl">+10 points</span></p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTaskPopup(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePopupComplete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                           rounded-lg font-semibold transition shadow-lg"
                >
                  ✓ Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
        
        <button
          onClick={() => {
            fetchAllRoadmaps();
            setStep('list');
          }}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg 
                   font-semibold transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
          My Roadmaps
        </button>
      </div>

      {message.text && (
        <div className={`max-w-7xl mx-auto mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 border border-red-500' : 'bg-green-500/20 border border-green-500'}`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Total Points</span>
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-blue-400">{roadmap.totalPoints}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-teal-600/20 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Progress</span>
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-green-400">{roadmap.overallProgress}%</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Current Streak</span>
              <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-orange-400">{roadmap.streak} days</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Week</span>
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div className="text-3xl font-bold text-purple-400">{roadmap.currentWeek} / {roadmap.duration}</div>
          </div>
        </div>

        {/* Career Goal Header */}
        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50 rounded-2xl p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">🎯 {roadmap.careerGoal}</h1>
          <p className="text-gray-300">{roadmap.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Started: {new Date(roadmap.startDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Target: {new Date(roadmap.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Overall Progress</h3>
            <span className="text-2xl font-bold text-blue-400">{roadmap.overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-full"
              style={{ width: `${roadmap.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Weekly Roadmap */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">📅 Weekly Roadmap</h2>
          
          {roadmap.weeks.map((week) => {
            const isExpanded = expandedWeeks.has(week.weekNumber);
            const completedTasks = week.tasks.filter(t => t.completed).length;
            const totalTasks = week.tasks.length;
            const progress = Math.round((completedTasks / totalTasks) * 100);
            
            return (
              <div 
                key={week.weekNumber}
                className={`bg-slate-800/50 border rounded-xl overflow-hidden transition-all ${
                  week.completed ? 'border-green-500/50' : week.weekNumber === roadmap.currentWeek ? 'border-blue-500' : 'border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      week.completed ? 'bg-green-500 text-white' : 
                      week.weekNumber === roadmap.currentWeek ? 'bg-blue-500 text-white' : 
                      'bg-slate-700 text-gray-400'
                    }`}>
                      {week.weekNumber}
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-lg">{week.title}</h3>
                      <p className="text-sm text-gray-400">{week.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span>{completedTasks} / {totalTasks} tasks</span>
                        <div className="flex-1 max-w-xs bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full transition-all ${week.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-blue-400 font-semibold">{progress}%</span>
                      </div>
                    </div>
                  </div>
                  <svg 
                    className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-700 p-6 space-y-3">
                    {week.tasks.map((task) => (
                      <div
                        key={task.taskId}
                        className={`p-4 rounded-lg border transition-all ${
                          task.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-700/30 border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => showCompletionPopup(week, task)}
                            className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-slate-500 hover:border-blue-500'
                            }`}
                          >
                            {task.completed && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : ''}`}>
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>⏱️ {task.estimatedHours}h</span>
                              {task.completedAt && (
                                <span>✓ Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Reminder Popup */}
      {showDailyReminder && reminderTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-orange-500 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-pulse-slow">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-orange-500/20 rounded-full mb-4">
                <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">⏰ Daily Reminder!</h3>
              <p className="text-orange-400 font-semibold">Keep your streak alive! 🔥</p>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-600">
              <p className="text-gray-300 text-sm mb-3">
                You have <span className="font-bold text-orange-400">{reminderTask.totalIncomplete} pending task{reminderTask.totalIncomplete > 1 ? 's' : ''}</span> this week:
              </p>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-500/30">
                <h4 className="font-bold text-white mb-2">{reminderTask.task.title}</h4>
                <p className="text-sm text-gray-400 mb-2">{reminderTask.task.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>📅 Week {reminderTask.week.weekNumber}</span>
                  <span>⏱️ {reminderTask.task.estimatedHours}h</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowDailyReminder(false);
                  showCompletionPopup(reminderTask.week, reminderTask.task);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 
                         text-white px-6 py-4 rounded-xl font-bold transition-all duration-200 
                         shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📝 Start This Task Now
              </button>
              <button
                onClick={() => setShowDailyReminder(false)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-gray-300 px-6 py-3 rounded-xl 
                         font-semibold transition-all duration-200"
              >
                Remind Me Later
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              Current Streak: <span className="text-orange-400 font-bold">{roadmap.streak} day{roadmap.streak !== 1 ? 's' : ''}</span> 🔥
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-red-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-red-500/20 rounded-full mb-4">
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Roadmap?</h3>
              <p className="text-gray-400">This action cannot be undone. All your progress will be lost.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => deleteRoadmap(deletingRoadmapId)}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl 
                         font-bold transition-all duration-200"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingRoadmapId(null);
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-gray-300 px-6 py-3 rounded-xl 
                         font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}