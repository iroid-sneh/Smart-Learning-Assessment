import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Calendar, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function AssignmentManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Focus
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [courseId, setCourseId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/assignments')
      ]);
      let myCourses: any[] = [];
      if (coursesRes.data?.success) {
        myCourses = coursesRes.data.data.filter((c: any) => c.faculty?._id === user?._id || c.faculty === user?._id);
        setCourses(myCourses);
      }
      if (assignmentsRes.data?.success) {
        // Filter assignments belonging to my courses
        const myCourseIds = myCourses.map(c => c._id);
        const myAssignments = assignmentsRes.data.data.filter((a: any) => myCourseIds.includes(a.course?._id || a.course));
        setAssignments(myAssignments);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddNew = () => {
    setSelectedAssignment(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setCourseId(courses.length > 0 ? courses[0]._id : '');
    setIsModalOpen(true);
  };

  const handleEdit = (assignment: any) => {
    setSelectedAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description || '');
    setDueDate(assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '');
    setCourseId(assignment.course?._id || assignment.course);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { title, description, course: courseId, dueDate };
      if (selectedAssignment) {
        await api.put(`/assignments/${selectedAssignment._id}`, payload);
      } else {
        await api.post('/assignments', payload);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (e: any) {
      console.error(e);
      alert('Error saving assignment: ' + (e.response?.data?.message || e.message));
    }
  };

  const getCourseName = (id: string) => {
    const c = courses.find((c: any) => c._id === id);
    return c ? c.title : 'Unknown Course';
  };

  return <Layout role="faculty">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600">Create and manage course assignments</p>
      </div>
      <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddNew}>
        Create Assignment
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? <p>Loading assignments...</p> : assignments.map(item => {
        const isPast = new Date(item.dueDate) < new Date();
        const status = isPast ? 'Closed' : 'Active';

        return <Card key={item._id} className="flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <Badge variant={status === 'Active' ? 'success' : 'neutral'}>
              {status}
            </Badge>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 mb-4">{getCourseName(item.course?._id || item.course)}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex space-x-3">
            <Button className="flex-1" variant="secondary" onClick={() => handleEdit(item)}>
              Edit
            </Button>
            <Button className="flex-1" onClick={() => navigate('/faculty/evaluation')}>Evaluate</Button>
          </div>
        </Card>
      })}
      {!loading && assignments.length === 0 && <p className="col-span-3 text-gray-500">No assignments created yet.</p>}
    </div>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAssignment ? "Edit Assignment" : "Create New Assignment"}>
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Course
          </label>
          <select className="w-full rounded-lg border border-gray-300 p-2.5" value={courseId} onChange={e => setCourseId(e.target.value)}>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
            ))}
          </select>
        </div>
        <Input label="Assignment Title" placeholder="e.g. Final Project" value={title} onChange={e => setTitle(e.target.value)} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea className="w-full rounded-lg border border-gray-300 p-2.5 h-24" placeholder="Enter assignment details..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!title || !dueDate || !courseId}>
            {selectedAssignment ? "Update Assignment" : "Create Assignment"}
          </Button>
        </div>
      </form>
    </Modal>
  </Layout>;
}