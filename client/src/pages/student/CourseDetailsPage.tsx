import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { FileText, Download, Clock } from 'lucide-react';
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

  return (
    <Layout role="student">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {course.title}
        </h1>
        <p className="text-gray-600">{course.code} • {course.faculty?.name || 'Unknown Faculty'}</p>
        {course.description && <p className="text-gray-500 mt-2 text-sm">{course.description}</p>}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'materials' && (
        <div className="space-y-4 pt-4">
          {materials.map(item => (
            <Card key={item._id} className="flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.type?.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <a href={item.fileUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
                  Download
                </Button>
              </a>
            </Card>
          ))}
          {materials.length === 0 && <p className="text-gray-500">No study materials posted yet.</p>}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {assignments.map(item => {
            const submission = getSubmissionForAssignment(item._id);
            const isSubmitted = !!submission;
            const status = isSubmitted ? (submission.status === 'Evaluated' || submission.status === 'evaluated' ? 'Evaluated' : 'Submitted') : 'Pending';

            return (
              <Card key={item._id} className="flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant={status === 'Pending' ? 'warning' : 'success'}>
                    {status}
                  </Badge>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                {item.description && <p className="text-sm mb-4 text-gray-700">{item.description}</p>}

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Clock className="w-4 h-4 mr-2" />
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Score: {submission?.marks !== undefined ? `${submission.marks}` : '-'}
                  </span>
                  {!isSubmitted ? (
                    <div className="flex flex-col w-full space-y-2">
                      <FileUpload
                        onFileSelect={(file) => handleFileUpload(item._id, file)}
                        accept=".pdf,.doc,.docx"
                        label="Upload Submission"
                      />
                    </div>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      Submitted
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {assignments.length === 0 && <p className="col-span-2 text-gray-500">No assignments posted up yet.</p>}
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
                    const sub = getSubmissionForAssignment(item._id);
                    const status = sub ? (sub.status === 'Evaluated' || sub.status === 'evaluated' ? 'Evaluated' : 'Submitted') : 'Pending';
                    return <Badge variant={status === 'Pending' ? 'warning' : 'success'}>{status}</Badge>;
                  }
                },
                {
                  header: 'Score', accessor: (item: any) => {
                    const sub = getSubmissionForAssignment(item._id);
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