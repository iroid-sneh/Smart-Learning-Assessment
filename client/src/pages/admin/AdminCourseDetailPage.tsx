import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { FolderCard } from '../../components/ui/FolderCard';
import { FileUpload } from '../../components/ui/FileUpload';
import { ArrowLeft, Users, BookOpen, FileText, ClipboardList, Download, Eye, Plus, Edit2, Trash2, UserMinus, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import {
  validateRequired,
  validateLength,
  validateFutureOrTodayDate,
  validateFile,
  todayISODate,
  endOfDayIso,
  extractApiError,
  hasErrors,
  FieldErrors,
} from '../../utils/validation';

type MaterialFormField = 'title' | 'description' | 'file' | 'form';
type AssignFormField = 'title' | 'description' | 'dueDate' | 'form';

export function AdminCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState<Record<string, any[]>>({});
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  // Material modal state
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [matTitle, setMatTitle] = useState('');
  const [matDescription, setMatDescription] = useState('');
  const [matFile, setMatFile] = useState<File | null>(null);
  const [matErrors, setMatErrors] = useState<FieldErrors<MaterialFormField>>({});
  const [matSaving, setMatSaving] = useState(false);

  // Assignment modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDescription, setAssignDescription] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignErrors, setAssignErrors] = useState<FieldErrors<AssignFormField>>({});
  const [assignSaving, setAssignSaving] = useState(false);
  const minAssignDate = todayISODate();

  const MATERIAL_ACCEPT = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];

  // Delete course modal state
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);

  // Delete material modal state
  const [deleteMaterialModalOpen, setDeleteMaterialModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<any>(null);
  const [materialDeleting, setMaterialDeleting] = useState(false);

  // Delete assignment modal state
  const [deleteAssignmentModalOpen, setDeleteAssignmentModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<any>(null);
  const [assignmentDeleting, setAssignmentDeleting] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students' },
    { id: 'materials', label: 'Materials' },
    { id: 'assignments', label: 'Assignments' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, matRes, assignRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/materials/course/${id}`),
        api.get(`/assignments/course/${id}`),
      ]);

      if (courseRes.data?.success) setCourse(courseRes.data.data);
      if (matRes.data?.success) setMaterials(matRes.data.data);
      if (assignRes.data?.success) {
        const assignmentsData = assignRes.data.data;
        setAssignments(assignmentsData);

        const subsMap: Record<string, any[]> = {};
        await Promise.all(
          assignmentsData.map(async (a: any) => {
            try {
              const subRes = await api.get(`/submissions/assignment/${a._id}`);
              if (subRes.data?.success) {
                subsMap[a._id] = subRes.data.data;
              }
            } catch {
              subsMap[a._id] = [];
            }
          })
        );
        setSubmissionsByAssignment(subsMap);
      }
    } catch (e) {
      console.error('Failed to fetch course details', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // --- Submission viewing ---
  const handleViewSubmissions = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setSubmissionModalOpen(true);
  };

  const selectedAssignment = assignments.find(a => a._id === selectedAssignmentId);
  const selectedSubmissions = selectedAssignmentId ? (submissionsByAssignment[selectedAssignmentId] || []) : [];

  const totalSubmissions = Object.values(submissionsByAssignment).reduce((sum, subs) => sum + subs.length, 0);
  const totalEvaluated = Object.values(submissionsByAssignment).reduce(
    (sum, subs) => sum + subs.filter((s: any) => s.status === 'evaluated').length, 0
  );

  // --- Material CRUD ---
  const openAddMaterial = () => {
    setEditingMaterial(null);
    setMatTitle('');
    setMatDescription('');
    setMatFile(null);
    setMatErrors({});
    setMaterialModalOpen(true);
  };

  const openEditMaterial = (mat: any) => {
    setEditingMaterial(mat);
    setMatTitle(mat.title);
    setMatDescription(mat.description || '');
    setMatFile(null);
    setMatErrors({});
    setMaterialModalOpen(true);
  };

  const validateMaterialForm = (): FieldErrors<MaterialFormField> => {
    const next: FieldErrors<MaterialFormField> = {};
    next.title =
      validateRequired(matTitle, 'Title') ||
      validateLength(matTitle, 'Title', 3, 200);
    if (matDescription && matDescription.trim().length > 1000) {
      next.description = 'Description must be at most 1000 characters.';
    }
    if (!editingMaterial) {
      next.file = validateFile(matFile, { maxSizeMB: 25, allowedExtensions: MATERIAL_ACCEPT });
    }
    return next;
  };

  const handleSaveMaterial = async () => {
    const nextErrors = validateMaterialForm();
    setMatErrors(nextErrors);
    if (hasErrors(nextErrors as Record<string, string>)) return;

    setMatSaving(true);
    try {
      if (editingMaterial) {
        await api.put(`/materials/${editingMaterial._id}`, {
          title: matTitle.trim(),
          description: matDescription.trim(),
        });
      } else {
        const formData = new FormData();
        formData.append('title', matTitle.trim());
        formData.append('description', matDescription.trim());
        formData.append('file', matFile as File);
        await api.post(`/materials/course/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setMaterialModalOpen(false);
      fetchData();
    } catch (e: any) {
      console.error(e);
      setMatErrors({ form: extractApiError(e, 'Failed to save material. Please try again.') });
    } finally {
      setMatSaving(false);
    }
  };

  const openDeleteMaterial = (mat: any) => {
    setMaterialToDelete(mat);
    setDeleteMaterialModalOpen(true);
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;
    setMaterialDeleting(true);
    try {
      await api.delete(`/materials/${materialToDelete._id}`);
      setDeleteMaterialModalOpen(false);
      setMaterialToDelete(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setMaterialDeleting(false);
    }
  };

  // --- Assignment CRUD ---
  const openAddAssignment = () => {
    setEditingAssignment(null);
    setAssignTitle('');
    setAssignDescription('');
    setAssignDueDate('');
    setAssignErrors({});
    setAssignmentModalOpen(true);
  };

  const openEditAssignment = (a: any) => {
    setEditingAssignment(a);
    setAssignTitle(a.title);
    setAssignDescription(a.description || '');
    setAssignDueDate(a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '');
    setAssignErrors({});
    setAssignmentModalOpen(true);
  };

  const validateAssignForm = (): FieldErrors<AssignFormField> => {
    const next: FieldErrors<AssignFormField> = {};
    next.title =
      validateRequired(assignTitle, 'Title') ||
      validateLength(assignTitle, 'Title', 3, 200);
    if (assignDescription && assignDescription.trim().length > 2000) {
      next.description = 'Description must be at most 2000 characters.';
    }
    if (!editingAssignment) {
      next.dueDate = validateFutureOrTodayDate(assignDueDate, 'Due date');
    } else if (assignDueDate) {
      const originalISO = editingAssignment.dueDate
        ? new Date(editingAssignment.dueDate).toISOString().split('T')[0]
        : '';
      if (assignDueDate !== originalISO) {
        next.dueDate = validateFutureOrTodayDate(assignDueDate, 'Due date');
      }
    } else {
      next.dueDate = 'Due date is required.';
    }
    return next;
  };

  const handleSaveAssignment = async () => {
    const nextErrors = validateAssignForm();
    setAssignErrors(nextErrors);
    if (hasErrors(nextErrors as Record<string, string>)) return;

    setAssignSaving(true);
    try {
      if (editingAssignment) {
        const payload: any = {
          title: assignTitle.trim(),
          description: assignDescription.trim(),
        };
        if (assignDueDate) payload.dueDate = endOfDayIso(assignDueDate);
        await api.put(`/assignments/${editingAssignment._id}`, payload);
      } else {
        await api.post(`/assignments/course/${id}`, {
          title: assignTitle.trim(),
          description: assignDescription.trim(),
          course: id,
          dueDate: endOfDayIso(assignDueDate),
        });
      }
      setAssignmentModalOpen(false);
      fetchData();
    } catch (e: any) {
      console.error(e);
      setAssignErrors({ form: extractApiError(e, 'Failed to save assignment. Please try again.') });
    } finally {
      setAssignSaving(false);
    }
  };

  const openDeleteAssignment = (a: any) => {
    setAssignmentToDelete(a);
    setDeleteAssignmentModalOpen(true);
  };

  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    setAssignmentDeleting(true);
    try {
      await api.delete(`/assignments/${assignmentToDelete._id}`);
      setDeleteAssignmentModalOpen(false);
      setAssignmentToDelete(null);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setAssignmentDeleting(false);
    }
  };

  // --- Remove student from course ---
  const handleRemoveStudent = async (studentId: string) => {
    if (!window.confirm('Remove this student from the course?')) return;
    try {
      const updatedStudents = (course.students || [])
        .filter((s: any) => s._id !== studentId)
        .map((s: any) => s._id);
      await api.put(`/courses/${id}`, { students: updatedStudents });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDeleteCourse = async () => {
    try {
      await api.delete(`/courses/${id}`);
      navigate('/admin/courses');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <Layout role="admin" pageTitle="Course Details">
      <div className="p-8 text-gray-500">Loading course details...</div>
    </Layout>
  );

  if (!course) return (
    <Layout role="admin" pageTitle="Course Details">
      <div className="p-8 text-red-500">Course not found.</div>
    </Layout>
  );

  return (
    <Layout role="admin" pageTitle={course.title}>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Courses
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-500 mt-1">
              {course.code} &bull; Faculty: {course.faculty?.name || 'Unassigned'}
            </p>
            {course.description && (
              <p className="text-gray-400 mt-2 text-sm max-w-2xl">{course.description}</p>
            )}
          </div>
          <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => setDeleteCourseModalOpen(true)}>
            Delete Course
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{course.students?.length || 0}</p>
            <p className="text-xs text-gray-500">Enrolled Students</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-xl">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
            <p className="text-xs text-gray-500">Study Materials</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            <p className="text-xs text-gray-500">Assignments</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl">
            <ClipboardList className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalSubmissions}</p>
            <p className="text-xs text-gray-500">Total Submissions ({totalEvaluated} evaluated)</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Title</span>
                <span className="font-medium text-gray-800">{course.title}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Code</span>
                <span className="font-medium text-gray-800">{course.code}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Faculty</span>
                <span className="font-medium text-gray-800">{course.faculty?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Faculty Email</span>
                <span className="font-medium text-gray-800">{course.faculty?.email || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Students Enrolled</span>
                <span className="font-medium text-gray-800">{course.students?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-800">{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Summary</h3>
            {assignments.length === 0 ? (
              <p className="text-gray-400 text-sm">No assignments created yet.</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((a: any) => {
                  const subs = submissionsByAssignment[a._id] || [];
                  const evaluated = subs.filter((s: any) => s.status === 'evaluated').length;
                  const isPastDue = new Date() > new Date(a.dueDate);
                  return (
                    <div key={a._id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{a.title}</p>
                        <p className="text-xs text-gray-400">
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={isPastDue ? 'danger' : 'success'}>
                          {isPastDue ? 'Past Due' : 'Active'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {subs.length} submitted &bull; {evaluated} evaluated
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="pt-4">
          <Card noPadding>
            <Table
              data={course.students || []}
              keyField="_id"
              columns={[
                {
                  header: 'Name',
                  accessor: (s: any) => s.name || 'Unknown',
                  className: 'font-medium',
                },
                {
                  header: 'Email',
                  accessor: (s: any) => s.email || '-',
                },
                {
                  header: 'Status',
                  accessor: (s: any) => (
                    <Badge variant={s.isActive !== false ? 'success' : 'danger'}>
                      {s.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  ),
                },
                {
                  header: 'Submissions',
                  accessor: (s: any) => {
                    let count = 0;
                    Object.values(submissionsByAssignment).forEach((subs: any[]) => {
                      count += subs.filter((sub: any) => (sub.student?._id || sub.student) === s._id).length;
                    });
                    return `${count} / ${assignments.length}`;
                  },
                },
              ]}
              actions={(item: any) => (
                <div className="flex justify-end">
                  <Button size="sm" variant="danger" icon={<UserMinus className="w-4 h-4" />}
                    onClick={() => handleRemoveStudent(item._id)}>
                    Remove
                  </Button>
                </div>
              )}
              emptyMessage="No students enrolled in this course."
            />
          </Card>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="pt-4">
          <div className="flex justify-end mb-4">
            <Button icon={<Plus className="w-4 h-4" />} onClick={openAddMaterial}>
              Upload Material
            </Button>
          </div>
          {materials.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No study materials uploaded yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-10 justify-items-center">
                {materials.map((item: any) => (
                  <FolderCard
                    key={item._id}
                    title={item.title}
                    subtitle={`${new Date(item.createdAt).toLocaleDateString()} ${item.uploadedBy?.name ? '- ' + item.uploadedBy.name : ''}`}
                    fileUrl={item.fileUrl}
                  />
                ))}
              </div>

              <div className="mt-10">
                <Card noPadding>
                  <Table
                    data={materials}
                    keyField="_id"
                    columns={[
                      { header: 'Title', accessor: 'title', className: 'font-medium' },
                      {
                        header: 'Description',
                        accessor: (m: any) => m.description || '-',
                      },
                      {
                        header: 'Uploaded By',
                        accessor: (m: any) => m.uploadedBy?.name || 'Unknown',
                      },
                      {
                        header: 'Uploaded On',
                        accessor: (m: any) => new Date(m.createdAt).toLocaleDateString(),
                      },
                    ]}
                    actions={(item: any) => (
                      <div className="flex justify-end space-x-2">
                        {item.fileUrl && (
                          <Button size="sm" variant="secondary" icon={<Download className="w-4 h-4" />}
                            onClick={() => window.open(item.fileUrl, '_blank')}>
                            View
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" icon={<Edit2 className="w-4 h-4" />}
                          onClick={() => openEditMaterial(item)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => openDeleteMaterial(item)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  />
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="pt-4">
          <div className="flex justify-end mb-4">
            <Button icon={<Plus className="w-4 h-4" />} onClick={openAddAssignment}>
              Create Assignment
            </Button>
          </div>
          <Card noPadding>
            <Table
              data={assignments}
              keyField="_id"
              columns={[
                { header: 'Title', accessor: 'title', className: 'font-medium' },
                {
                  header: 'Due Date',
                  accessor: (a: any) => new Date(a.dueDate).toLocaleDateString(),
                },
                {
                  header: 'Status',
                  accessor: (a: any) => {
                    const isPastDue = new Date() > new Date(a.dueDate);
                    return <Badge variant={isPastDue ? 'danger' : 'success'}>{isPastDue ? 'Past Due' : 'Active'}</Badge>;
                  },
                },
                {
                  header: 'Submissions',
                  accessor: (a: any) => {
                    const subs = submissionsByAssignment[a._id] || [];
                    const studentCount = course.students?.length || 0;
                    return `${subs.length} / ${studentCount}`;
                  },
                },
                {
                  header: 'Evaluated',
                  accessor: (a: any) => {
                    const subs = submissionsByAssignment[a._id] || [];
                    const evaluated = subs.filter((s: any) => s.status === 'evaluated').length;
                    return `${evaluated} / ${subs.length}`;
                  },
                },
              ]}
              actions={(item: any) => (
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="secondary" icon={<Eye className="w-4 h-4" />}
                    onClick={() => handleViewSubmissions(item._id)}>
                    Submissions
                  </Button>
                  <Button size="sm" variant="secondary" icon={<Edit2 className="w-4 h-4" />}
                    onClick={() => openEditAssignment(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => openDeleteAssignment(item)}>
                    Delete
                  </Button>
                </div>
              )}
              emptyMessage="No assignments created for this course."
            />
          </Card>
        </div>
      )}

      {/* Submissions Modal */}
      <Modal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        title={selectedAssignment ? `Submissions: ${selectedAssignment.title}` : 'Submissions'}
        maxWidth="xl"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {selectedSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions yet for this assignment.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">Student</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">Submitted</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">Marks</th>
                  <th className="py-3 px-3 text-sm font-semibold text-gray-600">File</th>
                </tr>
              </thead>
              <tbody>
                {selectedSubmissions.map((sub: any) => (
                  <tr key={sub._id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-3 text-sm font-medium text-gray-800">
                      {sub.student?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600">
                      {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={sub.status === 'evaluated' ? 'success' : 'warning'}>
                        {sub.status === 'evaluated' ? 'Evaluated' : 'Submitted'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-800">
                      {sub.marks !== undefined && sub.marks !== null ? sub.marks : '-'}
                    </td>
                    <td className="py-3 px-3">
                      {sub.fileUrl ? (
                        <button
                          onClick={() => window.open(sub.fileUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {selectedSubmissions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
              {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} &bull;{' '}
              {selectedSubmissions.filter((s: any) => s.status === 'evaluated').length} evaluated &bull;{' '}
              {selectedSubmissions.filter((s: any) => s.marks !== undefined && s.marks !== null).length > 0 && (
                <>
                  Avg marks:{' '}
                  {(
                    selectedSubmissions
                      .filter((s: any) => s.marks !== undefined && s.marks !== null)
                      .reduce((sum: number, s: any) => sum + s.marks, 0) /
                    selectedSubmissions.filter((s: any) => s.marks !== undefined && s.marks !== null).length
                  ).toFixed(1)}
                </>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Material Add/Edit Modal */}
      <Modal
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        title={editingMaterial ? 'Edit Material' : 'Upload Material'}
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveMaterial(); }} noValidate>
          {matErrors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {matErrors.form}
            </div>
          )}
          <Input
            label="Title"
            placeholder="e.g. Chapter 1 Notes"
            value={matTitle}
            onChange={e => { setMatTitle(e.target.value); if (matErrors.title) setMatErrors(prev => ({ ...prev, title: '' })); }}
            error={matErrors.title}
            maxLength={200}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className={`w-full rounded-lg border p-2.5 h-20 ${matErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
              placeholder="Enter description (optional)"
              value={matDescription}
              maxLength={1000}
              onChange={e => { setMatDescription(e.target.value); if (matErrors.description) setMatErrors(prev => ({ ...prev, description: '' })); }}
            />
            {matErrors.description && <p className="mt-1 text-sm text-red-500">{matErrors.description}</p>}
            <p className="text-xs text-gray-400">{matDescription.length}/1000 characters</p>
          </div>
          {!editingMaterial && (
            <div>
              <FileUpload
                onFileSelect={file => { setMatFile(file); if (matErrors.file) setMatErrors(prev => ({ ...prev, file: '' })); }}
                accept={MATERIAL_ACCEPT.join(',')}
                label="File"
              />
              {matErrors.file && <p className="mt-1 text-sm text-red-500">{matErrors.file}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Accepted: {MATERIAL_ACCEPT.join(', ')} &bull; Max size: 25 MB
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setMaterialModalOpen(false)} type="button" disabled={matSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={matSaving} disabled={matSaving}>
              {editingMaterial ? 'Update Material' : 'Upload Material'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assignment Add/Edit Modal */}
      <Modal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        title={editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveAssignment(); }} noValidate>
          {assignErrors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {assignErrors.form}
            </div>
          )}
          <Input
            label="Title"
            placeholder="e.g. Assignment 1 - React Basics"
            value={assignTitle}
            onChange={e => { setAssignTitle(e.target.value); if (assignErrors.title) setAssignErrors(prev => ({ ...prev, title: '' })); }}
            error={assignErrors.title}
            maxLength={200}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className={`w-full rounded-lg border p-2.5 h-20 ${assignErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
              placeholder="Enter assignment description (optional)"
              value={assignDescription}
              maxLength={2000}
              onChange={e => { setAssignDescription(e.target.value); if (assignErrors.description) setAssignErrors(prev => ({ ...prev, description: '' })); }}
            />
            {assignErrors.description && <p className="mt-1 text-sm text-red-500">{assignErrors.description}</p>}
            <p className="text-xs text-gray-400">{assignDescription.length}/2000 characters</p>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={assignDueDate}
            min={minAssignDate}
            onChange={e => { setAssignDueDate(e.target.value); if (assignErrors.dueDate) setAssignErrors(prev => ({ ...prev, dueDate: '' })); }}
            error={assignErrors.dueDate}
            required
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setAssignmentModalOpen(false)} type="button" disabled={assignSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={assignSaving} disabled={assignSaving}>
              {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Course Confirmation Modal */}
      <Modal isOpen={deleteCourseModalOpen} onClose={() => setDeleteCourseModalOpen(false)} title="Delete Course">
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">This action cannot be undone.</p>
              <p className="text-sm text-red-600 mt-1">
                Deleting this course will permanently remove all associated data including materials, assignments, and submissions.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Course Details</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Course</span>
                <span className="font-medium text-gray-800">{course.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Code</span>
                <span className="font-medium text-gray-800">{course.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Faculty</span>
                <span className="font-medium text-gray-800">{course.faculty?.name || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">Data that will be lost</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{course.students?.length || 0}</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{materials.length}</p>
                <p className="text-xs text-gray-500">Materials</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{assignments.length}</p>
                <p className="text-xs text-gray-500">Assignments</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{totalSubmissions}</p>
                <p className="text-xs text-gray-500">Submissions</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={confirmDeleteCourse}>
              Delete Course
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Material Confirmation Modal */}
      <Modal
        isOpen={deleteMaterialModalOpen}
        onClose={() => { setDeleteMaterialModalOpen(false); setMaterialToDelete(null); }}
        title="Delete Material"
      >
        {materialToDelete && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">This action cannot be undone.</p>
                <p className="text-sm text-red-600 mt-1">
                  Deleting this material will permanently remove the file and its record for all enrolled students.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Material Details</h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Title</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">{materialToDelete.title}</span>
                </div>
                {materialToDelete.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Description</span>
                    <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">{materialToDelete.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Uploaded</span>
                  <span className="font-medium text-gray-800">
                    {materialToDelete.createdAt ? new Date(materialToDelete.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => { setDeleteMaterialModalOpen(false); setMaterialToDelete(null); }}
                disabled={materialDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={confirmDeleteMaterial}
                isLoading={materialDeleting}
                disabled={materialDeleting}
              >
                Delete Material
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Assignment Confirmation Modal */}
      <Modal
        isOpen={deleteAssignmentModalOpen}
        onClose={() => { setDeleteAssignmentModalOpen(false); setAssignmentToDelete(null); }}
        title="Delete Assignment"
      >
        {assignmentToDelete && (() => {
          const subs = submissionsByAssignment[assignmentToDelete._id] || [];
          const evaluated = subs.filter((s: any) => s.status === 'evaluated').length;
          return (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">This action cannot be undone.</p>
                  <p className="text-sm text-red-600 mt-1">
                    Deleting this assignment will also remove all associated submissions and evaluations.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Assignment Details</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Title</span>
                    <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">{assignmentToDelete.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date</span>
                    <span className="font-medium text-gray-800">
                      {assignmentToDelete.dueDate ? new Date(assignmentToDelete.dueDate).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge variant={new Date() > new Date(assignmentToDelete.dueDate) ? 'danger' : 'success'}>
                      {new Date() > new Date(assignmentToDelete.dueDate) ? 'Past Due' : 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Data that will be lost</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-gray-900">{subs.length}</p>
                    <p className="text-xs text-gray-500">Submissions</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-gray-900">{evaluated}</p>
                    <p className="text-xs text-gray-500">Evaluated</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => { setDeleteAssignmentModalOpen(false); setAssignmentToDelete(null); }}
                  disabled={assignmentDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={confirmDeleteAssignment}
                  isLoading={assignmentDeleting}
                  disabled={assignmentDeleting}
                >
                  Delete Assignment
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </Layout>
  );
}
