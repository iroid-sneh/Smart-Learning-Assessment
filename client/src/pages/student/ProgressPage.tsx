import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function ProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        const [progRes, subRes] = await Promise.all([
          api.get(`/students/${user._id}/progress`),
          api.get('/submissions/my')
        ]);
        if (progRes.data?.success) setProgress(progRes.data.data);
        if (subRes.data?.success) {
          const evaluated = subRes.data.data.filter((s: any) => s.status === 'Evaluated' || s.status === 'evaluated');
          setSubmissions(evaluated);
        }
      } catch (error) {
        console.error('Failed to fetch progress info', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Layout role="student"><div className="p-8">Loading progress...</div></Layout>;

  return (
    <Layout role="student">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Overall Avg Marks</p>
            <h3 className="text-2xl font-bold text-gray-900">{progress?.averageMarks || 0}%</h3>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Assignments Completed</p>
            <h3 className="text-2xl font-bold text-gray-900">{progress?.submittedAssignments || 0}/{progress?.totalAssignments || 0}</h3>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Platform Completion</p>
            <h3 className="text-2xl font-bold text-gray-900">{progress?.completionPercentage || 0}%</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Progress */}
        <Card title="Course Progress">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Course Completion
          </h3>
          <div className="space-y-6">
            {/* If backend tracks per subject, render here. For MVP mock subject mapping */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-900">Overall Progress Track</span>
                <span className="text-sm text-gray-500">
                  Total: {progress?.completionPercentage || 0}%
                </span>
              </div>
              <ProgressBar progress={progress?.completionPercentage || 0} showLabel={false} />
            </div>
          </div>
        </Card>

        {/* Recent Marks Table */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Recent Results
          </h3>
          <Table
            data={submissions}
            keyField="_id"
            columns={[{
              header: 'Assessment',
              accessor: item => item.assignment?.title || 'Unknown'
            }, {
              header: 'Out Of',
              accessor: item => item.assignment?.totalMarks || '--'
            }, {
              header: 'Marks Scored',
              accessor: 'marks'
            }, {
              header: 'Status',
              accessor: item => <Badge variant={'success'}>
                {item.status}
              </Badge>
            }]}
          />
        </Card>
      </div>
    </Layout>
  );
}