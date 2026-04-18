import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { Modal } from '../../components/ui/Modal';
import { FileText, Trash2, Download, Plus, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  validateRequired,
  validateLength,
  validateFile,
  extractApiError,
  hasErrors,
  FieldErrors,
} from '../../utils/validation';

type MaterialFormField = 'title' | 'file' | 'course' | 'form';
const MATERIAL_ACCEPT = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];

export function StudyMaterialsPage() {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<MaterialFormField>>({});

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data?.success) {
        const myCourses = res.data.data.filter((c: any) => c.faculty?._id === user?._id || c.faculty === user?._id);
        setCourses(myCourses);
        if (myCourses.length > 0 && !selectedCourse) {
          setSelectedCourse(myCourses[0]._id);
        }
      }
    } catch (e) { console.error(e); }
  };

  const fetchMaterials = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const res = await api.get(`/materials/course/${selectedCourse}`);
      if (res.data?.success) {
        setMaterials(res.data.data);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse]);

  const validateMaterialForm = (): FieldErrors<MaterialFormField> => {
    const next: FieldErrors<MaterialFormField> = {};
    next.course = validateRequired(selectedCourse, 'Course');
    next.title =
      validateRequired(title, 'Title') ||
      validateLength(title, 'Title', 3, 200);
    next.file = validateFile(selectedFile, { maxSizeMB: 25, allowedExtensions: MATERIAL_ACCEPT });
    return next;
  };

  const handleCreateMaterial = async () => {
    const nextErrors = validateMaterialForm();
    setErrors(nextErrors);
    if (hasErrors(nextErrors as Record<string, string>)) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('file', selectedFile as File);

      await api.post(`/materials/course/${selectedCourse}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchMaterials();
      setIsUploadModalOpen(false);
      setTitle('');
      setSelectedFile(null);
      setErrors({});
    } catch (e: any) {
      console.error(e);
      setErrors({ form: extractApiError(e, 'Failed to upload material. Please try again.') });
    }
    setIsUploading(false);
  };

  const openDeleteMaterial = (mat: any) => {
    setMaterialToDelete(mat);
    setDeleteModalOpen(true);
  };

  const confirmDeleteMaterial = async () => {
    if (!materialToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/materials/${materialToDelete._id}`);
      setDeleteModalOpen(false);
      setMaterialToDelete(null);
      fetchMaterials();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return <Layout role="faculty">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
        <p className="text-gray-600">Upload and manage course resources</p>
      </div>
      <div className="flex items-center space-x-3">
        <select className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
          ))}
        </select>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setTitle(''); setSelectedFile(null); setErrors({}); setIsUploadModalOpen(true); }} disabled={!selectedCourse}>
          Upload Material
        </Button>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {loading ? <p>Loading materials...</p> : materials.map(item => <Card key={item._id} className="flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <a href={item.fileUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
              Download
            </Button>
          </a>
          <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={() => openDeleteMaterial(item)}>
            Delete
          </Button>
        </div>
      </Card>)}
      {!loading && materials.length === 0 && <p className="text-gray-500">No materials for this course.</p>}
    </div>

    <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Study Material">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateMaterial(); }} noValidate>
        {errors.form && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errors.form}
          </div>
        )}
        {errors.course && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errors.course}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Material Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full rounded-lg border p-2.5 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
            placeholder="e.g. Lecture Notes Week 1"
            value={title}
            maxLength={200}
            onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => ({ ...prev, title: '' })); }}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <FileUpload
            label="Select Document"
            onFileSelect={(file) => { setSelectedFile(file); if (errors.file) setErrors(prev => ({ ...prev, file: '' })); }}
            accept={MATERIAL_ACCEPT.join(',')}
          />
          {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Accepted: {MATERIAL_ACCEPT.join(', ')} &bull; Max size: 25 MB
          </p>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={isUploading} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </form>
    </Modal>

    {/* Delete Material Confirmation Modal */}
    <Modal
      isOpen={deleteModalOpen}
      onClose={() => { setDeleteModalOpen(false); setMaterialToDelete(null); }}
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
              onClick={() => { setDeleteModalOpen(false); setMaterialToDelete(null); }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={confirmDeleteMaterial}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete Material
            </Button>
          </div>
        </div>
      )}
    </Modal>
  </Layout>;
}