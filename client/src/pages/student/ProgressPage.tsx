import React, { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { Trophy, TrendingUp, AlertCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

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
                    api.get("/submissions/my"),
                ]);
                if (progRes.data?.success) setProgress(progRes.data.data);
                if (subRes.data?.success) {
                    const evaluated = subRes.data.data.filter(
                        (s: any) =>
                            s.status === "Evaluated" || s.status === "evaluated"
                    );
                    setSubmissions(evaluated);
                }
            } catch (error) {
                console.error("Failed to fetch progress info", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading)
        return (
            <Layout role="student">
                <div className="p-8">Loading progress...</div>
            </Layout>
        );

    const courseBreakdown: any[] = progress?.courseBreakdown || [];
    const missedCount = progress?.missedAssignments || 0;

    return (
        <Layout role="student">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Overall Avg Marks
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {progress?.averageMarks || 0}%
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Across all enrolled courses
                        </p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Assignments Submitted
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {progress?.submittedAssignments || 0}/
                            {progress?.totalAssignments || 0}
                        </h3>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full">
                        <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Missed</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {missedCount}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Counted as 0 in average
                        </p>
                    </div>
                </Card>
                <Card className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">
                            Submission Rate
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {progress?.completionPercentage || 0}%
                        </h3>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Per-course breakdown */}
                <Card>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">
                        Course Progress
                    </h3>
                    <div className="space-y-6">
                        {courseBreakdown.length === 0 && (
                            <p className="text-sm text-gray-500">
                                You are not enrolled in any courses yet.
                            </p>
                        )}
                        {courseBreakdown.map((c: any) => (
                            <div key={c.courseId}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {c.courseTitle}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {c.courseCode} &bull;{" "}
                                            {c.submittedAssignments}/
                                            {c.totalAssignments} submitted
                                            {c.missedAssignments > 0 && (
                                                <>
                                                    {" "}
                                                    &bull;{" "}
                                                    <span className="text-red-500">
                                                        {c.missedAssignments}{" "}
                                                        missed
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {c.averageMarks}%
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            avg
                                        </p>
                                    </div>
                                </div>
                                <ProgressBar
                                    progress={c.completionPercentage || 0}
                                    showLabel={false}
                                />
                            </div>
                        ))}
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
                        columns={[
                            {
                                header: "Assessment",
                                accessor: (item) =>
                                    item.assignment?.title || "Unknown",
                            },
                            {
                                header: "Out Of",
                                accessor: (item) =>
                                    item.assignment?.totalMarks || "100",
                            },
                            {
                                header: "Marks Scored",
                                accessor: "marks",
                            },
                            {
                                header: "Status",
                                accessor: (item) => (
                                    <Badge variant={"success"}>
                                        {item.status}
                                    </Badge>
                                ),
                            },
                        ]}
                    />
                </Card>
            </div>
        </Layout>
    );
}
