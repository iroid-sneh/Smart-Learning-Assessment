import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FileUpload } from '../../components/ui/FileUpload';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {assignments.map(item => {
          const submission = submissions.find(s => s.assignment?._id === item._id || s.assignment === item._id);
          const daysLeft = getDaysLeft(item.dueDate);
          const isOverdue = !submission && daysLeft <= 0;
          const status = submission ? 'Submitted' : isOverdue ? 'Failed' : 'Pending';
          const accentColor = status === 'Failed' ? 'text-red-600' : 'text-emerald-700';

          return (
            <Card key={item._id} className="group flex flex-col">
              <div className="mb-4">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {item.courseTitle}
                  </p>
                  <Badge variant={status === 'Submitted' ? 'success' : status === 'Failed' ? 'danger' : 'warning'}>
                    {status}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                  {status === 'Pending' && (
                    <span className={`font-medium ${daysLeft < 3 ? 'text-red-500' : 'text-orange-500'}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative h-[290px] mb-5 overflow-visible">
                <div className="absolute right-2 top-6 h-[250px] w-[72%] rounded-xl bg-red-600 shadow-md rotate-[6deg] transition-all duration-300 group-hover:rotate-[4deg] group-hover:translate-x-1">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[11px] font-bold tracking-wide text-white">
                    CLICK TO READ
                  </span>
                </div>
                <div className="absolute right-8 top-3 h-[250px] w-[82%] rounded-xl bg-gray-100 border border-gray-200 opacity-80 shadow-sm transition-all duration-300 group-hover:translate-x-1">
                  <div className="p-4 text-xs text-gray-400">Assignment Preview</div>
                </div>
                <div className="relative z-10 h-[260px] w-[86%] rounded-2xl border border-gray-200 bg-[#edf1ef] p-6 shadow-sm transition-all duration-300 group-hover:-rotate-[3deg] group-hover:-translate-x-1">
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-gray-400">Assignment</p>
                  <h4 className={`text-[38px] leading-[1.05] font-semibold mt-3 ${accentColor}`}>
                    {item.title.length > 62 ? `${item.title.slice(0, 62)}...` : item.title}
                  </h4>
                  <div className="mt-auto pt-8">
                    <p className={`text-sm font-semibold ${accentColor}`}>{item.courseTitle}</p>
                  </div>
                </div>
              </div>

              {status === 'Failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">Failed to submit the assignment on or before the due date</p>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-gray-100">
                {status === 'Pending' ? (
                  <Button className="w-full" onClick={() => handleSubmitClick(item)}>
                    Submit Assignment
                  </Button>
                ) : status === 'Failed' ? (
                  <div className="flex items-center justify-center text-red-600 font-medium py-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Submission Closed
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-green-600 font-medium py-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submitted Successfully
                  </div>
                )}
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