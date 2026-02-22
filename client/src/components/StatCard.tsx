import React from 'react';
import { BoxIcon } from 'lucide-react';
interface StatCardProps {
  icon: BoxIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}
export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  color = 'blue'
}: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };
  return <div className="bg-white rounded-xl shadow-md p-6 flex items-start justify-between hover:shadow-lg transition-shadow duration-200">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {trend && <p className={`text-xs font-medium mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </p>}
      </div>
      <div className={`p-3 rounded-full ${colorStyles[color]}`}>
        <Icon size={24} />
      </div>
    </div>;
}