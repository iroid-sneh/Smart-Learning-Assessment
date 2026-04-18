import Assignment from "../../models/assignment.js";
import Submission from "../../models/submission.js";
import Course from "../../models/course.js";
import User from "../../models/user.js";
import { NotFoundException, ForbiddenException } from "../common/utils/errorException.js";
import { isPastDueDate } from "../common/utils/dateUtils.js";

class progressServices {
    static async getStudentProgress(studentId, user) {
        if (user.role === "student" && user._id.toString() !== studentId) {
            throw new ForbiddenException("You can only view your own progress");
        }

        const student = await User.findById(studentId);
        if (!student || student.role !== "student") {
            throw new NotFoundException("Student not found");
        }

        // All courses the student is enrolled in.
        const enrolledCourses = await Course.find({ students: studentId })
            .select("_id title code");
        const enrolledCourseIds = enrolledCourses.map((c) => c._id);

        // All assignments across those courses, plus the student's submissions.
        const [assignments, submissions] = await Promise.all([
            Assignment.find({ course: { $in: enrolledCourseIds } })
                .select("_id title dueDate course")
                .lean(),
            Submission.find({ student: studentId })
                .select("assignment status marks")
                .lean(),
        ]);

        const submissionByAssignmentId = new Map(
            submissions.map((s) => [String(s.assignment), s])
        );

        // Bucket per course so we can report a per-course breakdown too.
        const perCourse = new Map();
        for (const c of enrolledCourses) {
            perCourse.set(String(c._id), {
                courseId: c._id,
                courseTitle: c.title,
                courseCode: c.code,
                totalAssignments: 0,
                activeAssignments: 0, // not yet due
                closedAssignments: 0, // past end-of-day of due date
                submittedAssignments: 0,
                evaluatedAssignments: 0,
                missedAssignments: 0, // closed + no submission → counts as 0
                // Internal accumulators for average:
                _sumMarks: 0,
                _scoredCount: 0, // evaluated + missed
            });
        }

        // Global totals.
        let totalAssignments = 0;
        let activeAssignments = 0;
        let closedAssignments = 0;
        let submittedAssignments = 0;
        let evaluatedAssignments = 0;
        let missedAssignments = 0;
        let sumMarks = 0;
        let scoredCount = 0;

        for (const a of assignments) {
            const bucket = perCourse.get(String(a.course));
            if (!bucket) continue;

            totalAssignments += 1;
            bucket.totalAssignments += 1;

            const closed = isPastDueDate(a.dueDate);
            if (closed) {
                closedAssignments += 1;
                bucket.closedAssignments += 1;
            } else {
                activeAssignments += 1;
                bucket.activeAssignments += 1;
            }

            const sub = submissionByAssignmentId.get(String(a._id));
            if (sub) {
                submittedAssignments += 1;
                bucket.submittedAssignments += 1;

                if (sub.status === "evaluated") {
                    evaluatedAssignments += 1;
                    bucket.evaluatedAssignments += 1;

                    const marks = Number(sub.marks) || 0;
                    sumMarks += marks;
                    scoredCount += 1;
                    bucket._sumMarks += marks;
                    bucket._scoredCount += 1;
                }
                // If submitted but not yet evaluated, it is excluded from the
                // average — the student is not at fault for pending grading.
            } else if (closed) {
                // Missed: due date fully passed and no submission exists.
                missedAssignments += 1;
                bucket.missedAssignments += 1;
                scoredCount += 1; // contributes as 0 to the average
                bucket._scoredCount += 1;
            }
            // else: active + not submitted → excluded from average for now.
        }

        const averageMarks = scoredCount > 0 ? sumMarks / scoredCount : 0;
        const completionPercentage =
            totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0;

        const courseBreakdown = Array.from(perCourse.values()).map((b) => {
            const avg = b._scoredCount > 0 ? b._sumMarks / b._scoredCount : 0;
            const completion =
                b.totalAssignments > 0
                    ? (b.submittedAssignments / b.totalAssignments) * 100
                    : 0;
            const { _sumMarks, _scoredCount, ...rest } = b;
            return {
                ...rest,
                averageMarks: Number(avg.toFixed(2)),
                completionPercentage: Number(completion.toFixed(2)),
            };
        });

        return {
            success: true,
            message: "Student progress retrieved successfully",
            data: {
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                },
                enrolledCoursesCount: enrolledCourses.length,
                totalAssignments,
                activeAssignments,
                closedAssignments,
                submittedAssignments,
                evaluatedAssignments,
                missedAssignments,
                averageMarks: Number(averageMarks.toFixed(2)),
                completionPercentage: Number(completionPercentage.toFixed(2)),
                courseBreakdown,
            },
        };
    }
}

export default progressServices;
