import Assignment from "../../models/assignment.js";
import Submission from "../../models/submission.js";
import Course from "../../models/course.js";
import User from "../../models/user.js";
import { NotFoundException, ForbiddenException } from "../common/utils/errorException.js";

class progressServices {
    static async getStudentProgress(studentId, user) {
        if (user.role === "student" && user._id.toString() !== studentId) {
            throw new ForbiddenException("You can only view your own progress");
        }

        const student = await User.findById(studentId);
        if (!student || student.role !== "student") {
            throw new NotFoundException("Student not found");
        }

        const enrolledCourses = await Course.find({ students: studentId }).select("_id");
        const enrolledCourseIds = enrolledCourses.map(c => c._id);

        const totalAssignmentsCount = await Assignment.countDocuments({ course: { $in: enrolledCourseIds } });

        const submissions = await Submission.find({ student: studentId });
        const submittedCount = submissions.length;

        let evaluatedCount = 0;
        let totalMarks = 0;

        submissions.forEach((sub) => {
            if (sub.status === "evaluated") {
                evaluatedCount++;
                totalMarks += (sub.marks || 0);
            }
        });

        const averageMarks = evaluatedCount > 0 ? (totalMarks / evaluatedCount) : 0;
        const completionPercentage = totalAssignmentsCount > 0 ? ((submittedCount / totalAssignmentsCount) * 100) : 0;

        return {
            success: true,
            message: "Student progress retrieved successfully",
            data: {
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                },
                totalAssignments: totalAssignmentsCount,
                submittedAssignments: submittedCount,
                evaluatedAssignments: evaluatedCount,
                averageMarks: Number(averageMarks.toFixed(2)),
                completionPercentage: Number(completionPercentage.toFixed(2)),
            },
        };
    }
}

export default progressServices;
