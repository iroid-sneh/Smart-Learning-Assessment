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
    blue: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
    purple: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
    orange: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
  };
  const chartStyles = {
    blue: { active: 'bg-blue-600', muted: 'bg-blue-100' },
    green: { active: 'bg-emerald-600', muted: 'bg-emerald-100' },
    purple: { active: 'bg-violet-600', muted: 'bg-violet-100' },
    orange: { active: 'bg-amber-500', muted: 'bg-amber-100' }
  };
  const bars = [42, 56, 62, 48, 40, 66, 54, 50];
  return <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-all duration-200 min-h-[122px]">
      <div className="pr-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">{label}</p>
        <h3 className="text-3xl font-semibold text-gray-900 leading-none">{value}</h3>
        {trend && <p className={`text-xs font-semibold mt-2 ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend}
          </p>}
      </div>
      <div className="flex items-end gap-1.5 h-[66px] ml-auto">
        {bars.map((h, idx) => <span key={idx} className={`w-3 rounded-sm ${idx % 3 === 0 ? chartStyles[color].muted : chartStyles[color].active}`} style={{
          height: `${h}%`
        }} />)}
      </div>
      <div className={`p-2.5 rounded-lg ml-4 ${colorStyles[color]}`}>
        <Icon size={16} />
      </div>
    </div>;
}