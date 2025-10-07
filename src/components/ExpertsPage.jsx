import React, { useState } from 'react'

const teamMembers = [
  {
    id: 1,
    name: 'Gabriel Shaoolian',
    role: 'CEO AND FOUNDER',
    bio: "Gabriel is a hands-on leader and digital expert focused on providing specific tactics and strategies to grow brands online. He has worked with numerous brands, from Fortune 500 companies to reputable startups including Google, Microsoft, SONY, NFL, NYU, P&G, Fleet Bank and NASA. Gabriel sets the stage for a proactive work culture, and personally reviews every project to ensure the Digital Silk team generates results. He has two golden rules for the team: 1. Do outstanding work, not just good work, and 2. Don't drag on tasks.\n\nGabriel has columns in Forbes, Entrepreneur, The New York Times, and American Express. He has made numerous media appearances, from Bloomberg and Reuters to ABC News and CNN."
  },
  {
    id: 2,
    name: 'Stephanie Sharlow',
    role: 'VP CLIENT PARTNER',
    bio: 'Stephanie is a strategic leader with deep expertise in client relationship management and digital transformation. She excels at understanding client needs and delivering innovative solutions.'
  },
  {
    id: 3,
    name: 'Bojan Milicevic',
    role: 'CFO/COO',
    bio: 'Bojan brings extensive experience in financial management and operational excellence. He ensures the company maintains financial health while scaling operations efficiently.'
  },
  {
    id: 4,
    name: 'Jamie Maloney',
    role: 'VP CLIENT PARTNER',
    bio: 'Jamie is passionate about building long-term partnerships and driving client success through strategic planning and exceptional service delivery.'
  },
  {
    id: 5,
    name: 'Sarah Johnson',
    role: 'HEAD OF DESIGN',
    bio: 'Sarah leads the design team with a focus on creating beautiful, user-centered experiences that drive engagement and conversion.'
  },
  {
    id: 6,
    name: 'Michael Chen',
    role: 'LEAD DEVELOPER',
    bio: 'Michael is a technical expert who architects scalable solutions and mentors the development team to deliver high-quality code.'
  },
  {
    id: 7,
    name: 'Emily Rodriguez',
    role: 'MARKETING DIRECTOR',
    bio: 'Emily crafts compelling marketing strategies that amplify brand presence and drive measurable business growth.'
  },
  {
    id: 8,
    name: 'David Thompson',
    role: 'VP OF OPERATIONS',
    bio: 'David streamlines processes and ensures smooth project delivery across all departments with his operational expertise.'
  }
]

export default function ExpertsPage({ onBack }) {
  const [selectedMember, setSelectedMember] = useState(null)

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6 md:mb-8 animate-slideDown">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-3">
          Meet Your Expert Instructors
        </h1>
        <p className="text-sm md:text-base text-gray-600 px-4">Learn from industry leaders who are passionate about sharing their knowledge and expertise</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
        {teamMembers.map((member, index) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            style={{ animationDelay: `${index * 100}ms` }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fadeInUp bg-white"
          >
            <div className="aspect-[3/4] bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center relative">
              <img 
                src="/src/assets/placeholder.svg" 
                alt={member.name} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/95 via-purple-400/60 to-transparent opacity-100 group-hover:from-brand/95 group-hover:via-purple-500/70 transition-all duration-500" />
              
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
                View Profile
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-0 group-hover:translate-y-[-8px] transition-all duration-500">
                <h3 className="text-white font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-pink-200 text-sm font-semibold">{member.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-8 animate-fadeIn"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="bg-white rounded-2xl md:rounded-3xl max-w-5xl w-full p-6 md:p-10 relative shadow-2xl animate-scaleIn overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 md:w-10 md:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xl md:text-2xl transition-all duration-300 hover:rotate-90"
            >
              ×
            </button>

            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="w-full md:w-72 h-72 rounded-2xl overflow-hidden flex-shrink-0 border-4 border-purple-200 shadow-lg">
                <img 
                  src="/src/assets/placeholder.svg" 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="flex-1">
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
                  Expert Instructor
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">{selectedMember.name}</h2>
                <p className="text-purple-600 font-semibold text-base md:text-lg mb-4 md:mb-6">{selectedMember.role}</p>
                <div className="prose prose-sm md:prose-lg">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">{selectedMember.bio}</p>
                </div>
                <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm md:text-base">
                    View Courses
                  </button>
                  <button className="border-2 border-purple-600 text-purple-600 px-5 md:px-6 py-2.5 md:py-3 rounded-full font-semibold hover:bg-purple-50 transition-all duration-300 text-sm md:text-base">
                    Contact Instructor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
