import React from 'react';
import { motion } from 'framer-motion';
interface Tab {
  id: string;
  label: string;
}
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}
export function Tabs({
  tabs,
  activeTab,
  onChange
}: TabsProps) {
  return <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl mb-6">
      {tabs.map(tab => <button key={tab.id} onClick={() => onChange(tab.id)} className={`
            relative flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
            ${activeTab === tab.id ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
          `}>
          {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-lg shadow-sm" transition={{
        type: 'spring',
        bounce: 0.2,
        duration: 0.6
      }} />}
          <span className="relative z-10">{tab.label}</span>
        </button>)}
    </div>;
}