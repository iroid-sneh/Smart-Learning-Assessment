import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import api from '../../services/api';

export function AdminCourseManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [description, setDescription] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, usersRes] = await Promise.all([
        api.get('/courses'),
        api.get('/users')
      ]);
      if (coursesRes.data?.success) setCourses(coursesRes.data.data);
      if (usersRes.data?.success) {
        setFaculty(usersRes.data.data.filter((u: any) => u.role === 'faculty'));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNew = () => {
    setSelectedCourse(null);
    setTitle('');
    setCode('');
    setDescription('');
    setSelectedFaculty('');
    setIsModalOpen(true);
  };

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setTitle(course.title);
    setCode(course.code);
    setDescription(course.description || '');
    setSelectedFaculty(course.faculty?._id || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title,
        code,
        description,
        faculty: selectedFaculty || undefined
      };
      if (selectedCourse) {
        await api.put(`/courses/${selectedCourse._id}`, payload);
      } else {
        await api.post('/courses', payload);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error saving course');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return <Layout role="admin">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Course Administration
        </h1>
        <p className="text-gray-600">
          Manage courses and faculty assignments
        </p>
      </div>
      <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddNew}>
        Add Course
      </Button>
    </div>

    <Card noPadding>
      {loading ? <div className="p-8">Loading courses...</div> :
        <Table data={courses} keyField="_id" columns={[{
          header: 'Course Name',
          accessor: 'title',
          className: 'font-medium'
        }, {
          header: 'Code',
          accessor: 'code'
        }, {
          header: 'Assigned Faculty',
          accessor: (item: any) => item.faculty?.name || 'Unassigned'
        }, {
          header: 'Students',
          accessor: (item: any) => item.students?.length || 0
        }]} actions={item => <div className="flex justify-end space-x-2">
          <Button size="sm" variant="secondary" icon={<Edit2 className="w-4 h-4" />} onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(item._id)}>
            Delete
          </Button>
        </div>} />}
    </Card>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCourse ? 'Edit Course' : 'Add New Course'}>
      <form className="space-y-4">
        <Input label="Course Name" placeholder="e.g. Advanced Web Development" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Course Code" placeholder="e.g. CS-601" value={code} onChange={(e) => setCode(e.target.value)} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Course Description</label>
          <textarea className="w-full rounded-lg border border-gray-300 p-2.5 h-20" placeholder="Enter course description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Assign Faculty (Optional)
          </label>
          <select className="w-full rounded-lg border border-gray-300 p-2.5" value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}>
            <option value="">Select Faculty...</option>
            {faculty.map(f => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {selectedCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  </Layout>;
}