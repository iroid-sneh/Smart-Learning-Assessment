import { useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { FileUpload } from "../../components/ui/FileUpload";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const THEME_ORDER = ["red", "green", "blue"] as const;

const THEME_COLORS = {
  red: { bg: "#F2F5F3", accent: "#BE3433", tab: "#BE3433" },
  green: { bg: "#F0F5F1", accent: "#007749", tab: "#186A41" },
  blue: { bg: "#F2F7FF", accent: "#1F5FAF", tab: "#2A6EC6" },
};

const getFeedbackMessage = (status: string, score: number | undefined) => {
  if (status === "Pending") return "Hurry and submit the assignment before the due date.";
  if (status === "Failed") return "Missed deadline. You failed this assignment.";
  if (status === "Submitted") return "Assignment submitted. Waiting for evaluation.";

  const s = score || 0;
  if (s >= 90) return `Excellent! You got ${s}.`;
  if (s >= 80) return `Great! You got ${s}.`;
  if (s >= 70) return `Can do better. You got ${s}.`;
  if (s >= 60) return `Improve. You got ${s}.`;
  return `Fail. You got ${s}.`;
};

const AssignmentCard = ({
  item,
  submission,
  status,
  course,
  index,
  onClick
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
        style={{ perspective: 1500, transformStyle: "preserve-3d" }}
        initial="rest"
        animate={isHovered ? "hover" : "rest"}
        onClick={() =>
          onClick({
            item,
            submission,
            status,
            course,
            colors,
            score: submission?.marks
          })
        }
      >
        <div
          className="absolute inset-0 bg-[#D3DACD] rounded-xl p-8 flex items-center justify-center overflow-hidden"
          style={{ zIndex: 0, transform: "translateZ(-30px)" }}
        >
          <p className="text-[14px] font-semibold text-[#8C949A] text-justify leading-relaxed tracking-[-0.04em]">
            {item.description || "Submit before due date to avoid failure. Check guidelines and upload the correct file format."}
            <br />
            <br />
            {item.description}
          </p>
        </div>

        <motion.div
          layoutId={`tab-${item._id}`}
          className="absolute w-[90%] h-[420px] rounded-xl"
          style={{
            backgroundColor: colors.tab,
            left: "20px",
            top: "40px",
            transformOrigin: "left bottom",
            zIndex: 10,
            z: 0
          }}
          variants={{
            rest: { x: 0, y: 0, rotateZ: 0 },
            hover: { x: 40, y: 15, rotateZ: 4 }
          }}
          transition={{ type: "spring", damping: 30, mass: 1, stiffness: 400 }}
        >
          <div className="absolute -right-9 top-[35%] -rotate-90 origin-center">
            <span className="text-white text-[16px] font-semibold tracking-wide">CLICK TO OPEN</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-xl p-[32px] flex flex-col overflow-hidden shadow-xl"
          style={{
            backgroundColor: colors.bg,
            transformOrigin: "left bottom",
            zIndex: 20,
            z: 40
          }}
          variants={{
            rest: { rotateY: 0 },
            hover: { rotateY: -35 }
          }}
          transition={{ type: "spring", damping: 30, mass: 1, stiffness: 400 }}
        >
          <div className="flex items-center justify-between mb-8 z-10 relative">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M7.885 0.006C7.538 0.033 7.2 0.437 7.2 0.615V4.265C7.2 4.88 7.469 4.88 7.8 4.88H11.358C11.697 4.802 11.976 4.354 11.951 4.177C11.647 2.016 9.992 0.319 7.885 0.006Z" fill="#9BA1A5" />
                <path d="M5.4 0.923C2.418 0.923 0 3.403 0 6.462C0 9.52 2.418 12 5.4 12C8.382 12 10.8 9.52 10.8 6.462C10.8 5.846 10.531 5.846 10.2 5.846H6V1.538C6 0.923 5.731 0.923 5.4 0.923Z" fill="#9BA1A5" />
              </svg>
              <span className="text-[#9BA1A5] text-[12px] font-bold tracking-tight">ASSIGNMENT</span>
            </div>
            <span className="text-[12px] font-bold rounded-full px-3 py-1 bg-white/80 shadow-sm text-[#7a8185]">
              {status}
            </span>
          </div>

          <div className="flex-1 z-10 relative pr-[80px]">
            <h2 className="text-[32px] font-bold leading-[1.1] tracking-[-0.04em] mb-4" style={{ color: colors.accent }}>
              {item.title}
            </h2>
            <p className="text-[15px] font-semibold leading-[1.4] text-[#1E2021]/80 line-clamp-4">
              {item.description}
            </p>
          </div>

          {theme === "blue" && (
            <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[radial-gradient(circle_at_100%_100%,_#2A6EC6_0%,_transparent_60%)]" />
          )}

          <div className="mt-auto z-10 relative flex justify-between items-end">
            <div>
              <p className="text-[13px] font-bold tracking-wider mb-1" style={{ color: colors.accent }}>
                {course.code}
              </p>
              <p className="text-[13px] text-[#7a8185] font-semibold">
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#7a8185] font-semibold uppercase tracking-wider mb-0.5">Score</p>
              <p className="text-2xl font-bold leading-none" style={{ color: colors.accent }}>
                {submission?.marks !== undefined ? submission.marks : "-"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export function AssignmentsPage() {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
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
                courseTitle: courses[index].title,
                courseCode: courses[index].code
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

  const handleFileUpload = async (assignmentId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/submissions/assignment/${assignmentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedAssignment(null);
      window.location.reload();
    } catch (e: any) {
      console.error("Error submitting assignment:", e);
      alert(
        "Error submitting assignment: " + (e.response?.data?.message || e.message)
      );
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 pt-10 justify-items-center">
        {assignments.map((item, index) => {
          const submission = submissions.find(s => s.assignment?._id === item._id || s.assignment === item._id);
          const status = submission
            ? (submission.status === "evaluated" || submission.status === "Evaluated" ? "Evaluated" : "Submitted")
            : (getDaysLeft(item.dueDate) <= 0 ? "Failed" : "Pending");
          const courseMeta = { title: item.courseTitle, code: item.courseCode || "COURSE" };

          return (
            <AssignmentCard
              key={item._id}
              item={item}
              submission={submission}
              status={status}
              course={courseMeta}
              index={index}
              onClick={(data: any) => setSelectedAssignment(data)}
            />
          )
        })}
        {assignments.length === 0 && <p className="col-span-full text-slate-500">No assignments available right now.</p>}
      </div>

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
              style={{ backgroundColor: selectedAssignment.colors.tab }}
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
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <h2 className="text-4xl font-extrabold tracking-tight mb-2 pr-12">
                  {selectedAssignment.item.title}
                </h2>
                <p className="text-white/80 font-medium text-lg mb-8">
                  {selectedAssignment.course.title} • {selectedAssignment.course.code}
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
                    {getFeedbackMessage(selectedAssignment.status, selectedAssignment.score)}
                  </p>
                </div>

                {selectedAssignment.status === "Pending" && (
                  <div className="bg-white rounded-2xl p-8 shadow-xl mt-auto">
                    <h3 className="text-gray-900 font-bold text-xl mb-4">Ready to submit?</h3>
                    <FileUpload
                      onFileSelect={(file) => handleFileUpload(selectedAssignment.item._id, file)}
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