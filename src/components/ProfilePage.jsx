import React from 'react'

const PROFILE_TEMPLATES = {
  default: {
    id: 'default',
    name: 'LinkedSkill Learner',
    role: 'Lifelong Learner',
    avatar: '/src/assets/placeholder.svg',
    location: 'Remote · Global',
    language: 'English (US)',
    experience: 'New to LinkedSkill',
    availability: 'Open to new pathways',
    bio: 'Start shaping your learning roadmap with curated programs, actionable feedback, and a supportive community that scales with your ambitions.',
    badges: ['Growth Mindset', 'Community Member'],
    links: {
      website: 'https://linkedskill.com',
      linkedin: '',
      twitter: '',
      youtube: ''
    },
    stats: [
      { label: 'Courses Completed', value: '12', change: '+18% vs last month' },
      { label: 'Learning Hours', value: '46h', change: '+6h this week' },
      { label: 'Active Streak', value: '8 days', change: 'Keep the momentum!' },
      { label: 'Certificates', value: '3', change: 'Next milestone unlocked soon' }
    ],
    focusAreas: [
      'Build a consistent learning routine',
      'Connect with mentors for faster feedback',
      'Apply new skills on portfolio-ready projects'
    ],
    contact: {
      email: 'hello@linkedskill.com',
      phone: '+1 (555) 000-1122',
      website: 'linkedskill.com',
      timezone: 'Flexible availability'
    },
    skills: ['Goal Setting', 'Online Collaboration', 'Research', 'Presentation'],
    currentCourses: [
      { title: 'Learning Foundations', progress: 55, nextLesson: 'Module 4 · Feedback loops', color: 'from-purple-500 to-indigo-500' },
      { title: 'Career Clarity Sprint', progress: 30, nextLesson: 'Workshop · Storytelling', color: 'from-pink-500 to-orange-500' }
    ],
    achievements: [
      { title: 'Milestone · First Certificate', date: 'Aug 2025', description: 'Completed the Starter Path and earned your first credential.' }
    ],
    activity: [
      { title: 'Updated learning goals', time: 'Today', description: 'Set three focus areas for the next 30 days.' },
      { title: 'Scheduled mentor intro chat', time: '2 days ago', description: 'Booked a session with a LinkedSkill mentor to discuss roadmap.' }
    ]
  },
  me: {
    id: 'me',
    name: 'Alex Morgan',
    role: 'Senior Frontend Engineer · LinkedSkill Mentor',
    avatar: '/src/assets/placeholder.svg',
    location: 'Austin, USA',
    experience: '6+ years experience',
    availability: 'Available for mentorship weekly',
    bio: 'Alex helps teams build accessible, high-performing web applications. At LinkedSkill, Alex leads the frontend mentorship track and coaches learners on shipping production-ready experiences.',
    badges: ['Top Mentor 2025', 'React Specialist', 'Design Systems Advocate'],
    stats: [
      { label: 'Courses Completed', value: '32', change: '+12% vs last month' },
      { label: 'Hours Mentored', value: '84h', change: '+4 sessions this week' },
      { label: 'Students Impacted', value: '128', change: '+9 in current cohort' },
      { label: 'Certificates', value: '6', change: 'Latest · Cloud Architecture' }
    ],
    focusAreas: [
      'Advanced React & TypeScript patterns',
      'Design systems & accessibility strategy',
      'Career coaching for mid-level engineers'
    ],
    contact: {
      email: 'alex.morgan@linkedskill.com',
      phone: '+1 (555) 234-7788',
      website: 'linkedskill.com/alex',
      timezone: 'Central Time (GMT-5)'
    },
    language: 'English (US)',
    links: {
      website: 'https://linkedskill.com/alex',
      linkedin: 'https://linkedin.com/in/alex',
      twitter: 'https://x.com/alex',
      youtube: 'https://youtube.com/@alex'
    },
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Design Systems', 'UI/UX'],
    currentCourses: [
      { title: 'Leading Engineering Teams', progress: 72, nextLesson: 'Module 5 · Coaching frameworks', color: 'from-purple-500 to-indigo-500' },
      { title: 'Cloud Native Frontends', progress: 45, nextLesson: 'Workshop · Deploying to edge', color: 'from-pink-500 to-orange-500' },
      { title: 'Storytelling for Engineers', progress: 20, nextLesson: 'Lesson 3 · Crafting narratives', color: 'from-emerald-500 to-teal-500' }
    ],
    achievements: [
      { title: 'Top Mentor Award', date: 'Sep 2025', description: 'Recognized for guiding 25+ learners to land new roles.' },
      { title: 'Certified React Professional', date: 'Jun 2025', description: 'Completed LinkedSkill expert certification with honors.' }
    ],
    activity: [
      { title: 'Hosted live Q&A on career pivots', time: '45m ago', description: 'Answered questions from 60+ community members and shared action plans.' },
      { title: 'Reviewed capstone project', time: 'Yesterday', description: 'Provided feedback to Jasmine on her UX case study for an EdTech platform.' },
      { title: 'Published guide · Measuring Frontend Quality', time: '2 days ago', description: 'Shared best practices for performance and accessibility metrics.' }
    ]
  },
  andrew: {
    id: 'andrew',
    name: 'Andrew Meter',
    role: 'Software Developer · FinTech',
    avatar: '/src/assets/placeholder.svg',
    location: 'Berlin, Germany',
    experience: '3+ years experience',
    availability: 'Exploring senior roles this quarter',
    bio: 'Andrew builds secure payment flows and loves pairing on refactoring sessions. Through LinkedSkill, Andrew is preparing for technical interviews and strengthening systems design skills.',
    badges: ['JavaScript Aficionado', 'Community Contributor'],
    stats: [
      { label: 'Courses Completed', value: '18', change: '+4 this quarter' },
      { label: 'Mock Interviews', value: '6', change: 'Booked 2 this week' },
      { label: 'Portfolio Projects', value: '5', change: 'Added redesign case study' },
      { label: 'Certificates', value: '4', change: 'Security Essentials earned' }
    ],
    focusAreas: [
      'Systems design fundamentals',
      'Performance profiling & optimization',
      'Interview storytelling with data'
    ],
    contact: {
      email: 'andrew.meter@linkedskill.com',
      phone: '+49 30 1234-5678',
      website: 'linkedskill.com/andrew',
      timezone: 'Central European Time (GMT+1)'
    },
    language: 'English (US)',
    links: {
      website: 'https://linkedskill.com/andrew',
      linkedin: 'https://linkedin.com/in/andrew',
      twitter: '',
      youtube: ''
    },
    skills: ['Node.js', 'React', 'Docker', 'PostgreSQL', 'System Design', 'Testing'],
    currentCourses: [
      { title: 'Systems Design Foundations', progress: 64, nextLesson: 'Module 6 · Scaling patterns', color: 'from-blue-500 to-indigo-500' },
      { title: 'Interview Storytelling Lab', progress: 40, nextLesson: 'Assignment · Craft your STAR stories', color: 'from-amber-500 to-orange-500' }
    ],
    achievements: [
      { title: 'Security Essentials Certificate', date: 'Aug 2025', description: 'Completed LinkedSkill security specialization for backend engineers.' }
    ],
    activity: [
      { title: 'Shipped A/B testing framework', time: '3h ago', description: 'Rolled out experiment tooling for checkout flow at work.' },
      { title: 'Recorded mock interview recap', time: 'Yesterday', description: 'Captured takeaways and next steps after senior panel review.' }
    ]
  },
  jeff: {
    id: 'jeff',
    name: 'Jeff Linkoln',
    role: 'Product Owner · SaaS',
    avatar: '/src/assets/placeholder.svg',
    location: 'Toronto, Canada',
    experience: '7+ years in product leadership',
    availability: 'Open to speaking engagements',
    bio: 'Jeff aligns cross-functional teams around measurable outcomes. Within LinkedSkill, Jeff mentors aspiring product managers and leads workshops on roadmap strategy.',
    badges: ['Product Strategist', 'OKR Champion'],
    stats: [
      { label: 'Workshops Led', value: '14', change: '+2 this month' },
      { label: 'Learner NPS', value: '4.9/5', change: 'Top 3% across LinkedSkill' },
      { label: 'Discovery Sprints', value: '9', change: 'Coached 3 teams recently' },
      { label: 'Certificates', value: '5', change: 'Latest · Data Storytelling' }
    ],
    focusAreas: [
      'Outcome-driven product strategy',
      'Stakeholder facilitation & storytelling',
      'Experiment design and analytics'
    ],
    contact: {
      email: 'jeff.linkoln@linkedskill.com',
      phone: '+1 (437) 555-8910',
      website: 'linkedskill.com/jeff',
      timezone: 'Eastern Time (GMT-4)'
    },
    language: 'English (US)',
    links: {
      website: 'https://linkedskill.com/jeff',
      linkedin: 'https://linkedin.com/in/jeff',
      twitter: '',
      youtube: 'https://youtube.com/@jeff'
    },
    skills: ['Product Strategy', 'User Research', 'Analytics', 'Roadmapping', 'Workshop Facilitation', 'Storytelling'],
    currentCourses: [
      { title: 'Data Storytelling for PMs', progress: 88, nextLesson: 'Capstone · Present the narrative', color: 'from-purple-600 to-blue-500' },
      { title: 'Designing Experiments', progress: 52, nextLesson: 'Module 4 · Prioritizing hypotheses', color: 'from-emerald-500 to-lime-500' }
    ],
    achievements: [
      { title: 'OKR Coach Certification', date: 'Jul 2025', description: 'Certified to lead LinkedSkill OKR bootcamps for product teams.' },
      { title: 'Product Mentor Spotlight', date: 'May 2025', description: 'Featured for supporting cross-border product squads.' }
    ],
    activity: [
      { title: 'Published roadmap template', time: '1h ago', description: 'Shared a quarterly planning canvas with the LinkedSkill community.' },
      { title: 'Led stakeholder storytelling workshop', time: 'Yesterday', description: 'Guided 40 learners through crafting outcomes-focused narratives.' }
    ]
  }
}

