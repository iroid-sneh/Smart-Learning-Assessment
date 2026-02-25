import { useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/ui/Card";
import { Tabs } from "../../components/ui/Tabs";
import { Table } from "../../components/ui/Table";
import { Badge } from "../../components/ui/Badge";
import { FolderCard } from "../../components/ui/FolderCard";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { FileUpload } from "../../components/ui/FileUpload";

// --- Helper Functions & Constants ---
const THEME_ORDER = ["red", "green", "blue"] as const;

const THEME_COLORS = {
    red: { bg: "#F2F5F3", accent: "#BE3433", tab: "#BE3433" },
    green: { bg: "#F0F5F1", accent: "#007749", tab: "#186A41" },
    blue: { bg: "#F2F7FF", accent: "#1F5FAF", tab: "#2A6EC6" },
};

const getFeedbackMessage = (status: string, score: number | undefined) => {
    if (status === "Pending")
        return "Hurry and submit the assignment before the due date.";
    if (status === "Failed")
        return "Missed deadline. You failed this assignment.";
    if (status === "Submitted")
        return "Assignment submitted. Waiting for evaluation.";

    const s = score || 0;
    if (s >= 90) return `Excellent! You got ${s}.`;
    if (s >= 80) return `Great! You got ${s}.`;
    if (s >= 70) return `Can do better. You got ${s}.`;
    if (s >= 60) return `Improve. You got ${s}.`;
    return `Fail. You got ${s}.`;
};

// --- Extracted Assignment Card Component ---
const AssignmentCard = ({
    item,
    submission,
    status,
    course,
    index,
    onClick,
}: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const theme = THEME_ORDER[index % THEME_ORDER.length];
    const colors = THEME_COLORS[theme];

    return (
        <div
            className="flex flex-col items-center relative transition-all duration-300 w-full max-w-[380px]"
            style={{ zIndex: isHovered ? 50 : 1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                className="relative w-full h-[500px] cursor-pointer"
                style={{
                    perspective: 1500,
                    transformStyle: "preserve-3d",
                }}
                initial="rest"
                animate={isHovered ? "hover" : "rest"}
                onClick={() =>
                    onClick({
                        item,
                        submission,
                        status,
                        course,
                        colors,
                        score: submission?.marks,
                    })
                }
            >
                {/* BACK LAYER */}
                <div
                    className="absolute inset-0 bg-[#D3DACD] rounded-xl p-8 flex items-center justify-center overflow-hidden"
                    style={{ zIndex: 0, transform: "translateZ(-30px)" }}
                >
                    <p className="text-[14px] font-semibold text-[#8C949A] text-justify leading-relaxed tracking-[-0.04em]">
                        {item.description ||
                            "Submit before due date to avoid failure. Check guidelines and upload the correct file format."}
                        <br />
                        <br />
                        {item.description}
                    </p>
                </div>

                {/* MIDDLE LAYER (Slide-out Tab) WITH LAYOUT ID FOR MORPHING */}
                <motion.div
                    layoutId={`tab-${item._id}`} // Connects this element to the modal
                    className="absolute w-[90%] h-[420px] rounded-xl"
                    style={{
                        backgroundColor: colors.tab,
                        left: "20px",
                        top: "40px",
                        transformOrigin: "left bottom",
                        zIndex: 10,
                        z: 0,
                    }}
                    variants={{
                        rest: { x: 0, y: 0, rotateZ: 0 },
                        hover: { x: 40, y: 15, rotateZ: 4 },
                    }}
                    transition={{
                        type: "spring",
                        damping: 30,
                        mass: 1,
                        stiffness: 400,
                    }}
                >
                    <div className="absolute -right-9 top-[35%] -rotate-90 origin-center">
                        <span className="text-white text-[16px] font-semibold tracking-wide">
                            CLICK TO OPEN
                        </span>
                    </div>
                </motion.div>

                {/* FRONT LAYER (Main Cover) */}
                <motion.div
                    className="absolute inset-0 rounded-xl p-[32px] flex flex-col overflow-hidden shadow-xl"
                    style={{
                        backgroundColor: colors.bg,
                        transformOrigin: "left bottom",
                        zIndex: 20,
                        z: 40,
                    }}
                    variants={{
                        rest: { rotateY: 0 },
                        hover: { rotateY: -35 },
                    }}
                    transition={{
                        type: "spring",
                        damping: 30,
                        mass: 1,
                        stiffness: 400,
                    }}
                >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-8 z-10 relative">
                        <div className="flex items-center gap-2">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 12 12"
                                fill="none"
                            >
                                <path
                                    d="M7.885 0.006C7.538 0.033 7.2 0.437 7.2 0.615V4.265C7.2 4.88 7.469 4.88 7.8 4.88H11.358C11.697 4.802 11.976 4.354 11.951 4.177C11.647 2.016 9.992 0.319 7.885 0.006Z"
                                    fill="#9BA1A5"
                                />
                                <path
                                    d="M5.4 0.923C2.418 0.923 0 3.403 0 6.462C0 9.52 2.418 12 5.4 12C8.382 12 10.8 9.52 10.8 6.462C10.8 5.846 10.531 5.846 10.2 5.846H6V1.538C6 0.923 5.731 0.923 5.4 0.923Z"
                                    fill="#9BA1A5"
                                />
                            </svg>
                            <span className="text-[#9BA1A5] text-[12px] font-bold tracking-tight">
                                ASSIGNMENT
                            </span>
                        </div>
                        <span className="text-[12px] font-bold rounded-full px-3 py-1 bg-white/80 shadow-sm text-[#7a8185]">
                            {status}
                        </span>
                    </div>

                    {/* Big Title & Paragraph */}
                    <div className="flex-1 z-10 relative pr-[80px]">
                        <h2
                            className="text-[32px] font-bold leading-[1.1] tracking-[-0.04em] mb-4"
                            style={{ color: colors.accent }}
                        >
                            {item.title}
                        </h2>
                        <p className="text-[15px] font-semibold leading-[1.4] text-[#1E2021]/80 line-clamp-4">
                            {item.description}
                        </p>
                    </div>

                    {/* Floating Background Assets */}
                    {theme === "red" && (
                        <div className="absolute inset-0 pointer-events-none z-0">
                            <img
                                src="https://framerusercontent.com/images/2PmD2a8aZpqpwXR4oh6GLdBuGF4.jpg"
                                alt="Asset 1"
                                className="absolute right-[40px] top-[120px] w-[90px] h-[70px] object-cover rounded shadow-md border border-white/50"
                            />
                            <img
                                src="https://framerusercontent.com/images/XRtn6dfktsxy35NgqRIPhTASUw.jpg"
                                alt="Asset 2"
                                className="absolute right-[20px] top-[210px] w-[45px] h-[75px] object-cover rounded shadow-md border border-white/50"
                            />
                            <img
                                src="https://framerusercontent.com/images/La72ICnSDhn2r9An5ZNP6L1g.jpg"
                                alt="Asset 3"
                                className="absolute right-[50px] bottom-[150px] w-[40px] h-[50px] object-cover rounded shadow-md border border-white/50"
                            />
                        </div>
                    )}
                    {theme === "green" && (
                        <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="absolute bottom-[130px] right-[25px] flex items-end gap-2">
                                <div className="w-[30px] h-[45px] bg-[#C2DFD3] rounded-sm" />
                                <div className="w-[30px] h-[70px] bg-[#C2DFD3] rounded-sm" />
                                <div className="w-[30px] h-[100px] bg-[#C2DFD3] rounded-sm" />
                                <div className="w-[30px] h-[150px] bg-[#C2DFD3] rounded-sm" />
                            </div>
                            <svg
                                className="absolute -left-6 top-[130px] w-[50px] h-[50px] rotate-[15deg] opacity-90"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M12 2C12 2 3 7 3 14C3 18 6 21 12 22C18 21 21 18 21 14C21 7 12 2 12 2Z"
                                    fill="#58A546"
                                />
                                <path
                                    d="M12 22V2"
                                    stroke="#3D7E2E"
                                    strokeWidth="1.5"
                                />
                            </svg>
                            <svg
                                className="absolute right-[120px] top-[190px] w-[35px] h-[35px] -rotate-[30deg] opacity-90"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M12 2C12 2 3 7 3 14C3 18 6 21 12 22C18 21 21 18 21 14C21 7 12 2 12 2Z"
                                    fill="#58A546"
                                />
                                <path
                                    d="M12 22V2"
                                    stroke="#3D7E2E"
                                    strokeWidth="1.5"
                                />
                            </svg>
                        </div>
                    )}
                    {theme === "blue" && (
                        <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(circle_at_100%_100%,_#2A6EC6_0%,_transparent_60%)]" />
                    )}

                    {/* Footer Row */}
                    <div className="mt-auto z-10 relative flex justify-between items-end">
                        <div>
                            <p
                                className="text-[13px] font-bold tracking-wider mb-1"
                                style={{ color: colors.accent }}
                            >
                                {course.code}
                            </p>
                            <p className="text-[13px] text-[#7a8185] font-semibold">
                                Due:{" "}
                                {new Date(item.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[12px] text-[#7a8185] font-semibold uppercase tracking-wider mb-0.5">
                                Score
                            </p>
                            <p
                                className="text-2xl font-bold leading-none"
                                style={{ color: colors.accent }}
                            >
                                {submission?.marks !== undefined
                                    ? submission.marks
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

// --- Main Page Component ---
export function CourseDetailsPage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("assignments");
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

    const [course, setCourse] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);

    const tabs = [
        { id: "materials", label: "Study Materials" },
        { id: "assignments", label: "Assignments" },
        { id: "marks", label: "Marks & Progress" },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [courseRes, matRes, assignRes, subRes] = await Promise.all([
                api.get(`/courses/${id}`),
                api.get(`/materials/course/${id}`),
                api.get(`/assignments/course/${id}`),
                api.get("/submissions/my"),
            ]);

            if (courseRes.data?.success) setCourse(courseRes.data.data);
            if (matRes.data?.success) setMaterials(matRes.data.data);
            if (assignRes.data?.success) setAssignments(assignRes.data.data);
            if (subRes.data?.success) setSubmissions(subRes.data.data);
        } catch (e) {
            console.error("Failed to fetch course details", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const getSubmissionForAssignment = (assignmentId: string) => {
        return submissions.find(
            (sub) => (sub.assignment?._id || sub.assignment) === assignmentId
        );
    };

    const handleFileUpload = async (assignmentId: string, file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            await api.post(
                `/submissions/assignment/${assignmentId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            alert("Assignment submitted successfully!");
            fetchData();
        } catch (e: any) {
            console.error(e);
            alert(
                "Error submitting assignment: " +
                    (e.response?.data?.message || e.message)
            );
        }
    };

    if (loading)
        return (
            <Layout role="student">
                <div className="p-8">Loading course details...</div>
            </Layout>
        );
    if (!course)
        return (
            <Layout role="student">
                <div className="p-8 text-red-500">Course not found.</div>
            </Layout>
        );

    const getAssignmentStatus = (item: any) => {
        const submission = getSubmissionForAssignment(item._id);
        if (submission)
            return submission.status === "evaluated" ||
                submission.status === "Evaluated"
                ? "Evaluated"
                : "Submitted";
        if (new Date() > new Date(item.dueDate)) return "Failed";
        return "Pending";
    };

    return (
        <Layout role="student" pageTitle={course.title}>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {course.title}
                </h1>
                <p className="text-gray-600">
                    {course.code} • {course.faculty?.name || "Unknown Faculty"}
                </p>
                {course.description && (
                    <p className="text-gray-500 mt-2 text-sm">
                        {course.description}
                    </p>
                )}
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "materials" && (
                <div className="pt-8">
                    <div className="grid grid-cols-5 gap-y-10 justify-items-center">
                        {materials.map((item) => (
                            <FolderCard
                                key={item._id}
                                title={item.title}
                                subtitle={`${item.type?.toUpperCase() || "FILE"} • ${new Date(item.createdAt).toLocaleDateString()}`}
                                fileUrl={item.fileUrl}
                            />
                        ))}
                    </div>
                    {materials.length === 0 && (
                        <p className="text-gray-500">
                            No study materials posted yet.
                        </p>
                    )}
                </div>
            )}

            {activeTab === "assignments" && (
                // RESTORED 3-COLUMN GRID
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 pt-10 justify-items-center">
                    {assignments.map((item, index) => {
                        const submission = getSubmissionForAssignment(item._id);
                        const status = getAssignmentStatus(item);

                        return (
                            <AssignmentCard
                                key={item._id}
                                item={item}
                                submission={submission}
                                status={status}
                                course={course}
                                index={index}
                                onClick={(data: any) =>
                                    setSelectedAssignment(data)
                                }
                            />
                        );
                    })}

                    {assignments.length === 0 && (
                        <p className="col-span-full text-gray-500">
                            No assignments posted yet.
                        </p>
                    )}
                </div>
            )}

            {activeTab === "marks" && (
                <div className="pt-4">
                    <Card noPadding>
                        <Table
                            data={assignments}
                            keyField="_id"
                            columns={[
                                {
                                    header: "Assignment Title",
                                    accessor: "title",
                                },
                                {
                                    header: "Due Date",
                                    accessor: (item: any) =>
                                        new Date(
                                            item.dueDate
                                        ).toLocaleDateString(),
                                },
                                {
                                    header: "Status",
                                    accessor: (item: any) => {
                                        const status =
                                            getAssignmentStatus(item);
                                        return (
                                            <Badge
                                                variant={
                                                    status === "Failed"
                                                        ? "danger"
                                                        : status === "Pending"
                                                          ? "warning"
                                                          : "success"
                                                }
                                            >
                                                {status}
                                            </Badge>
                                        );
                                    },
                                },
                                {
                                    header: "Score",
                                    accessor: (item: any) => {
                                        const sub = getSubmissionForAssignment(
                                            item._id
                                        );
                                        const status =
                                            getAssignmentStatus(item);
                                        if (status === "Failed")
                                            return (
                                                <span className="text-red-500 text-sm">
                                                    Failed
                                                </span>
                                            );
                                        return sub?.marks !== undefined
                                            ? sub.marks
                                            : "-";
                                    },
                                },
                            ]}
                        />
                    </Card>
                </div>
            )}

            {/* EXPANDED ASSIGNMENT MODAL */}
            <AnimatePresence>
                {selectedAssignment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setSelectedAssignment(null)}
                        />

                        <motion.div
                            layoutId={`tab-${selectedAssignment.item._id}`}
                            className="relative z-10 w-full max-w-2xl rounded-3xl shadow-2xl p-10 flex flex-col text-white overflow-y-auto max-h-[90vh]"
                            style={{
                                backgroundColor: selectedAssignment.colors.tab,
                            }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col h-full"
                            >
                                <button
                                    onClick={() => setSelectedAssignment(null)}
                                    className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                                >
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line
                                            x1="18"
                                            y1="6"
                                            x2="6"
                                            y2="18"
                                        ></line>
                                        <line
                                            x1="6"
                                            y1="6"
                                            x2="18"
                                            y2="18"
                                        ></line>
                                    </svg>
                                </button>

                                <h2 className="text-4xl font-extrabold tracking-tight mb-2 pr-12">
                                    {selectedAssignment.item.title}
                                </h2>
                                <p className="text-white/80 font-medium text-lg mb-8">
                                    {selectedAssignment.course.title} •{" "}
                                    {selectedAssignment.course.code}
                                </p>

                                <p className="text-white/90 text-lg leading-relaxed mb-10 border-b border-white/20 pb-10">
                                    {selectedAssignment.item.description}
                                </p>

                                <div className="bg-white/10 rounded-2xl p-8 mb-8 backdrop-blur-md border border-white/20 shadow-inner">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">
                                            Feedback Result
                                        </h3>
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold tracking-wide">
                                            Status: {selectedAssignment.status}
                                        </span>
                                    </div>
                                    <p className="text-3xl font-semibold leading-tight text-white shadow-sm">
                                        {getFeedbackMessage(
                                            selectedAssignment.status,
                                            selectedAssignment.score
                                        )}
                                    </p>
                                </div>

                                {selectedAssignment.status === "Pending" && (
                                    <div className="bg-white rounded-2xl p-8 shadow-xl mt-auto">
                                        <h3 className="text-gray-900 font-bold text-xl mb-4">
                                            Ready to submit?
                                        </h3>
                                        <FileUpload
                                            onFileSelect={(file) => {
                                                handleFileUpload(
                                                    selectedAssignment.item._id,
                                                    file
                                                );
                                                setSelectedAssignment(null);
                                            }}
                                            accept=".pdf,.doc,.docx"
                                            label="Upload Submission"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </Layout>
    );
}
