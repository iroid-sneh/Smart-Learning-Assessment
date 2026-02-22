import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BookOpen, User, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Define static colors for UI
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-indigo-500', 'bg-rose-500'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data?.success) {
          setCourses(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  if (loading) return <Layout role="student"><div className="p-8">Loading courses...</div></Layout>;

  return (
    <Layout role="student">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => {
          const color = colors[index % colors.length];
          return (
            <Card key={course._id} className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300 group" noPadding>
              <div className={`h-32 ${color} rounded-t-xl p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen className="w-24 h-24 text-white" />
                </div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white mb-2">
                  {course.code}
                </span>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {course.title}
                </h3>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-4 mb-6 flex-1">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">{course.faculty?.name || 'Unknown Faculty'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <p className="text-sm line-clamp-2">{course.description || 'No description provided'}</p>
                  </div>
                </div>

                <Link to={`/student/course/${course._id}`}>
                  <Button className="w-full justify-between group-hover:bg-blue-700">
                    View Course
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
        {courses.length === 0 && <p className="text-slate-500">No courses available.</p>}
      </div>
    </Layout>
  );
}