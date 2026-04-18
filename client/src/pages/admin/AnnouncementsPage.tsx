import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import api from '../../services/api';
import {
  validateRequired,
  validateLength,
  extractApiError,
  hasErrors,
  FieldErrors,
} from '../../utils/validation';

type AnnouncementFormField = 'title' | 'message' | 'type' | 'form';
const ALLOWED_TYPES = ['Academic', 'Event', 'System', 'General'] as const;

export function AnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('General');
  const [errors, setErrors] = useState<FieldErrors<AnnouncementFormField>>({});
  const [saving, setSaving] = useState(false);

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
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setTitle(announcement.title);
    setMessage(announcement.message || '');
    setType(announcement.type || 'General');
    setErrors({});
    setIsModalOpen(true);
  };

  const validateAnnouncementForm = (): FieldErrors<AnnouncementFormField> => {
    const next: FieldErrors<AnnouncementFormField> = {};
    next.title =
      validateRequired(title, 'Title') ||
      validateLength(title, 'Title', 3, 200);
    next.message =
      validateRequired(message, 'Message') ||
      validateLength(message, 'Message', 10, 2000);
    if (!ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
      next.type = 'Please select a valid announcement type.';
    }
    return next;
  };

  const handleSave = async () => {
    const nextErrors = validateAnnouncementForm();
    setErrors(nextErrors);
    if (hasErrors(nextErrors as Record<string, string>)) return;

    setSaving(true);
    try {
      const payload = { title: title.trim(), message: message.trim(), type };
      if (selectedAnnouncement) {
        await api.put(`/announcements/${selectedAnnouncement._id}`, payload);
      } else {
        await api.post('/announcements', payload);
      }
      fetchAnnouncements();
      setIsModalOpen(false);
    } catch (e: any) {
      console.error("Error saving announcement", e);
      setErrors({ form: extractApiError(e, 'Failed to save announcement. Please try again.') });
    } finally {
      setSaving(false);
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
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
        {errors.form && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errors.form}
          </div>
        )}
        <Input
          label="Title"
          placeholder="e.g. Exam Schedule Released"
          value={title}
          onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({ ...prev, title: '' })); }}
          error={errors.title}
          maxLength={200}
          required
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
          <textarea
            className={`w-full rounded-lg border p-2.5 h-32 ${errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
            placeholder="Enter announcement details (minimum 10 characters)..."
            value={message}
            maxLength={2000}
            onChange={e => { setMessage(e.target.value); if (errors.message) setErrors(prev => ({ ...prev, message: '' })); }}
          />
          {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
          <p className="text-xs text-gray-400">{message.length}/2000 characters</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <select
            className={`w-full rounded-lg border p-2.5 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
            value={type}
            onChange={e => { setType(e.target.value); if (errors.type) setErrors(prev => ({ ...prev, type: '' })); }}
          >
            <option value="Academic">Academic</option>
            <option value="Event">Event</option>
            <option value="System">System</option>
            <option value="General">General</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button" disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving} disabled={saving}>
            {selectedAnnouncement ? "Update Broadcast" : "Broadcast"}
          </Button>
        </div>
      </form>
    </Modal>
  </Layout>;
}