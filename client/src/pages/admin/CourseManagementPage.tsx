import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Edit2, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  validateRequired,
  validateLength,
  validateCourseCode,
  extractApiError,
  hasErrors,
  FieldErrors,
} from '../../utils/validation';

type CourseFormField = 'title' | 'code' | 'description' | 'faculty' | 'form';

export function AdminCourseManagementPage() {
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState<FieldErrors<CourseFormField>>({});
  const [saving, setSaving] = useState(false);

  // delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [deleteStats, setDeleteStats] = useState<{ materials: number; assignments: number; submissions: number } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setTitle(course.title);
    setCode(course.code);
    setDescription(course.description || '');
    setSelectedFaculty(course.faculty?._id || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const validateCourseForm = (): FieldErrors<CourseFormField> => {
    const next: FieldErrors<CourseFormField> = {};
    next.title =
      validateRequired(title, 'Course title') ||
      validateLength(title, 'Course title', 3, 200);
    next.code = validateCourseCode(code);
    if (description && description.trim().length > 1000) {
      next.description = 'Description must be at most 1000 characters.';
    }
    return next;
  };

  const handleSave = async () => {
    const nextErrors = validateCourseForm();
    setErrors(nextErrors);
    if (hasErrors(nextErrors as Record<string, string>)) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        faculty: selectedFaculty || undefined,
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
      setErrors({ form: extractApiError(err, 'Failed to save course. Please try again.') });
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = async (course: any) => {
    setCourseToDelete(course);
    setDeleteLoading(true);
    setDeleteModalOpen(true);
    try {
      const [matRes, assignRes] = await Promise.all([
        api.get(`/materials/course/${course._id}`),
        api.get(`/assignments/course/${course._id}`),
      ]);
      const mats = matRes.data?.success ? matRes.data.data : [];
      const assigns = assignRes.data?.success ? assignRes.data.data : [];
      let totalSubs = 0;
      await Promise.all(
        assigns.map(async (a: any) => {
          try {
            const subRes = await api.get(`/submissions/assignment/${a._id}`);
            if (subRes.data?.success) totalSubs += subRes.data.data.length;
          } catch {}
        })
      );
      setDeleteStats({ materials: mats.length, assignments: assigns.length, submissions: totalSubs });
    } catch {
      setDeleteStats({ materials: 0, assignments: 0, submissions: 0 });
    }
    setDeleteLoading(false);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete._id}`);
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      setDeleteStats(null);
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
          accessor: (item: any) => (
            <button
              onClick={() => navigate(`/admin/course/${item._id}`)}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
            >
              {item.title}
            </button>
          ),
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
          <Button size="sm" variant="secondary" icon={<Eye className="w-4 h-4" />} onClick={() => navigate(`/admin/course/${item._id}`)}>
            View
          </Button>
          <Button size="sm" variant="secondary" icon={<Edit2 className="w-4 h-4" />} onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => openDeleteModal(item)}>
            Delete
          </Button>
        </div>} />}
    </Card>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedCourse ? 'Edit Course' : 'Add New Course'}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
        {errors.form && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errors.form}
          </div>
        )}
        <Input
          label="Course Name"
          placeholder="e.g. Advanced Web Development"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({ ...prev, title: '' })); }}
          error={errors.title}
          maxLength={200}
          required
        />
        <Input
          label="Course Code"
          placeholder="e.g. CS-601"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); if (errors.code) setErrors(prev => ({ ...prev, code: '' })); }}
          error={errors.code}
          maxLength={20}
          required
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Course Description</label>
          <textarea
            className={`w-full rounded-lg border p-2.5 h-20 ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
            placeholder="Enter course description (optional)"
            value={description}
            maxLength={1000}
            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(prev => ({ ...prev, description: '' })); }}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          <p className="text-xs text-gray-400">{description.length}/1000 characters</p>
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
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button" disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} disabled={saving}>
            {selectedCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>

    {/* Delete Confirmation Modal */}
    <Modal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setCourseToDelete(null); setDeleteStats(null); }} title="Delete Course">
      {courseToDelete && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">This action cannot be undone.</p>
              <p className="text-sm text-red-600 mt-1">
                Deleting this course will permanently remove all associated data.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Course Details</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Course</span>
                <span className="font-medium text-gray-800">{courseToDelete.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Code</span>
                <span className="font-medium text-gray-800">{courseToDelete.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Faculty</span>
                <span className="font-medium text-gray-800">{courseToDelete.faculty?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Students Enrolled</span>
                <Badge variant={courseToDelete.students?.length > 0 ? 'warning' : 'neutral'}>
                  {courseToDelete.students?.length || 0}
                </Badge>
              </div>
            </div>
          </div>

          {deleteLoading ? (
            <p className="text-sm text-gray-500 text-center py-3">Loading course data...</p>
          ) : deleteStats && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Data that will be lost</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{deleteStats.materials}</p>
                  <p className="text-xs text-gray-500">Materials</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{deleteStats.assignments}</p>
                  <p className="text-xs text-gray-500">Assignments</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{deleteStats.submissions}</p>
                  <p className="text-xs text-gray-500">Submissions</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={() => { setDeleteModalOpen(false); setCourseToDelete(null); setDeleteStats(null); }}>
              Cancel
            </Button>
            <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={confirmDelete} isLoading={deleteLoading}>
              Delete Course
            </Button>
          </div>
        </div>
      )}
    </Modal>
  </Layout>;
}