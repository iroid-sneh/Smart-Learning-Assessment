import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export function ProgressMonitoringPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, usersRes] = await Promise.all([
          api.get('/courses'),
          api.get('/users')
        ]);

        let fetchedCourses: any[] = [];
        let students: any[] = [];

        if (coursesRes.data?.success) {
          fetchedCourses = coursesRes.data.data;
          setCourses(fetchedCourses);
        }
        if (usersRes.data?.success) {
          students = usersRes.data.data.filter((u: any) => u.role === 'student');
          setUsers(students);
        }

        const progressResults = await Promise.allSettled(
          students.map((s: any) => api.get(`/students/${s._id}/progress`))
        );
        const progressMap: Record<string, any> = {};
        progressResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.data?.success) {
            progressMap[students[index]._id] = result.value.data.data;
          }
        });
        setStudentProgress(progressMap);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  let totalEnrollments = 0;
  courses.forEach(c => {
    totalEnrollments += (c.students?.length || 0);
  });

  const getStudentCourses = (studentId: string) => {
    const enrolled = courses.filter(c =>
      (c.students || []).some((sid: any) => (sid._id || sid).toString() === studentId)
    );
    if (enrolled.length === 0) return 'Not Enrolled';
    if (enrolled.length === 1) return enrolled[0].title;
    return enrolled.map(c => c.title).join(', ');
  };

  const studentPerformance = users.map(u => {
    const prog = studentProgress[u._id];
    return {
      id: u._id,
      name: u.name,
      course: getStudentCourses(u._id),
      score: prog ? `${prog.averageMarks || 0}% (${prog.submittedAssignments || 0}/${prog.totalAssignments || 0} done)` : 'No data',
      status: u.isActive ? 'Active' : 'Inactive'
    };
  });

  if (loading) return <Layout role="admin"><div className="p-8">Loading progress overview...</div></Layout>;

  return <Layout role="admin">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Progress Monitoring
      </h1>
      <p className="text-gray-600">
        Track academic performance across the institution
      </p>
    </div>

    {/* Overview Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="flex items-center space-x-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-full">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Courses Evaluated</p>
          <h3 className="text-2xl font-bold text-gray-900">{courses.length}</h3>
        </div>
      </Card>
      <Card className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Enrollments</p>
          <h3 className="text-2xl font-bold text-gray-900">{totalEnrollments}</h3>
        </div>
      </Card>
      <Card className="flex items-center space-x-4">
        <div className="p-3 bg-red-100 text-red-600 rounded-full">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Active Students</p>
          <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => u.isActive).length}</h3>
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <Card title="Course Enrollment">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Course Sizes
        </h3>

        <div className="space-y-6">
          {courses.slice(0, 4).map(course => {
            const percentage = totalEnrollments > 0 ? ((course.students?.length || 0) / totalEnrollments) * 100 : 0;
            return (
              <div key={course._id}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {course.title}
                  </span>
                  <span className="text-sm text-gray-500">{course.students?.length || 0} enrolled</span>
                </div>
                <ProgressBar progress={percentage || 0} showLabel={false} color="bg-blue-500" />
              </div>
            );
          })}
          {courses.length === 0 && <p className="text-gray-500">No courses available.</p>}
        </div>
      </Card>
    </div>
    <Card title="Student Performance List" noPadding>
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">
          Student List
        </h3>
      </div>
      <Table data={studentPerformance} keyField="id" columns={[{
        header: 'Student Name',
        accessor: 'name',
        className: 'font-medium'
      }, {
        header: 'Course',
        accessor: 'course'
      }, {
        header: 'Score',
        accessor: 'score'
      }, {
        header: 'Status',
        accessor: item => <Badge variant={item.status === 'Active' ? 'success' : 'danger'}>
          {item.status}
        </Badge>
      }]} />
    </Card>
  </Layout>;
}