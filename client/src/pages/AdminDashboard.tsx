import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, BookOpen, TrendingUp, Settings, Plus, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, coursesRes, announceRes] = await Promise.all([
          api.get('/users'),
          api.get('/courses'),
          api.get('/announcements')
        ]);
        if (usersRes.data?.success) setUsers(usersRes.data.data);
        if (coursesRes.data?.success) setCourses(coursesRes.data.data);
        if (announceRes.data?.success) setAnnouncements(announceRes.data.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch admin dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const totalStudents = users.filter((u: any) => u.role === 'student').length;
  const totalFaculty = users.filter((u: any) => u.role === 'faculty').length;

  if (loading) return <Layout role="admin"><div className="p-8">Loading dashboard info...</div></Layout>;

  return (
    <Layout role="admin">
      <div className="mb-7">
        <h2 className="text-2xl font-semibold text-gray-900">Admin Control Center</h2>
        <p className="text-sm text-gray-500 mt-1">Monitor platform operations, users, and system-wide activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Users} label="Total Students" value={totalStudents.toString()} color="blue" />
        <StatCard icon={Users} label="Faculty Members" value={totalFaculty.toString()} color="green" />
        <StatCard icon={BookOpen} label="Total Courses" value={courses.length.toString()} color="purple" />
        <StatCard icon={TrendingUp} label="Platform Usage" value="98%" color="orange" trend="Stable" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-blue-600 font-medium mb-1">Manage Users</p>
                  <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                </div>
                <Link to="/admin/users">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">View All</Button>
                </Link>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div>
                  <p className="text-purple-600 font-medium mb-1">Manage Courses</p>
                  <p className="text-2xl font-bold text-purple-900">{courses.length}</p>
                </div>
                <Link to="/admin/courses">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">View All</Button>
                </Link>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link to="/admin/courses">
                <Button variant="outline" className="h-auto w-full py-4 flex flex-col items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span>Add Course</span>
                </Button>
              </Link>
              <Link to="/admin/announcements">
                <Button variant="outline" className="h-auto w-full py-4 flex flex-col items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <span>New Action</span>
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="h-auto w-full py-4 flex flex-col items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Add User</span>
                </Button>
              </Link>
              <Button variant="outline" className="h-auto w-full py-4 flex flex-col items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                <span>Settings</span>
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
            <div className="space-y-4">
              {announcements.map((item) => (
                <div key={item._id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {announcements.length === 0 && <p className="text-sm text-gray-500">No announcements yet.</p>}
            </div>
            <Link to="/admin/announcements">
              <Button variant="ghost" className="w-full mt-4 text-sm" size="sm">Manage All Announcements</Button>
            </Link>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
            <span className="text-xs text-gray-500">Latest activity</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="py-2 pr-4">Transaction</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[{
                  name: 'Payment from Bonnie Green',
                  date: 'Apr 23, 2021',
                  amount: '$2300',
                  status: 'Completed',
                  badge: 'bg-emerald-100 text-emerald-700'
                }, {
                  name: 'Payment refund to #00910',
                  date: 'Apr 23, 2021',
                  amount: '-$670',
                  status: 'Cancelled',
                  badge: 'bg-red-100 text-red-700'
                }, {
                  name: 'Payment from Jese Leos',
                  date: 'Apr 15, 2021',
                  amount: '$2300',
                  status: 'In review',
                  badge: 'bg-violet-100 text-violet-700'
                }, {
                  name: 'Payment from Lana Byrd',
                  date: 'Apr 15, 2021',
                  amount: '$5000',
                  status: 'In progress',
                  badge: 'bg-amber-100 text-amber-700'
                }].map((row) => (
                  <tr key={row.name} className="text-gray-700">
                    <td className="py-3 pr-4 font-medium">{row.name}</td>
                    <td className="py-3 pr-4">{row.date}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">{row.amount}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${row.badge}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Traffic by Device</h3>
            <span className="text-xs font-semibold text-blue-600">Full report</span>
          </div>
          <div className="mx-auto w-48 h-48 rounded-full" style={{
            background: 'conic-gradient(#06b6d4 0 72%, #1d4ed8 72% 92%, #fdba74 92% 100%)'
          }}>
            <div className="w-28 h-28 bg-white rounded-full mx-auto relative top-10"></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6 text-sm">
            <div>
              <p className="text-gray-500">Desktop</p>
              <p className="font-bold text-gray-900">234k</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-bold text-gray-900">94k</p>
            </div>
            <div>
              <p className="text-gray-500">Tablet</p>
              <p className="font-bold text-gray-900">16k</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}