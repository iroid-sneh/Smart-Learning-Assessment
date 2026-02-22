import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>}
        <input className={`
            w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder:text-gray-400
            focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200
            transition-all duration-200 shadow-sm
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
            ${className}
          `} {...props} />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>;
}