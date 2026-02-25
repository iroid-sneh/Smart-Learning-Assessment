import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { FolderCard } from '../../components/ui/FolderCard';
import { FileText, Download, Clock, AlertTriangle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { FileUpload } from '../../components/ui/FileUpload';

export function CourseDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('materials');
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const tabs = [
    { id: 'materials', label: 'Study Materials' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'marks', label: 'Marks & Progress' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, matRes, assignRes, subRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/materials/course/${id}`),
        api.get(`/assignments/course/${id}`),
        api.get('/submissions/my')
      ]);

      if (courseRes.data?.success) setCourse(courseRes.data.data);
      if (matRes.data?.success) setMaterials(matRes.data.data);
      if (assignRes.data?.success) setAssignments(assignRes.data.data);
      if (subRes.data?.success) setSubmissions(subRes.data.data);
    } catch (e) {
      console.error('Failed to fetch course details', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(sub => (sub.assignment?._id || sub.assignment) === assignmentId);
  };

  const handleFileUpload = async (assignmentId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/submissions/assignment/${assignmentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Assignment submitted successfully!");
      fetchData(); // Refresh submissions
    } catch (e: any) {
      console.error(e);
      alert("Error submitting assignment: " + (e.response?.data?.message || e.message));
    }
  };

  if (loading) {
    return (
      <Layout role="student">
        <div className="p-8">Loading course details...</div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout role="student">
        <div className="p-8 text-red-500">Course not found.</div>
      </Layout>
    );
  }

  const getAssignmentStatus = (item: any) => {
    const submission = getSubmissionForAssignment(item._id);
    if (submission) {
      return submission.status === 'evaluated' || submission.status === 'Evaluated' ? 'Evaluated' : 'Submitted';
    }
    const now = new Date();
    const due = new Date(item.dueDate);
    if (now > due) return 'Failed';
    return 'Pending';
  };

  const getStatusVariant = (status: string) => {
    if (status === 'Failed') return 'danger';
    if (status === 'Pending') return 'warning';
    return 'success';
  };

  return (
    <Layout role="student" pageTitle={course.title}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {course.title}
        </h1>
        <p className="text-gray-600">{course.code} • {course.faculty?.name || 'Unknown Faculty'}</p>
        {course.description && <p className="text-gray-500 mt-2 text-sm">{course.description}</p>}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'materials' && (
        <div className="pt-8">
          <div className="grid grid-cols-5 gap-y-10 justify-items-center">
            {materials.map(item => (
              <FolderCard
                key={item._id}
                title={item.title}
                subtitle={`${item.type?.toUpperCase() || 'FILE'} • ${new Date(item.createdAt).toLocaleDateString()}`}
                fileUrl={item.fileUrl}
              />
            ))}
          </div>
          {materials.length === 0 && <p className="text-gray-500">No study materials posted yet.</p>}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {assignments.map(item => {
            const submission = getSubmissionForAssignment(item._id);
            const status = getAssignmentStatus(item);

            return (
              <Card key={item._id} className="flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${status === 'Failed' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {status === 'Failed' ? <AlertTriangle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <Badge variant={getStatusVariant(status)}>
                    {status}
                  </Badge>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                {item.description && <p className="text-sm mb-4 text-gray-700">{item.description}</p>}

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </div>

                {status === 'Failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-700 font-medium">Failed to submit the assignment on or before the due date</p>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Score: {submission?.marks !== undefined ? `${submission.marks}` : '-'}
                  </span>
                  {status === 'Pending' ? (
                    <div className="flex flex-col w-full space-y-2">
                      <FileUpload
                        onFileSelect={(file) => handleFileUpload(item._id, file)}
                        accept=".pdf,.doc,.docx"
                        label="Upload Submission"
                      />
                    </div>
                  ) : status === 'Failed' ? (
                    <span className="text-sm font-medium text-red-500">Overdue</span>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      {status}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {assignments.length === 0 && <p className="col-span-2 text-gray-500">No assignments posted yet.</p>}
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="pt-4">
          <Card noPadding>
            <Table
              data={assignments}
              keyField="_id"
              columns={[
                { header: 'Assignment Title', accessor: 'title' },
                { header: 'Due Date', accessor: (item: any) => new Date(item.dueDate).toLocaleDateString() },
                {
                  header: 'Status', accessor: (item: any) => {
                    const status = getAssignmentStatus(item);
                    return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
                  }
                },
                {
                  header: 'Score', accessor: (item: any) => {
                    const sub = getSubmissionForAssignment(item._id);
                    const status = getAssignmentStatus(item);
                    if (status === 'Failed') return <span className="text-red-500 text-sm">Failed</span>;
                    return sub?.marks !== undefined ? sub.marks : '-';
                  }
                }
              ]}
            />
          </Card>
        </div>
      )}
    </Layout>
  );
}