import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { Modal } from '../../components/ui/Modal';
import { FileText, Trash2, Download, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

  const handleCreateMaterial = async () => {
    if (!selectedFile || !title || !selectedCourse) {
      alert("Please fill all fields and select a file.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', selectedFile);

      await api.post(`/materials/course/${selectedCourse}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchMaterials();
      setIsUploadModalOpen(false);
      setTitle('');
      setSelectedFile(null);
    } catch (e: any) {
      console.error(e);
      alert('Error saving material: ' + (e.response?.data?.error || e.message));
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete material?")) return;
    try {
      await api.delete(`/materials/${id}`);
      fetchMaterials();
    } catch (e) { console.error(e); }
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
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setTitle(''); setSelectedFile(null); setIsUploadModalOpen(true); }} disabled={!selectedCourse}>
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
          <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(item._id)}>
            Delete
          </Button>
        </div>
      </Card>)}
      {!loading && materials.length === 0 && <p className="text-gray-500">No materials for this course.</p>}
    </div>

    <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Study Material">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Material Title
          </label>
          <input type="text" className="w-full rounded-lg border border-gray-300 p-2.5" placeholder="e.g. Lecture Notes Week 1" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <FileUpload
          label="Select Document"
          onFileSelect={setSelectedFile}
          accept=".pdf,.doc,.docx,.ppt,.pptx"
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleCreateMaterial} disabled={!title || !selectedFile || isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  </Layout>;
}