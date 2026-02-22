import React from 'react';
interface ProgressBarProps {
  progress: number;
  color?: string;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}
export function ProgressBar({
  progress,
  color = 'bg-blue-600',
  showLabel = true,
  height = 'md'
}: ProgressBarProps) {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };
  return <div className="w-full">
      {showLabel && <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[height]}`}>
        <div className={`${color} transition-all duration-500 ease-out rounded-full ${heights[height]}`} style={{
        width: `${Math.min(100, Math.max(0, progress))}%`
      }} />
      </div>
    </div>;
}