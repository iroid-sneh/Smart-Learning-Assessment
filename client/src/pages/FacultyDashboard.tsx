import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Users, BookOpen, FileText, Clock, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function FacultyDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [studentsCount, setStudentsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [courseRes, assignRes, announceRes] = await Promise.all([
          api.get('/courses'),
          api.get('/assignments'),
          api.get('/announcements')
        ]);

        let myCourses: any[] = [];
        let myAssignments: any[] = [];

        if (courseRes.data?.success) {
          myCourses = courseRes.data.data.filter((c: any) => c.faculty?._id === user?._id || c.faculty === user?._id);
          setCourses(myCourses);

          const studentSet = new Set();
          myCourses.forEach((c: any) => {
            (c.students || []).forEach((sid: string) => studentSet.add(sid));
          });
          setStudentsCount(studentSet.size);
        }

        if (assignRes.data?.success) {
          const myCourseIds = myCourses.map((c: any) => c._id);
          myAssignments = assignRes.data.data.filter((a: any) => myCourseIds.includes(a.course?._id || a.course));
          setAssignments(myAssignments);
        }

        if (announceRes.data?.success) {
          setAnnouncements(announceRes.data.data.slice(0, 5));
        }

        let pending = 0;
        const subResults = await Promise.allSettled(
          myAssignments.map((a: any) => api.get(`/submissions/assignment/${a._id}`))
        );
        subResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value.data?.success) {
            pending += result.value.data.data.filter((s: any) => s.status === 'submitted').length;
          }
        });
        setPendingCount(pending);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) return <Layout role="faculty"><div className="p-8">Loading dashboard info...</div></Layout>;

  return (
    <Layout role="faculty">
      <div className="mb-7">
        <h2 className="text-2xl font-semibold text-gray-900">Faculty Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your classes, assignment flow, and student activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard icon={BookOpen} label="Total Courses" value={courses.length.toString()} color="blue" />
        <StatCard icon={Users} label="Total Students" value={studentsCount.toString()} color="green" />
        <StatCard icon={FileText} label="Total Assignments" value={assignments.length.toString()} color="orange" />
        <StatCard icon={Clock} label="Pending Evaluations" value={pendingCount.toString()} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <Link to="/faculty/evaluation"><Button variant="outline" className="w-full">Evaluate Submissions</Button></Link>
              <Link to="/faculty/materials"><Button variant="outline" className="w-full">Add Materials</Button></Link>
              <Link to="/faculty/assignments"><Button variant="outline" className="w-full">Add Assignments</Button></Link>
              <Link to="/faculty/courses"><Button variant="outline" className="w-full">Edit Courses</Button></Link>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
              <Link to="/faculty/courses">
                <Button variant="ghost" size="sm">Manage</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {courses.map(course => (
                <div key={course._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-500">{course.code}</p>
                  </div>
                  <span className="text-sm text-gray-500">{course.students?.length || 0} students</span>
                </div>
              ))}
              {courses.length === 0 && <p className="text-sm text-gray-500">No courses assigned yet.</p>}
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
            <h3 className="text-lg font-semibold text-gray-900">Submission Analytics</h3>
            <span className="text-xs font-semibold text-blue-600">Last 7 days</span>
          </div>
          <div className="grid grid-cols-8 gap-2 items-end h-44">
            {[42, 70, 55, 60, 82, 66, 58, 76].map((h, idx) => (
              <div key={idx} className="rounded-md bg-blue-100 h-full flex items-end">
                <div className="w-full rounded-md bg-blue-600" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: pendingCount, color: 'bg-amber-500' },
              { label: 'Completed', value: Math.max(0, assignments.length - pendingCount), color: 'bg-emerald-500' },
              { label: 'Total', value: assignments.length, color: 'bg-blue-500' }
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{row.label}</span>
                  <span className="font-semibold text-gray-900">{row.value}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color}`} style={{ width: `${Math.min(100, assignments.length ? (row.value / assignments.length) * 100 : 0)}%` }} />
                </div>
              </div>
            ))}
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