const CUSTOM_OPTION_VALUE = '__custom'

const HEADLINE_OPTIONS = [
  {
    group: 'Engineering & Technology',
    options: [
      { value: 'Software Developer', label: 'Software Developer' },
      { value: 'Senior Frontend Engineer · LinkedSkill Mentor', label: 'Senior Frontend Engineer · LinkedSkill Mentor' },
      { value: 'Full Stack Engineer', label: 'Full Stack Engineer' },
      { value: 'Technical Lead', label: 'Technical Lead' }
    ]
  },
  {
    group: 'Product & Design',
    options: [
      { value: 'Product Leader', label: 'Product Leader' },
      { value: 'UX Strategist', label: 'UX Strategist' },
      { value: 'Design Systems Advocate', label: 'Design Systems Advocate' }
    ]
  },
  {
    group: 'Learning & Coaching',
    options: [
      { value: 'Mentor & Coach', label: 'Mentor & Coach' },
      { value: 'Career Coach', label: 'Career Coach' },
      { value: 'Learning Architect', label: 'Learning Architect' }
    ]
  }
]

const LOCATION_OPTIONS = [
  {
    group: 'North America',
    options: [
      { value: 'Austin, USA', label: 'Austin, USA' },
      { value: 'New York, USA', label: 'New York, USA' },
      { value: 'Toronto, Canada', label: 'Toronto, Canada' }
    ]
  },
  {
    group: 'Europe',
    options: [
      { value: 'Berlin, Germany', label: 'Berlin, Germany' },
      { value: 'London, United Kingdom', label: 'London, United Kingdom' },
      { value: 'Lisbon, Portugal', label: 'Lisbon, Portugal' }
    ]
  },
  {
    group: 'Global',
    options: [
      { value: 'Remote · Global', label: 'Remote · Global' },
      { value: 'Hybrid · Multiple Regions', label: 'Hybrid · Multiple Regions' }
    ]
  }
]

