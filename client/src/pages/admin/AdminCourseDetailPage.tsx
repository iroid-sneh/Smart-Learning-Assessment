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

  // Assignment modal state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDescription, setAssignDescription] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  // Delete course modal state
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);

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
    setMaterialModalOpen(true);
  };

  const openEditMaterial = (mat: any) => {
    setEditingMaterial(mat);
    setMatTitle(mat.title);
    setMatDescription(mat.description || '');
    setMatFile(null);
    setMaterialModalOpen(true);
  };

  const handleSaveMaterial = async () => {
    try {
      if (editingMaterial) {
        await api.put(`/materials/${editingMaterial._id}`, {
          title: matTitle,
          description: matDescription,
        });
      } else {
        if (!matFile) {
          alert('Please select a file to upload.');
          return;
        }
        const formData = new FormData();
        formData.append('title', matTitle);
        formData.append('description', matDescription);
        formData.append('file', matFile);
        await api.post(`/materials/course/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setMaterialModalOpen(false);
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert('Error saving material: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await api.delete(`/materials/${matId}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- Assignment CRUD ---
  const openAddAssignment = () => {
    setEditingAssignment(null);
    setAssignTitle('');
    setAssignDescription('');
    setAssignDueDate('');
    setAssignmentModalOpen(true);
  };

  const openEditAssignment = (a: any) => {
    setEditingAssignment(a);
    setAssignTitle(a.title);
    setAssignDescription(a.description || '');
    setAssignDueDate(a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '');
    setAssignmentModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    try {
      if (editingAssignment) {
        const payload: any = { title: assignTitle, description: assignDescription };
        if (assignDueDate) payload.dueDate = new Date(assignDueDate).toISOString();
        await api.put(`/assignments/${editingAssignment._id}`, payload);
      } else {
        await api.post(`/assignments/course/${id}`, {
          title: assignTitle,
          description: assignDescription,
          course: id,
          dueDate: new Date(assignDueDate).toISOString(),
        });
      }
      setAssignmentModalOpen(false);
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert('Error saving assignment: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDeleteAssignment = async (assignId: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${assignId}`);
      fetchData();
    } catch (e) {
      console.error(e);
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
    <Layout role="admin">
      <div className="p-8 text-gray-500">Loading course details...</div>
    </Layout>
  );

  if (!course) return (
    <Layout role="admin">
      <div className="p-8 text-red-500">Course not found.</div>
    </Layout>
  );

  return (
    <Layout role="admin">
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
                          onClick={() => handleDeleteMaterial(item._id)}>
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
                    onClick={() => handleDeleteAssignment(item._id)}>
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
        <form className="space-y-4">
          <Input label="Title" placeholder="e.g. Chapter 1 Notes" value={matTitle}
            onChange={e => setMatTitle(e.target.value)} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea className="w-full rounded-lg border border-gray-300 p-2.5 h-20"
              placeholder="Enter description (optional)" value={matDescription}
              onChange={e => setMatDescription(e.target.value)} />
          </div>
          {!editingMaterial && (
            <FileUpload
              onFileSelect={file => setMatFile(file)}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
              label="File"
            />
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setMaterialModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveMaterial}>
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
        <form className="space-y-4">
          <Input label="Title" placeholder="e.g. Assignment 1 - React Basics" value={assignTitle}
            onChange={e => setAssignTitle(e.target.value)} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea className="w-full rounded-lg border border-gray-300 p-2.5 h-20"
              placeholder="Enter assignment description (optional)" value={assignDescription}
              onChange={e => setAssignDescription(e.target.value)} />
          </div>
          <Input label="Due Date" type="date" value={assignDueDate}
            onChange={e => setAssignDueDate(e.target.value)} />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setAssignmentModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveAssignment}>
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
    </Layout>
  );
}
