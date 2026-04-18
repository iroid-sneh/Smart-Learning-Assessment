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
import {
  validateRequired,
  validateLength,
  validateFutureOrTodayDate,
  todayISODate,
  endOfDayIso,
  isPastDueDate,
  extractApiError,
  hasErrors,
  FieldErrors,
} from '../../utils/validation';

type AssignmentFormField = 'title' | 'description' | 'dueDate' | 'courseId' | 'form';

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
  const [errors, setErrors] = useState<FieldErrors<AssignmentFormField>>({});
  const [saving, setSaving] = useState(false);
  const minDate = todayISODate();

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
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (assignment: any) => {
    if (isPastDueDate(assignment.dueDate)) {
      alert(
        'This assignment is closed. Only an administrator can re-open it with a new due date.'
      );
      return;
    }
    setSelectedAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description || '');
    setDueDate(assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '');
    setCourseId(assignment.course?._id || assignment.course);
    setErrors({});
    setIsModalOpen(true);
  };

  const validateAssignmentForm = (): FieldErrors<AssignmentFormField> => {
    const next: FieldErrors<AssignmentFormField> = {};
    next.courseId = validateRequired(courseId, 'Course');
    next.title =
      validateRequired(title, 'Assignment title') ||
      validateLength(title, 'Assignment title', 3, 200);
    if (description && description.trim().length > 2000) {
      next.description = 'Description must be at most 2000 characters.';
    }
    // On edit, only validate the date if it changed from the past-forbidden window.
    if (!selectedAssignment) {
      next.dueDate = validateFutureOrTodayDate(dueDate, 'Due date');
    } else {
      if (!dueDate) {
        next.dueDate = 'Due date is required.';
      } else {
        const originalISO = selectedAssignment.dueDate
          ? new Date(selectedAssignment.dueDate).toISOString().split('T')[0]
          : '';
        if (dueDate !== originalISO) {
          next.dueDate = validateFutureOrTodayDate(dueDate, 'Due date');
        }
      }
    }
    return next;
  };

  const handleSave = async () => {
    const nextErrors = validateAssignmentForm();
    setErrors(nextErrors);
    if (hasErrors(nextErrors as Record<string, string>)) return;

    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        course: courseId,
        dueDate: endOfDayIso(dueDate),
      };
      if (selectedAssignment) {
        await api.put(`/assignments/${selectedAssignment._id}`, payload);
      } else {
        await api.post('/assignments', payload);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (e: any) {
      console.error(e);
      setErrors({ form: extractApiError(e, 'Failed to save assignment. Please try again.') });
    } finally {
      setSaving(false);
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
        const closed = isPastDueDate(item.dueDate);
        const status = closed ? 'Closed' : 'Active';

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
            {closed && (
              <p className="text-xs text-gray-500 italic">
                Closed — only an administrator can re-open this assignment.
              </p>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex space-x-3">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => handleEdit(item)}
              disabled={closed}
              title={closed ? 'Closed — contact an administrator to re-open.' : undefined}
            >
              Edit
            </Button>
            <Button className="flex-1" onClick={() => navigate('/faculty/evaluation')}>Evaluate</Button>
          </div>
        </Card>
      })}
      {!loading && assignments.length === 0 && <p className="col-span-3 text-gray-500">No assignments created yet.</p>}
    </div>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAssignment ? "Edit Assignment" : "Create New Assignment"}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
        {errors.form && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errors.form}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Course <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full rounded-lg border p-2.5 ${errors.courseId ? 'border-red-500' : 'border-gray-300'}`}
            value={courseId}
            onChange={e => { setCourseId(e.target.value); if (errors.courseId) setErrors(prev => ({ ...prev, courseId: '' })); }}
          >
            <option value="">Select a course...</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
            ))}
          </select>
          {errors.courseId && <p className="mt-1 text-sm text-red-500">{errors.courseId}</p>}
        </div>
        <Input
          label="Assignment Title"
          placeholder="e.g. Final Project"
          value={title}
          onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({ ...prev, title: '' })); }}
          error={errors.title}
          maxLength={200}
          required
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className={`w-full rounded-lg border p-2.5 h-24 ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
            placeholder="Enter assignment details (optional)..."
            value={description}
            maxLength={2000}
            onChange={e => { setDescription(e.target.value); if (errors.description) setErrors(prev => ({ ...prev, description: '' })); }}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          <p className="text-xs text-gray-400">{description.length}/2000 characters</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            min={minDate}
            onChange={e => { setDueDate(e.target.value); if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: '' })); }}
            error={errors.dueDate}
            required
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button" disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} disabled={saving}>
            {selectedAssignment ? "Update Assignment" : "Create Assignment"}
          </Button>
        </div>
      </form>
    </Modal>
  </Layout>;
}