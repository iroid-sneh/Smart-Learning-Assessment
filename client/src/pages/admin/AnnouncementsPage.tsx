import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import api from '../../services/api';

export function AnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('General');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      if (res.data?.success) setAnnouncements(res.data.data);
    } catch (err) {
      console.error("Error loading announcements", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAddNew = () => {
    setSelectedAnnouncement(null);
    setTitle('');
    setMessage('');
    setType('General');
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setTitle(announcement.title);
    setMessage(announcement.message || '');
    setType(announcement.type || 'General');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedAnnouncement) {
        await api.put(`/announcements/${selectedAnnouncement._id}`, { title, message, type });
      } else {
        await api.post('/announcements', { title, message, type });
      }
      fetchAnnouncements();
      setIsModalOpen(false);
    } catch (e: any) {
      console.error("Error saving announcement", e);
      alert('Error: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (e) {
      console.error(e);
    }
  };

  return <Layout role="admin">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600">
          Broadcast updates to students and faculty
        </p>
      </div>
      <Button icon={<Plus className="w-4 h-4" />} onClick={handleAddNew}>
        Create Announcement
      </Button>
    </div>

    <div className="grid grid-cols-1 gap-6">
      {loading ? <p>Loading...</p> : announcements.map(item => <Card key={item._id} className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Badge variant={item.type === 'Academic' ? 'info' : item.type === 'System' ? 'warning' : 'success'}>
              {item.type || 'Announcement'}
            </Badge>
            <span className="text-sm text-gray-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            <span className="text-sm text-gray-500">
              • To: All
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {item.title}
          </h3>
          <p className="text-gray-600">{item.message}</p>
        </div>
        <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          <Button size="sm" variant="secondary" icon={<Edit2 className="w-4 h-4" />} onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(item._id)}>
            Delete
          </Button>
        </div>
      </Card>)}
      {!loading && announcements.length === 0 && <p className="text-gray-500">No announcements found.</p>}
    </div>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAnnouncement ? "Edit Announcement" : "Create Announcement"}>
      <form className="space-y-4">
        <Input label="Title" placeholder="e.g. Exam Schedule Released" value={title} onChange={e => setTitle(e.target.value)} />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Message</label>
          <textarea className="w-full rounded-lg border border-gray-300 p-2.5 h-32" placeholder="Enter announcement details..." value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <select className="w-full rounded-lg border border-gray-300 p-2.5" value={type} onChange={e => setType(e.target.value)}>
            <option value="Academic">Academic</option>
            <option value="Event">Event</option>
            <option value="System">System</option>
            <option value="General">General</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {selectedAnnouncement ? "Update Broadcast" : "Broadcast"}
          </Button>
        </div>
      </form>
    </Modal>
  </Layout>;
}