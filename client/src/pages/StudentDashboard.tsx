import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BookOpen, FileText, CheckCircle, TrendingUp, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        const [progRes, reqCourses, reqAnnounce] = await Promise.all([
          api.get(`/students/${user._id}/progress`),
          api.get('/courses'),
          api.get('/announcements')
        ]);
        if (progRes.data?.success) setProgress(progRes.data.data);
        if (reqCourses.data?.success) setCourses(reqCourses.data.data.slice(0, 3));
        if (reqAnnounce.data?.success) setAnnouncements(reqAnnounce.data.data.slice(0, 3));
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Layout role="student"><div className="p-8">Loading dashboard info...</div></Layout>;

  return (
    <Layout role="student">
      <div className="mb-7">
        <h2 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Student'}</h2>
        <p className="text-sm text-gray-500 mt-1">Track your coursework, progress, and latest updates in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={courses.length.toString() || "0"} color="blue" />
        <StatCard icon={FileText} label="Pending Assignments" value={((progress?.totalAssignments || 0) - (progress?.submittedAssignments || 0)).toString()} color="orange" />
        <StatCard icon={CheckCircle} label="Completed" value={progress?.evaluatedAssignments?.toString() || "0"} color="green" />
        <StatCard
          icon={TrendingUp}
          label="Overall Progress"
          value={`${progress?.completionPercentage || 0}%`}
          color="purple"
          trend={`${progress?.averageMarks || 0}% Avg`}
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity / Progress */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Current Courses</h3>
              <Link to="/student/courses">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-6">
              {courses.map(course => (
                <div key={course._id}>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>{course.title}</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `100%` }}></div>
                  </div>
                </div>
              ))}
              {courses.length === 0 && <p className="text-sm text-gray-500">No active courses yet.</p>}
            </div>
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              <Link to="/student/assignments">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Please check the assignments tab for specific deadlines.</p>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-6">
              {announcements.map((item) => (
                <div key={item._id}
                  onClick={() => setSelectedAnnouncement(item)}
                  className="pb-4 border-b border-gray-100 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full mb-2 inline-block">
                    {item.type}
                  </span>
                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {announcements.length === 0 && <p className="text-sm text-gray-500">No announcements yet.</p>}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Learning Progress Snapshot</h3>
            <span className="text-xs font-semibold text-blue-600">Last 30 days</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Assignments Submitted', value: progress?.submittedAssignments || 0, total: progress?.totalAssignments || 1 },
              { label: 'Assignments Evaluated', value: progress?.evaluatedAssignments || 0, total: progress?.totalAssignments || 1 },
              { label: 'Average Score', value: progress?.averageMarks || 0, total: 100 }
            ].map((row) => {
              const pct = Math.max(0, Math.min(100, Math.round((row.value / row.total) * 100)));
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-medium">{row.label}</span>
                    <span className="text-gray-500">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Distribution</h3>
          <div className="space-y-3">
            {courses.slice(0, 4).map((course, index) => (
              <div key={course._id || index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate mr-3">{course.title}</span>
                <span className="inline-flex h-2.5 w-24 rounded-full bg-gray-100 overflow-hidden">
                  <span className="h-full bg-blue-600" style={{ width: `${70 + index * 7}%` }} />
                </span>
              </div>
            ))}
            {courses.length === 0 && <p className="text-sm text-gray-500">No course data yet.</p>}
          </div>
        </Card>
      </div>

      <Modal isOpen={!!selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} title={selectedAnnouncement?.title || 'Announcement'}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full uppercase">
              {selectedAnnouncement?.type}
            </span>
            <span className="text-sm text-gray-500">
              {selectedAnnouncement?.createdAt && new Date(selectedAnnouncement.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedAnnouncement?.message}</p>
          {selectedAnnouncement?.createdBy && (
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              Posted by: {selectedAnnouncement.createdBy.name || 'Admin'}
            </p>
          )}
        </div>
      </Modal>
    </Layout>
  );
}