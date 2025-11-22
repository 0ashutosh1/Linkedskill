import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:4000';

export default function CounsellingPage({ onBack }) {
  const [step, setStep] = useState('intro'); // 'intro', 'chat', 'result'
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [counsellingResult, setCounsellingResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const messagesEndRef = useRef(null);

  const questions = [
    {
      id: 'interests',
      question: "What subjects or activities do you enjoy the most? (e.g., coding, art, sports, science, writing)",
      type: 'text'
    },
    {
      id: 'strengths',
      question: "What are you naturally good at? What do people often compliment you on?",
      type: 'text'
    },
    {
      id: 'education',
      question: "What is your current level of education? (e.g., High School, Undergraduate, Graduate)",
      type: 'text'
    },
    {
      id: 'pursuing',
      question: "Are you currently pursuing any specific field or course? If yes, what is it?",
      type: 'text'
    },
    {
      id: 'academics',
      question: "How would you rate your academic performance? (Excellent, Good, Average, Below Average)",
      type: 'text'
    },
    {
      id: 'workStyle',
      question: "Do you prefer working alone or in teams? And do you like structured environments or flexible ones?",
      type: 'text'
    },
    {
      id: 'passion',
      question: "What career field excites you the most? (e.g., Technology, Healthcare, Business, Arts, Education)",
      type: 'text'
    },
    {
      id: 'familySuggestion',
      question: "What career path does your family suggest or prefer for you?",
      type: 'text'
    },
    {
      id: 'goals',
      question: "Where do you see yourself in 5 years? What are your long-term career goals?",
      type: 'text'
    },
    {
      id: 'concerns',
      question: "What are your biggest concerns or fears about choosing a career?",
      type: 'text'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startCounselling = () => {
    setStep('chat');
    setMessages([
      {
        type: 'ai',
        text: "Hello! 👋 I'm your AI Career Counselor. I'm here to help you discover the best career path based on your interests, strengths, and goals.",
        timestamp: new Date()
      },
      {
        type: 'ai',
        text: "I'll ask you a series of questions to understand you better. Please answer honestly and take your time. Ready to begin?",
        timestamp: new Date()
      },
      {
        type: 'ai',
        text: questions[0].question,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      type: 'user',
      text: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    // Check if we have more questions
    if (currentQuestion < questions.length - 1) {
      // Move to next question
      setTimeout(() => {
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        setMessages(prev => [...prev, {
          type: 'ai',
          text: questions[nextQuestion].question,
          timestamp: new Date()
        }]);
      }, 1000);
    } else {
      // All questions answered, generate counselling
      setLoading(true);
      await generateCounselling();
    }
  };

  const generateCounselling = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Extract user responses
      const userResponses = {};
      let responseIndex = 0;
      
      messages.forEach(msg => {
        if (msg.type === 'user') {
          if (responseIndex < questions.length) {
            userResponses[questions[responseIndex].id] = msg.text;
            responseIndex++;
          }
        }
      });

      // Add the last response
      const lastResponse = userInput || messages[messages.length - 1]?.text;
      if (responseIndex < questions.length && lastResponse) {
        userResponses[questions[responseIndex].id] = lastResponse;
      }

      const response = await fetch(`${API_URL}/counselling/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ responses: userResponses })
      });

      if (response.ok) {
        const data = await response.json();
        setCounsellingResult(data.counselling);
        setStep('result');
        
        setMessages(prev => [...prev, {
          type: 'ai',
          text: "Thank you for sharing all that information! I've analyzed your responses and prepared a personalized career counselling report for you. 🎯",
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'ai',
          text: "I apologize, but I encountered an error generating your counselling. Please try again.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error generating counselling:', error);
      setMessages(prev => [...prev, {
        type: 'ai',
        text: "I apologize, but I encountered an error. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Intro Screen
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">AI Career Counselling</h1>
            <p className="text-xl text-gray-300">Discover Your Perfect Career Path</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">🎓 How It Works</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h3 className="font-bold mb-1">Answer Questions</h3>
                  <p className="text-gray-400 text-sm">Share your interests, strengths, education, and career goals</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h3 className="font-bold mb-1">AI Analysis</h3>
                  <p className="text-gray-400 text-sm">Our AI analyzes your responses using advanced algorithms</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h3 className="font-bold mb-1">Get Guidance</h3>
                  <p className="text-gray-400 text-sm">Receive personalized career recommendations and action plans</p>
                </div>
              </div>
            </div>

            <button
              onClick={startCounselling}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                       text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 
                       shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Career Counselling
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chat Screen
  if (step === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl h-[calc(100vh-200px)] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold mb-2">Career Counselling Session</h2>
              <p className="text-sm text-gray-400">
                Question {Math.min(currentQuestion + 1, questions.length)} of {questions.length}
              </p>
              <div className="mt-3 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-slate-700 text-gray-100'
                  } rounded-2xl px-6 py-4 shadow-lg`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer..."
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white 
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !userInput.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                           text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 
                           shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result Screen
  if (step === 'result' && counsellingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">Your Personalized Career Guidance</h1>
            <p className="text-xl text-gray-300">Based on Your Unique Profile</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                {counsellingResult.report}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-700">
              <button
                onClick={() => {
                  setStep('intro');
                  setMessages([]);
                  setCurrentQuestion(0);
                  setCounsellingResult(null);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl 
                         font-semibold transition-all duration-200"
              >
                Start New Session
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                         text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
