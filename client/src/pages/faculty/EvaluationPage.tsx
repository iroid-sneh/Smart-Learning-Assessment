import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { CheckCircle, Download } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export function EvaluationPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/assignments')
      ]);
      let myCourses: any[] = [];
      if (coursesRes.data?.success) {
        myCourses = coursesRes.data.data.filter((c: any) => c.faculty?._id === user?._id || c.faculty === user?._id);
        setCourses(myCourses);
      }
      if (assignmentsRes.data?.success) {
        const myCourseIds = myCourses.map((c: any) => c._id);
        const myAssignments = assignmentsRes.data.data.filter((a: any) => myCourseIds.includes(a.course?._id || a.course));
        setAssignments(myAssignments);
        if (myAssignments.length > 0) {
          setSelectedAssignment(myAssignments[0]._id);
        }
      }
    } catch (e) { console.error(e); }
    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!selectedAssignment) {
      setSubmissions([]);
      return;
    }
    setLoadingSubs(true);
    try {
      const res = await api.get(`/submissions/assignment/${selectedAssignment}`);
      if (res.data?.success) {
        setSubmissions(res.data.data);
      }
    } catch (e) {
      console.error(e);
      setSubmissions([]);
    }
    setLoadingSubs(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedAssignment]);

  const handleEvaluate = async (submissionId: string, marks: string, feedback: string) => {
    if (!marks) {
      alert('Please enter marks before saving.');
      return;
    }
    try {
      await api.put(`/submissions/${submissionId}/evaluate`, { marks: Number(marks), feedback });
      alert('Evaluation saved!');
      fetchSubmissions();
    } catch (e: any) {
      console.error(e);
      alert('Failed to evaluate: ' + (e.response?.data?.message || 'Please verify marks are between 0-100.'));
    }
  };

  if (loadingData) return <Layout role="faculty"><div className="p-8">Loading evaluation data...</div></Layout>;

  return <Layout role="faculty">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Evaluation</h1>
        <p className="text-gray-600">Grade student submissions</p>
      </div>
      {assignments.length > 0 && (
        <select className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-full md:w-64"
          value={selectedAssignment} onChange={e => setSelectedAssignment(e.target.value)}>
          {assignments.map(a => {
            const courseTitle = courses.find((c: any) => c._id === (a.course?._id || a.course))?.title || 'Unknown';
            return <option key={a._id} value={a._id}>{a.title} ({courseTitle})</option>
          })}
        </select>
      )}
    </div>

    {assignments.length === 0 ? (
      <Card><p className="text-gray-500">No assignments created yet.</p></Card>
    ) : (
      <Card noPadding>
        {loadingSubs ? <div className="p-8">Loading submissions...</div> : submissions.length === 0 ? (
          <p className="p-8 text-gray-500">No submissions for this assignment.</p>
        ) : (
          <Table data={submissions} keyField="_id" columns={[{
            header: 'Student',
            accessor: (item: any) => <div>
              <p className="font-medium text-gray-900">{item.student?.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">{item.student?.email}</p>
            </div>
          }, {
            header: 'Submitted',
            accessor: (item: any) => new Date(item.submittedAt || item.createdAt).toLocaleDateString()
          }, {
            header: 'Status',
            accessor: (item: any) => <Badge variant={item.status === 'evaluated' ? 'success' : 'warning'}>
              {item.status === 'evaluated' ? 'Evaluated' : 'Submitted'}
            </Badge>
          }, {
            header: 'File',
            accessor: (item: any) => item.fileUrl ? (
              <a href={item.fileUrl} target="_blank" rel="noreferrer" download
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium">
                <Download className="w-4 h-4" />
                Download
              </a>
            ) : <span className="text-gray-400 text-sm">No file</span>
          }, {
            header: 'Marks',
            accessor: (item: any) => <div className="w-24">
              <Input type="number" placeholder="0-100" min={0} max={100}
                defaultValue={item.marks != null ? item.marks.toString() : ""}
                className="h-8 text-sm" id={`score-${item._id}`} />
            </div>
          }, {
            header: 'Feedback',
            accessor: (item: any) => <div className="w-40">
              <Input type="text" placeholder="Feedback..."
                defaultValue={item.feedback || ""}
                className="h-8 text-sm" id={`feedback-${item._id}`} />
            </div>
          }]} actions={(item: any) => <div className="flex justify-end">
            <Button size="sm" icon={<CheckCircle className="w-4 h-4" />} onClick={() => {
              const scoreEl = document.getElementById(`score-${item._id}`) as HTMLInputElement;
              const feedbackEl = document.getElementById(`feedback-${item._id}`) as HTMLInputElement;
              handleEvaluate(item._id, scoreEl?.value || '', feedbackEl?.value || '');
            }}>
              Save
            </Button>
          </div>} />
        )}
      </Card>
    )}
  </Layout>;
}