const AVAILABILITY_OPTIONS = [
  {
    group: 'Mentorship',
    options: [
      { value: 'Available for mentorship weekly', label: 'Available for mentorship weekly' },
      { value: 'Open to mentorship inquiries', label: 'Open to mentorship inquiries' }
    ]
  },
  {
    group: 'Collaboration',
    options: [
      { value: 'Open to collaborations this quarter', label: 'Open to collaborations this quarter' },
      { value: 'Exploring new projects soon', label: 'Exploring new projects soon' }
    ]
  },
  {
    group: 'Limited Availability',
    options: [
      { value: 'Limited availability · Please inquire', label: 'Limited availability · Please inquire' },
      { value: 'Currently booked · Waitlist open', label: 'Currently booked · Waitlist open' }
    ]
  }
]

const flattenOptions = (groups) =>
  groups.flatMap((group) =>
    group.options.map((option) =>
      typeof option === 'string'
        ? { value: option, label: option }
        : option
    )
  )

export default function ProfilePage({ profile, onBack, onEditDetails }) {
  const resolvedProfile = React.useMemo(() => {
    if (profile?.id && PROFILE_TEMPLATES[profile.id]) {
      return { ...PROFILE_TEMPLATES[profile.id], ...profile }
    }
    if (profile) {
      return { ...PROFILE_TEMPLATES.default, ...profile }
    }
    return PROFILE_TEMPLATES.default
  }, [profile])

  const firstName = resolvedProfile.name?.split(' ')[0] || 'Learner'
  const stats = resolvedProfile.stats || []
  const skills = resolvedProfile.skills || []
  const focusAreas = resolvedProfile.focusAreas || []
  const currentCourses = resolvedProfile.currentCourses || []
  const achievements = resolvedProfile.achievements || []
  const activity = resolvedProfile.activity || []
  const contact = resolvedProfile.contact || {}
  const badges = resolvedProfile.badges || []
  const links = resolvedProfile.links || {}

  const [isEditing, setIsEditing] = React.useState(false)
  const [formState, setFormState] = React.useState(null)
  const [feedbackMessage, setFeedbackMessage] = React.useState('')

  const startEditing = React.useCallback(() => {
    const resolvedAvatar = resolvedProfile.avatar || PROFILE_TEMPLATES.default.avatar
    const resolvedHeadline = resolvedProfile.role || ''
    const resolvedLocation = resolvedProfile.location || ''
    const resolvedAvailability = resolvedProfile.availability || ''

    const headlineMatch = flattenOptions(HEADLINE_OPTIONS).find((option) => option.value === resolvedHeadline)
    const locationMatch = flattenOptions(LOCATION_OPTIONS).find((option) => option.value === resolvedLocation)
    const availabilityMatch = flattenOptions(AVAILABILITY_OPTIONS).find((option) => option.value === resolvedAvailability)

    setFormState({
      fullName: resolvedProfile.name || '',
      headline: resolvedHeadline,
      headlineChoice: headlineMatch ? headlineMatch.value : CUSTOM_OPTION_VALUE,
      headlineCustom: headlineMatch ? '' : resolvedHeadline,
      bio: resolvedProfile.bio || '',
      location: resolvedLocation,
      locationChoice: locationMatch ? locationMatch.value : CUSTOM_OPTION_VALUE,
      locationCustom: locationMatch ? '' : resolvedLocation,
      language: resolvedProfile.language || 'English (US)',
      experience: resolvedProfile.experience || '',
      availability: resolvedAvailability,
      availabilityChoice: availabilityMatch ? availabilityMatch.value : CUSTOM_OPTION_VALUE,
      availabilityCustom: availabilityMatch ? '' : resolvedAvailability,
      avatarPreview: resolvedAvatar,
      avatarFile: null,
      email: contact.email || '',
      phone: contact.phone || '',
      timezone: contact.timezone || '',
      website: links.website || contact.website || '',
      linkedin: links.linkedin || '',
      twitter: links.twitter || '',
      youtube: links.youtube || ''
    })
    setIsEditing(true)
    setFeedbackMessage('')
  }, [contact.email, contact.phone, contact.timezone, contact.website, links, resolvedProfile])

  const cancelEditing = React.useCallback(() => {
    setIsEditing(false)
    setFormState(null)
    setFeedbackMessage('')
  }, [])

  const handleChange = React.useCallback((field, value) => {
    setFormState((prev) => ({
      ...(prev || {}),
      [field]: value
    }))
  }, [])

  const handlePresetSelect = React.useCallback((field, value) => {
    setFormState((prev) => {
      if (!prev) return prev
      const choiceKey = `${field}Choice`
      const customKey = `${field}Custom`
      return {
        ...prev,
        [choiceKey]: value,
        [field]: value === CUSTOM_OPTION_VALUE ? prev[customKey] || '' : value
      }
    })
  }, [])

  const handleCustomInput = React.useCallback((field, value) => {
    setFormState((prev) => {
      if (!prev) return prev
      const customKey = `${field}Custom`
      return {
        ...prev,
        [customKey]: value,
        [field]: value
      }
    })
  }, [])

  const handleAvatarUpload = React.useCallback((event) => {
    const input = event.target
    const file = input?.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const preview = typeof reader.result === 'string' ? reader.result : ''
      setFormState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          avatarFile: file,
          avatarPreview: preview || prev.avatarPreview
        }
      })
      if (input) {
        input.value = ''
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const clearAvatar = React.useCallback(() => {
    setFormState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        avatarFile: null,
        avatarPreview: PROFILE_TEMPLATES.default.avatar
      }
    })
  }, [])

  const handleSubmit = React.useCallback((event) => {
    event.preventDefault()
    if (!formState) return

  const trimmedName = formState.fullName.trim() || resolvedProfile.name
  const cleanedAvatar = typeof formState.avatarPreview === 'string' ? formState.avatarPreview.trim() : ''
    const trimmedWebsite = formState.website?.trim() || ''
    const resolvedHeadline = formState.headline?.trim() || resolvedProfile.role || ''
    const resolvedLocation = formState.location?.trim() || resolvedProfile.location || ''
    const resolvedAvailability = formState.availability?.trim() || resolvedProfile.availability || ''
    const resolvedExperience = formState.experience?.trim() || ''
    const resolvedBio = formState.bio?.trim() || ''
    const resolvedLanguage = formState.language || 'English (US)'

    const nextProfile = {
      ...resolvedProfile,
      name: trimmedName,
      role: resolvedHeadline,
      bio: resolvedBio,
      location: resolvedLocation,
      language: resolvedLanguage,
      experience: resolvedExperience,
      availability: resolvedAvailability,
  avatar: cleanedAvatar || resolvedProfile.avatar || PROFILE_TEMPLATES.default.avatar,
      contact: {
        ...contact,
        email: formState.email?.trim() || '',
        phone: formState.phone?.trim() || '',
        website: trimmedWebsite,
        timezone: formState.timezone?.trim() || ''
      },
      links: {
        ...links,
        website: trimmedWebsite,
        linkedin: formState.linkedin?.trim() || '',
        twitter: formState.twitter?.trim() || '',
        youtube: formState.youtube?.trim() || ''
      }
    }

    if (typeof onEditDetails === 'function') {
      onEditDetails(nextProfile)
    } else {
      console.info('Updated profile details', nextProfile)
    }

    setFeedbackMessage('Details saved for your current session.')
    setIsEditing(false)
  }, [contact, formState, links, onEditDetails, resolvedProfile])

  React.useEffect(() => {
    if (isEditing) {
      startEditing()
    }
  }, [resolvedProfile, isEditing, startEditing])

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 transition hover:text-purple-700"
          onClick={onBack}
          type="button"
        >
          <span aria-hidden="true">←</span>
          Back to dashboard
        </button>

        <button
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md w-full sm:w-auto justify-center"
          onClick={isEditing ? cancelEditing : startEditing}
          type="button"
        >
          <span aria-hidden="true">{isEditing ? '✖️' : '✏️'}</span>
          {isEditing ? 'Close editor' : 'Edit personal details'}
        </button>
      </div>

      {feedbackMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedbackMessage}
        </div>
      )}

      {isEditing && formState && (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Personal details</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your public profile information. Keep it concise and focused on the value you bring.
          </p>

          <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Profile overview</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Full name</span>
                  <input
                    type="text"
                    value={formState.fullName}
                    onChange={(event) => handleChange('fullName', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="Alex Morgan"
                    required
                  />
                </label>

                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Headline</span>
                  <select
                    value={formState.headlineChoice}
                    onChange={(event) => handlePresetSelect('headline', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    {HEADLINE_OPTIONS.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value={CUSTOM_OPTION_VALUE}>Custom headline</option>
                  </select>
                  {formState.headlineChoice === CUSTOM_OPTION_VALUE && (
                    <input
                      type="text"
                      value={formState.headlineCustom}
                      onChange={(event) => handleCustomInput('headline', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                      placeholder="Describe your expertise"
                    />
                  )}
                </div>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Experience highlight</span>
                  <input
                    type="text"
                    value={formState.experience}
                    onChange={(event) => handleChange('experience', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="6+ years experience"
                  />
                </label>

                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Availability</span>
                  <select
                    value={formState.availabilityChoice}
                    onChange={(event) => handlePresetSelect('availability', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    {AVAILABILITY_OPTIONS.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value={CUSTOM_OPTION_VALUE}>Custom availability</option>
                  </select>
                  {formState.availabilityChoice === CUSTOM_OPTION_VALUE && (
                    <input
                      type="text"
                      value={formState.availabilityCustom}
                      onChange={(event) => handleCustomInput('availability', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                      placeholder="Share how others can connect"
                    />
                  )}
                </div>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Primary language</span>
                  <select
                    value={formState.language}
                    onChange={(event) => handleChange('language', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Deutsch</option>
                    <option>Español</option>
                    <option>Français</option>
                  </select>
                </label>

                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Location</span>
                  <select
                    value={formState.locationChoice}
                    onChange={(event) => handlePresetSelect('location', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    {LOCATION_OPTIONS.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value={CUSTOM_OPTION_VALUE}>Custom location</option>
                  </select>
                  {formState.locationChoice === CUSTOM_OPTION_VALUE && (
                    <input
                      type="text"
                      value={formState.locationCustom}
                      onChange={(event) => handleCustomInput('location', event.target.value)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                      placeholder="Add your location or preferred timezone"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Profile photo</span>
                  <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                        {formState.avatarPreview ? (
                          <img
                            src={formState.avatarPreview}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:shadow-md md:self-start">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        Upload new image
                      </label>
                      {formState.avatarPreview && (
                        <button
                          type="button"
                          onClick={clearAvatar}
                          className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 md:self-start"
                        >
                          Reset to default
                        </button>
                      )}
                      <p className="text-xs text-gray-400">Recommended: Square JPG or PNG, max 3MB.</p>
                    </div>
                  </div>
                </div>

                <label className="flex flex-col gap-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">Bio</span>
                  <textarea
                    value={formState.bio}
                    onChange={(event) => handleChange('bio', event.target.value)}
                    rows={4}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="Share a short introduction about your experience and goals."
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700">Contact & presence</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Email</span>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="you@linkedskill.com"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Phone</span>
                  <input
                    type="tel"
                    value={formState.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="+1 (555) 123-4567"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Website</span>
                  <input
                    type="url"
                    value={formState.website}
                    onChange={(event) => handleChange('website', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="https://linkedskill.com/alex"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">Timezone</span>
                  <input
                    type="text"
                    value={formState.timezone}
                    onChange={(event) => handleChange('timezone', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="Central Time (GMT-5)"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">LinkedIn</span>
                  <input
                    type="url"
                    value={formState.linkedin}
                    onChange={(event) => handleChange('linkedin', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="https://linkedin.com/in/username"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-gray-700">X/Twitter</span>
                  <input
                    type="url"
                    value={formState.twitter}
                    onChange={(event) => handleChange('twitter', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="https://x.com/username"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm md:col-span-2">
                  <span className="font-medium text-gray-700">YouTube</span>
                  <input
                    type="url"
                    value={formState.youtube}
                    onChange={(event) => handleChange('youtube', event.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="https://youtube.com/@username"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Save changes
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="grid gap-4 md:gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 p-6 md:p-8 text-white shadow-xl">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-white/10" />

            <div className="relative flex flex-col gap-6 md:gap-8 md:flex-row md:items-center">
              <div className="relative shrink-0 mx-auto md:mx-0">
                <div className="flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-full border-4 border-white/40 bg-white/10 backdrop-blur">
                  <img src={resolvedProfile.avatar} alt={`${resolvedProfile.name} avatar`} className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover" />
                </div>
                <span className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 md:px-3 py-1 text-xs font-semibold text-purple-600 shadow-lg whitespace-nowrap">
                  {resolvedProfile.experience}
                </span>
              </div>

              <div className="md:flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">{resolvedProfile.name}</h1>
                <p className="mt-2 text-base md:text-lg text-white/80">{resolvedProfile.role}</p>

                <div className="mt-3 md:mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-sm text-white/80">
                  <span className="inline-flex items-center gap-2">
                    <span role="img" aria-hidden="true">📍</span>
                    {resolvedProfile.location}
                  </span>
                  {contact.timezone && (
                    <span className="inline-flex items-center gap-2">
                      <span role="img" aria-hidden="true">⏰</span>
                      {contact.timezone}
                    </span>
                  )}
                </div>

                {badges.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {badges.map((badge) => (
                      <span key={badge} className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative mt-6 md:mt-8 grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl md:rounded-2xl border border-white/20 bg-white/10 p-3 md:p-4">
                  <div className="text-xs md:text-sm text-white/70">{item.label}</div>
                  <div className="mt-1 md:mt-2 text-xl md:text-2xl font-semibold">{item.value}</div>
                  <div className="mt-1 text-xs text-emerald-200 line-clamp-1">{item.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 md:space-y-6">
          <div className="rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">About {firstName}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{resolvedProfile.bio}</p>

            {focusAreas.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current focus</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {focusAreas.map((area) => (
                    <li key={area} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" aria-hidden="true" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Connect</h3>
            <dl className="mt-4 space-y-3 text-sm text-gray-600">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <dt className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">📧</dt>
                  <dd className="truncate">{contact.email}</dd>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <dt className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">📱</dt>
                  <dd>{contact.phone}</dd>
                </div>
              )}
              {contact.website && (
                <div className="flex items-center gap-3">
                  <dt className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">🌐</dt>
                  <dd className="truncate">{contact.website}</dd>
                </div>
              )}
              {resolvedProfile.availability && (
                <div className="flex items-center gap-3">
                  <dt className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">📆</dt>
                  <dd>{resolvedProfile.availability}</dd>
                </div>
              )}
            </dl>
            <button className="mt-6 w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md">
              Request a session
            </button>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          <div className="rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">Current learning plan</h3>
              {currentCourses.length > 0 && <span className="text-xs font-medium uppercase tracking-wider text-purple-500">{currentCourses.length} active</span>}
            </div>
            <div className="mt-6 space-y-5">
              {currentCourses.map((course) => (
                <div key={course.title} className="rounded-2xl border border-gray-100 p-5 transition hover:shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">{course.title}</h4>
                      <p className="mt-1 text-xs text-gray-500">Next · {course.nextLesson}</p>
                    </div>
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                      {course.progress}% complete
                    </span>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${course.color}`}
                      style={{ width: `${Math.min(Math.max(course.progress, 0), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {currentCourses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                  Add a course from your dashboard to personalize this plan.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-base font-semibold text-gray-800">Recent activity</h3>
            <div className="mt-4 md:mt-6 space-y-4 md:space-y-5">
              {activity.map((item) => (
                <div key={`${item.title}-${item.time}`} className="flex items-start gap-4">
                  <div className="relative mt-1 flex h-3 w-3 items-center justify-center">
                    <span className="h-3 w-3 rounded-full bg-purple-500" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="text-sm text-gray-500">Activity will appear here as you engage with LinkedSkill content.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-base font-semibold text-gray-800">Skill highlights</h3>
            <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                  {skill}
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-sm text-gray-500">Add skills from your profile settings to showcase your strengths.</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl md:rounded-3xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-base font-semibold text-gray-800">Achievements & credentials</h3>
            <ul className="mt-4 space-y-3 md:space-y-4 text-sm text-gray-600">
              {achievements.map((achievement) => (
                <li key={`${achievement.title}-${achievement.date}`} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{achievement.title}</p>
                    <span className="text-xs text-gray-400">{achievement.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{achievement.description}</p>
                </li>
              ))}
              {achievements.length === 0 && (
                <li className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Unlock achievements by completing LinkedSkill learning paths and experiences.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
