import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function CourseManagementPage() {
  const { user } = useAuth();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [courses, setCourses] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Focus
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, usersRes] = await Promise.all([
        api.get('/courses'),
        api.get('/users')
      ]);
      if (coursesRes.data?.success) {
        // Faculty only see their courses
        setCourses(coursesRes.data.data.filter((c: any) => c.faculty?._id === user?._id || c.faculty === user?._id));
      }
      if (usersRes.data?.success) {
        setAllStudents(usersRes.data.data.filter((u: any) => u.role === 'student' && u.isActive));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAssign = (course: any) => {
    setSelectedCourse(course);
    setSelectedStudentIds(course.students || []);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignments = async () => {
    try {
      await api.put(`/courses/${selectedCourse._id}`, { students: selectedStudentIds });
      fetchData();
      setIsAssignModalOpen(false);
    } catch (e) { console.error(e); }
  };

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(s => s !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  return <Layout role="faculty">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Courses
        </h1>
        <p className="text-gray-600">
          View your assigned courses and manage student enrollments
        </p>
      </div>
    </div>

    <Card noPadding>
      {loading ? <div className="p-8">Loading...</div> :
        <Table data={courses} keyField="_id" columns={[{
          header: 'Course Name',
          accessor: 'title',
          className: 'font-medium'
        }, {
          header: 'Course Code',
          accessor: 'code'
        }, {
          header: 'Enrolled Students',
          accessor: (item: any) => item.students?.length || 0
        }]} actions={item => <div className="flex justify-end space-x-2">
          <Button size="sm" variant="secondary" icon={<Users className="w-4 h-4" />} onClick={() => handleAssign(item)}>
            Assign Students
          </Button>
        </div>} />}
      {!loading && courses.length === 0 && <p className="p-8 text-gray-500">No courses assigned to you yet.</p>}
    </Card>

    {/* Assign Students Modal */}
    <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Students to ${selectedCourse?.code}`}>
      <div className="space-y-4">
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 p-2">
          {allStudents.map(student => (
            <label key={student._id} className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
              </div>
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={selectedStudentIds.includes(student._id)}
                onChange={() => toggleStudent(student._id)} />
            </label>
          ))}
          {allStudents.length === 0 && <p className="text-sm text-gray-500 p-2">No active students available.</p>}
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAssignments}>
            Save Assignments
          </Button>
        </div>
      </div>
    </Modal>
  </Layout>;
}