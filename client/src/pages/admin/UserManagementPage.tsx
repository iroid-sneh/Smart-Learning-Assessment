import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import api from '../../services/api';

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
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
      <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddNew}>
        Add {activeTab === 'student' ? 'Student' : 'Faculty'}
      </Button>
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
          <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(item._id)}>
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
  </Layout>;
}