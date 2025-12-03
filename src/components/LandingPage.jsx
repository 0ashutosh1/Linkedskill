import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function LandingPage({ onGetStarted, onLogin }) {
  const [scrollY, setScrollY] = useState(0)
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Glassmorphic grid overlay */}
      <div className="fixed inset-0 z-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-slate-900/80 backdrop-blur-xl shadow-2xl border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <span className="text-white font-bold text-lg sm:text-xl">LS</span>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl blur-md opacity-50 -z-10"></div>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                LinkedSkill
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Get Started</a>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button 
                onClick={onLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base text-white hover:text-purple-400 transition-colors duration-300 font-medium"
              >
                Login
              </motion.button>
              <motion.button 
                onClick={onGetStarted}
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168, 85, 247, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16 z-10">
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-full mb-6 sm:mb-8 backdrop-blur-sm"
            >
              <span className="w-2 h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm sm:text-base text-violet-300 font-medium">🚀 Join 1,000+ Active Learners</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight px-4">
              <span className="block text-white">Transform Your Future</span>
              <span className="block mt-2 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                With Live Learning
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-8 sm:mb-12 max-w-4xl mx-auto px-4 leading-relaxed">
              Connect with verified experts in real-time. Learn through 
              <span className="text-purple-400 font-semibold"> HD video classes</span>, AI-powered career guidance, 
              personalized learning roadmaps, and direct mentorship.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 mb-12 sm:mb-16">
              <motion.button 
                onClick={onGetStarted}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto group relative px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full text-lg font-bold shadow-2xl shadow-purple-500/50 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Learning Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto group px-8 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/10 hover:border-purple-500/50 rounded-full text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                Watch Demo
              </motion.button>
            </div>

            {/* Floating Stats Cards */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto px-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                { icon: '🎓', title: '1000+', desc: 'Active Students', color: 'from-blue-500 to-cyan-500' },
                { icon: '👨‍🏫', title: '50+', desc: 'Expert Instructors', color: 'from-violet-500 to-purple-500' },
                { icon: '📚', title: '100+', desc: 'Live Classes', color: 'from-fuchsia-500 to-pink-500' },
                { icon: '⭐', title: '4.9/5', desc: 'Average Rating', color: 'from-amber-500 to-orange-500' }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="relative group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl sm:rounded-3xl transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="text-3xl sm:text-4xl mb-2">{stat.icon}</div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{stat.title}</div>
                    <div className="text-xs sm:text-sm text-gray-400">{stat.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={floatingAnimation}
              className="absolute top-20 left-10 hidden xl:block"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl opacity-20 blur-xl"></div>
            </motion.div>
            <motion.div
              animate={{...floatingAnimation, transition: {...floatingAnimation.transition, delay: 0.5}}}
              className="absolute top-40 right-10 hidden xl:block"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-pink-500 rounded-2xl opacity-20 blur-xl"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden sm:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-gray-500"
          >
            <span className="text-sm">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-full text-sm font-semibold text-violet-300 mb-4">
              ✨ FEATURES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Master Any Skill
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Built with cutting-edge technology to deliver an exceptional learning experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: '🎥',
                title: 'Live Video Classes',
                desc: 'Crystal-clear HD video sessions with interactive features for an immersive learning experience',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '💬',
                title: 'Real-Time Chat',
                desc: 'Instant messaging for seamless communication with experts before, during, and after classes',
                gradient: 'from-violet-500 to-purple-500'
              },
              {
                icon: '🔔',
                title: 'Push Notifications',
                desc: 'Never miss a class with intelligent real-time alerts for upcoming sessions and important updates',
                gradient: 'from-amber-500 to-orange-500'
              },
              {
                icon: '👥',
                title: 'Expert Network',
                desc: 'Connect with 50+ verified industry professionals and build lasting mentorship relationships',
                gradient: 'from-emerald-500 to-green-500'
              },
              {
                icon: '🤖',
                title: 'AI Career Counselling',
                desc: 'AI-powered personalized career guidance. Answer questions about your goals and receive tailored advice',
                gradient: 'from-rose-500 to-red-500'
              },
              {
                icon: '🗺️',
                title: 'AI Learning Roadmaps',
                desc: 'AI-generated weekly learning paths with tasks, points system, streak tracking, and progress monitoring',
                gradient: 'from-amber-500 to-orange-500'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-white/20 transition-all duration-300"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl sm:rounded-3xl transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  {/* Icon with gradient background */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl sm:text-4xl">{feature.icon}</span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                {/* Animated border gradient */}
                <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-full text-sm font-semibold text-violet-300 mb-4">
              🎯 HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Start Your Journey in
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              From signup to mastery, we've made learning effortless
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Animated connection line for desktop */}
            <div className="hidden lg:block absolute top-32 left-0 right-0 h-1">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-full"></div>
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 2, delay: 0.5 }}
                  className="absolute h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full"
                  viewport={{ once: true }}
                />
              </div>
            </div>

            {[
              {
                step: '01',
                title: 'Sign Up & Onboard',
                desc: 'Quick signup with role selection (Student/Expert). Complete onboarding with interests and goals. Upload profile photo and start your learning journey.',
                icon: '👤',
                color: 'from-violet-500 to-purple-500',
                features: ['Quick signup', 'Profile customization', 'Interest tags']
              },
              {
                step: '02',
                title: 'Connect & Schedule',
                desc: 'Browse experts by category and send connection requests. Once accepted, use real-time chat to communicate and schedule video classes.',
                icon: '🤝',
                color: 'from-purple-500 to-fuchsia-500',
                features: ['Browse by category', 'Connection system', 'Real-time chat']
              },
              {
                step: '03',
                title: 'Learn & Review',
                desc: 'Attend HD video classes with interactive features. After completion, rate and review your experience to help the community.',
                icon: '🚀',
                color: 'from-fuchsia-500 to-pink-500',
                features: ['Live HD classes', 'Review system', 'Rating experts']
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.2 }}
                className="relative"
              >
                {/* Step number badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.2 + 0.3, type: "spring" }}
                  className={`absolute -top-6 left-1/2 lg:left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-2xl font-bold shadow-2xl z-10`}
                >
                  <span className="text-white">{step.step}</span>
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-lg opacity-50 -z-10`}></div>
                </motion.div>

                {/* Card */}
                <div className="relative group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-10 hover:border-white/20 transition-all duration-300 mt-8">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-6 mt-4">
                      <motion.div
                        animate={floatingAnimation}
                        transition={{ delay: idx * 0.2 }}
                        className="text-7xl sm:text-8xl"
                      >
                        {step.icon}
                      </motion.div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-400 text-center mb-6 leading-relaxed">
                      {step.desc}
                    </p>

                    {/* Features list */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {step.features.map((feature, fIdx) => (
                        <span key={fIdx} className={`px-3 py-1.5 text-sm bg-gradient-to-r ${step.color} bg-opacity-10 border border-white/10 rounded-full text-white/80`}>
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-20 blur-2xl rounded-3xl transition-opacity duration-300 -z-10`}></div>
                </div>

                {/* Arrow connector for desktop */}
                {idx < 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.2 + 0.5 }}
                    className="hidden lg:block absolute top-32 -right-6 text-4xl text-purple-500/50 z-20"
                  >
                    →
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <motion.button
              onClick={onGetStarted}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full text-lg font-bold shadow-2xl shadow-purple-500/50"
            >
              Get Started Now - It's Free!
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section id="testimonials" className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-full text-sm font-semibold text-violet-300 mb-4">
              💬 TESTIMONIALS
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Loved by Students &
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Experts Worldwide
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our thriving community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Full-Stack Developer',
                avatar: '👩‍💻',
                rating: 5,
                text: 'LinkedSkill transformed my career! I learned React from industry experts and landed my dream job within 3 months. The live sessions are incredibly engaging.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                name: 'Marcus Rodriguez',
                role: 'UX Design Mentor',
                avatar: '👨‍🎨',
                rating: 5,
                text: 'As an expert, this platform lets me share my 10+ years of experience with eager learners. The scheduling system is flawless, and the community is amazing!',
                gradient: 'from-violet-500 to-purple-500'
              },
              {
                name: 'Priya Patel',
                role: 'Data Science Student',
                avatar: '👩‍🔬',
                rating: 5,
                text: 'The quality of instructors here is unmatched. I\'ve taken 15+ classes on machine learning and AI. The real-time chat makes it feel like an in-person class.',
                gradient: 'from-fuchsia-500 to-pink-500'
              },
              {
                name: 'David Kim',
                role: 'Marketing Expert',
                avatar: '👨‍💼',
                rating: 5,
                text: 'I\'ve taught over 100 students here! The platform makes it easy to manage my schedule, and the students are genuinely invested in learning. Highly recommend!',
                gradient: 'from-emerald-500 to-green-500'
              },
              {
                name: 'Emma Wilson',
                role: 'Photography Enthusiast',
                avatar: '👩‍📷',
                rating: 5,
                text: 'From beginner to advanced photography in just 6 months! The diverse range of classes and personalized feedback from experts made all the difference.',
                gradient: 'from-amber-500 to-orange-500'
              },
              {
                name: 'Alex Thompson',
                role: 'Blockchain Developer',
                avatar: '👨‍💻',
                rating: 5,
                text: 'The future of education is here! I love how I can learn cutting-edge Web3 technologies from pioneers in the field. The community support is incredible.',
                gradient: 'from-indigo-500 to-blue-500'
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-white/20 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 rounded-2xl sm:rounded-3xl transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">⭐</span>
                    ))}
                  </div>

                  <p className="text-gray-300 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center text-2xl`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* User Types Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-full text-sm font-semibold text-violet-300 mb-4">
              👥 FOR EVERYONE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Built For Both
              <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Learners & Teachers
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Whether you want to learn or share your expertise, we've got you covered
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Students */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-md border border-blue-500/20 rounded-3xl p-8 sm:p-10 hover:border-blue-500/40 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="text-6xl sm:text-7xl mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl">
                  🎓
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  For Students
                </h3>
                <ul className="space-y-4 text-gray-300 mb-8">
                  {[
                    'HD video classes with experts',
                    'Real-time messaging',
                    'AI career counselling',
                    'Generate AI learning roadmaps',
                    'Review system for experts & classes',
                    'Profile photo upload'
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</span>
                      <span className="leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button 
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-xl"
                >
                  Start Learning Today
                </motion.button>
              </div>
            </motion.div>

            {/* For Experts */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative bg-gradient-to-br from-purple-900/20 to-fuchsia-900/20 backdrop-blur-md border border-purple-500/20 rounded-3xl p-8 sm:p-10 hover:border-purple-500/40 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="text-6xl sm:text-7xl mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-3xl">
                  👨‍🏫
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  For Experts
                </h3>
                <ul className="space-y-4 text-gray-300 mb-8">
                  {[
                    'Create & schedule classes with ease',
                    'HD video streaming',
                    'Real-time chat with students',
                    'Receive reviews & ratings',
                    'Manage student connections',
                    'Upload profile photo',
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-sm font-bold">✓</span>
                      <span className="leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button 
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 shadow-xl"
                >
                  Start Teaching Today
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-fuchsia-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-16"
          >
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full text-sm font-semibold text-violet-300 mb-6">
                  🎉 Limited Time Offer
                </span>
              </motion.div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="block text-white">Ready to Transform</span>
                <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Your Future?
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Start your learning journey with <span className="font-bold text-white">AI-powered guidance</span>, 
                <span className="font-bold text-white">live video classes</span>, and real mentorship connections.
                <span className="block mt-2 text-violet-300 font-semibold">Start your journey today - completely free!</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-10">
                <motion.button 
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(168, 85, 247, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto group relative px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl text-lg font-bold shadow-2xl shadow-purple-500/50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Started Free
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 rounded-2xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  Watch How It Works
                </motion.button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
  )
}
