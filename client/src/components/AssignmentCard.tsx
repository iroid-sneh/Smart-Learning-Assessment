import React from 'react';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
interface AssignmentCardProps {
  title: string;
  course: string;
  dueDate: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'submitted' | 'graded';
}
export function AssignmentCard({
  title,
  course,
  dueDate,
  priority = 'medium',
  status = 'pending'
}: AssignmentCardProps) {
  const priorityColors = {
    high: 'bg-red-50 text-red-600 border-red-100',
    medium: 'bg-orange-50 text-orange-600 border-orange-100',
    low: 'bg-blue-50 text-blue-600 border-blue-100'
  };
  return <div className="bg-white rounded-xl shadow-md p-4 mb-3 hover:shadow-lg transition-all duration-200 border border-slate-100 flex items-center justify-between group">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${status === 'submitted' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
          {status === 'submitted' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h4>
          <p className="text-sm text-slate-500">{course}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${priorityColors[priority]}`}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </div>
        <div className="flex items-center text-xs text-slate-500">
          <Calendar size={12} className="mr-1" />
          {dueDate}
        </div>
      </div>
    </div>;
}