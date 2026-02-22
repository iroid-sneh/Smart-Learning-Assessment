import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FileUpload } from '../../components/ui/FileUpload';
import { Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function AssignmentsPage() {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, subsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/submissions/my')
        ]);

        let allAssignments: any[] = [];
        if (coursesRes.data?.success) {
          const courses = coursesRes.data.data;
          // Fetch assignments for all courses sequentially or parallel
          const assignmentPromises = courses.map((c: any) => api.get(`/assignments/course/${c._id}`));
          const assignmentResponses = await Promise.all(assignmentPromises);

          assignmentResponses.forEach((res, index) => {
            if (res.data?.success) {
              const courseAssignments = res.data.data.map((a: any) => ({
                ...a,
                courseTitle: courses[index].title
              }));
              allAssignments = [...allAssignments, ...courseAssignments];
            }
          });
        }

        if (subsRes.data?.success) {
          setSubmissions(subsRes.data.data);
        }

        setAssignments(allAssignments);
      } catch (error) {
        console.error('Error fetching assignments data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSubmitClick = (assignment: any) => {
    setSelectedAssignment(assignment);
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile || !selectedAssignment) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await api.post(`/submissions/assignment/${selectedAssignment._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      handleCloseModal();
      window.location.reload();
    } catch (e: any) {
      console.error('Error submitting assignment:', e);
      alert('Error submitting assignment: ' + (e.response?.data?.message || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysLeft = (dueDate: string) => {
    const due = new Date(dueDate).getTime();
    const now = new Date().getTime();
    const diff = due - now;
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  if (loading) return <Layout role="student"><div className="p-8">Loading assignments...</div></Layout>;

  return (
    <Layout role="student">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map(item => {
          const submission = submissions.find(s => s.assignment?._id === item._id || s.assignment === item._id);
          const status = submission ? 'Submitted' : 'Pending';
          const daysLeft = getDaysLeft(item.dueDate);

          return (
            <Card key={item._id} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    {item.courseTitle}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {item.title}
                  </h3>
                </div>
                <Badge variant={status === 'Submitted' ? 'success' : 'warning'}>
                  {status}
                </Badge>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </div>
                {status === 'Pending' && <span className={`font-medium ${daysLeft < 3 ? 'text-red-500' : 'text-orange-500'}`}>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                </span>}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                {status === 'Pending' ? <Button className="w-full" onClick={() => handleSubmitClick(item)}>
                  Submit Assignment
                </Button> : <div className="flex items-center justify-center text-green-600 font-medium py-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submitted Successfully
                </div>}
              </div>
            </Card>
          )
        })}
        {assignments.length === 0 && <p className="text-slate-500">No assignments available right now.</p>}
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={handleCloseModal} title={`Submit: ${selectedAssignment?.title}`}>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p className="font-medium">Instructions:</p>
            <p className="mt-1">{selectedAssignment?.description}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Upload your solution file</li>
              <li>Max file size: 10MB</li>
            </ul>
          </div>

          <FileUpload onFileSelect={file => setSelectedFile(file)} />

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAssignment} disabled={!selectedFile || submitting}>
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}