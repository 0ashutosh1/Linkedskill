import React from 'react'

export default function ReferencePage({ course, onBack }){
  if(!course) return (
    <div className="p-4 md:p-6">
      <button className="text-sm text-indigo-600 mb-4 hover:text-indigo-700 transition-colors" onClick={onBack}>← Back</button>
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">No course selected.</div>
    </div>
  )

  return (
    <div className="p-4 md:p-6">
      <button className="text-sm text-indigo-600 mb-4 hover:text-indigo-700 transition-colors" onClick={onBack}>← Back</button>
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-lg md:text-xl font-semibold mb-2">{course.title}</h2>
        <p className="text-sm text-gray-600 mb-4">Tag: {course.tag}</p>
        <div className="text-sm text-gray-700 leading-relaxed">Here are the reference links, resources or timestamps for the course/video. Replace this with real data or an API.</div>
      </div>
    </div>
  )
}
