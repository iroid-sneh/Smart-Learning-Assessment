import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, BarChart2, Users, Settings, LogOut, GraduationCap, Megaphone } from 'lucide-react';
interface SidebarProps {
  role: 'student' | 'faculty' | 'admin';
  onCloseMobile?: () => void;
}
export function Sidebar({
  role,
  onCloseMobile
}: SidebarProps) {
  const location = useLocation();
  const links = {
    student: [{
      name: 'Dashboard',
      path: '/student/dashboard',
      icon: LayoutDashboard
    }, {
      name: 'My Courses',
      path: '/student/courses',
      icon: BookOpen
    }, {
      name: 'Assignments',
      path: '/student/assignments',
      icon: FileText
    }, {
      name: 'Progress',
      path: '/student/progress',
      icon: BarChart2
    }],
    faculty: [{
      name: 'Dashboard',
      path: '/faculty/dashboard',
      icon: LayoutDashboard
    }, {
      name: 'My Courses',
      path: '/faculty/courses',
      icon: BookOpen
    }, {
      name: 'Study Materials',
      path: '/faculty/materials',
      icon: FileText
    }, {
      name: 'Assignments',
      path: '/faculty/assignments',
      icon: FileText
    }, {
      name: 'Evaluation',
      path: '/faculty/evaluation',
      icon: GraduationCap
    }],
    admin: [{
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    }, {
      name: 'User Mgmt',
      path: '/admin/users',
      icon: Users
    }, {
      name: 'Course Mgmt',
      path: '/admin/courses',
      icon: BookOpen
    }, {
      name: 'Progress',
      path: '/admin/progress',
      icon: BarChart2
    }, {
      name: 'Announcements',
      path: '/admin/announcements',
      icon: Megaphone
    }]
  };
  const currentLinks = links[role];
  return <div className="h-full flex flex-col bg-white">
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            Smart Learn
          </h1>
          <p className="text-xs text-gray-500">Academic Portal</p>
        </div>
      </div>
    </div>

    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      {currentLinks.map(link => {
        const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
        const Icon = link.icon;
        return <Link key={link.path} to={link.path} onClick={onCloseMobile} className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}>
          <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
          {link.name}
        </Link>;
      })}
    </nav>

    <div className="p-4 border-t border-gray-100">
      <Link to="/" className="flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
        <LogOut className="w-5 h-5 mr-3" />
        Sign Out
      </Link>
    </div>
  </div>;
}