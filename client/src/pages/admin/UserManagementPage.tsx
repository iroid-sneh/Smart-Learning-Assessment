import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Edit2, Trash2, Power, Download, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { exportToCsv, exportToExcel } from '../../utils/exportData';

export function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');

  // Delete faculty reassign state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [facultyCourses, setFacultyCourses] = useState<any[]>([]);
  const [courseReassignments, setCourseReassignments] = useState<Record<string, string>>({});
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data?.success) setUsers(res.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setDepartment(user.department || '');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setName('');
    setEmail('');
    setDepartment('');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, { name, email, department });
      } else {
        await api.post('/auth/register', { name, email, password, role: activeTab });
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error saving user", e);
      alert("Failed to save user check console for errors.");
    }
  };

  const openDeleteModal = async (user: any) => {
    setUserToDelete(user);
    setCourseReassignments({});

    if (user.role === 'faculty') {
      setDeleteLoading(true);
      setDeleteModalOpen(true);
      try {
        const coursesRes = await api.get('/courses');
        if (coursesRes.data?.success) {
          const all = coursesRes.data.data;
          setAllCourses(all);
          const assigned = all.filter((c: any) =>
            (c.faculty?._id || c.faculty) === user._id
          );
          setFacultyCourses(assigned);
          const initial: Record<string, string> = {};
          assigned.forEach((c: any) => { initial[c._id] = ''; });
          setCourseReassignments(initial);
        }
      } catch (e) {
        console.error(e);
      }
      setDeleteLoading(false);
    } else {
      setFacultyCourses([]);
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      // If faculty with courses, reassign first
      if (userToDelete.role === 'faculty' && facultyCourses.length > 0) {
        await Promise.all(
          facultyCourses.map(async (c: any) => {
            const newFacultyId = courseReassignments[c._id];
            if (newFacultyId) {
              await api.put(`/courses/${c._id}`, { faculty: newFacultyId });
            }
          })
        );
      }
      await api.delete(`/users/${userToDelete._id}`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      setFacultyCourses([]);
      setCourseReassignments({});
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert('Failed to delete user.');
    }
    setDeleteLoading(false);
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const students = users.filter(u => u.role === 'student');
  const faculty = users.filter(u => u.role === 'faculty');

  const currentData = activeTab === 'student' ? students : faculty;

  const handleExport = (format: 'csv' | 'excel') => {
    const headers = ['Name', 'Email', 'Status'];
    const rows = currentData.map((u: any) => [
      u.name || '',
      u.email || '',
      u.isActive ? 'Active' : 'Inactive',
    ]);
    const label = activeTab === 'student' ? 'Students' : 'Faculty';
    if (format === 'csv') {
      exportToCsv(headers, rows, `${label}_List`);
    } else {
      exportToExcel(headers, rows, `${label}_List`);
    }
  };

  const columns = [{
    header: 'Name',
    accessor: 'name',
    className: 'font-medium'
  }, {
    header: 'Email',
    accessor: 'email'
  }, {
    header: 'Status',
    accessor: (item: any) => <Badge variant={item.isActive ? 'success' : 'danger'}>
      {item.isActive ? 'Active' : 'Inactive'}
    </Badge>
  }];

  return <Layout role="admin">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage students and faculty members</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => handleExport('csv')}>
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => handleExport('excel')}>
          Export Excel
        </Button>
        <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddNew}>
          Add {activeTab === 'student' ? 'Student' : 'Faculty'}
        </Button>
      </div>
    </div>

    <Tabs tabs={[{
      id: 'student',
      label: 'Students'
    }, {
      id: 'faculty',
      label: 'Faculty'
    }]} activeTab={activeTab} onChange={setActiveTab} />

    <Card noPadding>
      {loading ? <div className="p-8">Loading...</div> :
        <Table data={activeTab === 'student' ? students : faculty} keyField="_id" columns={columns} actions={item => <div className="flex justify-end space-x-2">
          <Button size="sm" variant="secondary" icon={<Power className="w-4 h-4" />} onClick={() => handleToggleStatus(item)}>
            {item.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="sm" variant="secondary" icon={<Edit2 className="w-4 h-4" />} onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => openDeleteModal(item)}>
            Delete
          </Button>
        </div>} />}
    </Card>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedUser ? 'Edit User' : `Add New ${activeTab === 'student' ? 'Student' : 'Faculty'}`}>
      <form className="space-y-4">
        <Input label="Full Name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email Address" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        {!selectedUser && <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
            Cancel
          </Button>
          <Button type="button" onClick={handleSaveUser}>
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>

    {/* Delete Confirmation / Faculty Reassign Modal */}
    <Modal
      isOpen={deleteModalOpen}
      onClose={() => { setDeleteModalOpen(false); setUserToDelete(null); setFacultyCourses([]); setCourseReassignments({}); }}
      title={userToDelete?.role === 'faculty' && facultyCourses.length > 0 ? 'Reassign Courses & Delete Faculty' : 'Delete User'}
      maxWidth={userToDelete?.role === 'faculty' && facultyCourses.length > 0 ? 'lg' : 'md'}
    >
      {userToDelete && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">This action cannot be undone.</p>
              <p className="text-sm text-red-600 mt-1">
                You are about to permanently delete <strong>{userToDelete.name}</strong> ({userToDelete.email}).
              </p>
            </div>
          </div>

          {/* Faculty course reassignment */}
          {userToDelete.role === 'faculty' && facultyCourses.length > 0 && (
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>{userToDelete.name}</strong> is currently assigned to <strong>{facultyCourses.length}</strong> course{facultyCourses.length !== 1 ? 's' : ''}.
                  Please reassign each course to another faculty member before deleting.
                </p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {facultyCourses.map((c: any) => (
                  <div key={c._id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.title}</p>
                        <p className="text-xs text-gray-500">{c.code} &bull; {c.students?.length || 0} students</p>
                      </div>
                    </div>
                    <select
                      className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                      value={courseReassignments[c._id] || ''}
                      onChange={e => setCourseReassignments(prev => ({ ...prev, [c._id]: e.target.value }))}
                    >
                      <option value="">Select new faculty...</option>
                      {users
                        .filter(u => u.role === 'faculty' && u._id !== userToDelete._id && u.isActive)
                        .map(f => (
                          <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                        ))
                      }
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userToDelete.role === 'faculty' && deleteLoading && facultyCourses.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">Checking assigned courses...</p>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={() => { setDeleteModalOpen(false); setUserToDelete(null); setFacultyCourses([]); setCourseReassignments({}); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={confirmDelete}
              isLoading={deleteLoading}
              disabled={
                deleteLoading ||
                (userToDelete.role === 'faculty' && facultyCourses.length > 0 &&
                  facultyCourses.some((c: any) => !courseReassignments[c._id]))
              }
            >
              {userToDelete.role === 'faculty' && facultyCourses.length > 0
                ? 'Reassign & Delete'
                : 'Delete User'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  </Layout>;
}