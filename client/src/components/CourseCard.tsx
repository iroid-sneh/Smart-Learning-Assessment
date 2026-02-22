import React from 'react';
import { BookOpen, Clock, User } from 'lucide-react';
interface CourseCardProps {
  title: string;
  instructor: string;
  progress: number;
  nextSession?: string;
  studentCount?: number;
  role?: 'student' | 'faculty';
}
export function CourseCard({
  title,
  instructor,
  progress,
  nextSession,
  studentCount,
  role = 'student'
}: CourseCardProps) {
  return <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-200 flex flex-col h-full border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <BookOpen size={20} />
        </div>
        {role === 'faculty' && <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            {studentCount} Students
          </span>}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <div className="flex items-center text-slate-500 text-sm mb-4">
        <User size={14} className="mr-1" />
        <span>{instructor}</span>
      </div>

      <div className="mt-auto">
        {role === 'student' ? <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{
            width: `${progress}%`
          }} />
            </div>
          </div> : <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
            <Clock size={14} className="mr-2 text-blue-600" />
            <span>Next: {nextSession}</span>
          </div>}
      </div>
    </div>;
}