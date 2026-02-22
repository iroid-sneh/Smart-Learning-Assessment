import Submission from "../../models/submission.js";
import Assignment from "../../models/assignment.js";
import Course from "../../models/course.js";
import { BadRequestException, NotFoundException, ForbiddenException, ConflictException } from "../common/utils/errorException.js";

class submissionServices {
    static async createSubmission(assignmentId, data, user, file) {
        if (user.role !== "student") {
            throw new ForbiddenException("Only students can submit assignments");
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            throw new NotFoundException("Assignment not found");
        }

        const course = await Course.findById(assignment.course);
        if (!course.students.some(id => id.toString() === user._id.toString())) {
            throw new ForbiddenException("You are not enrolled in this course");
        }

        const existingSubmission = await Submission.findOne({
            assignment: assignmentId,
            student: user._id,
        });

        if (existingSubmission) {
            throw new ConflictException("You have already submitted this assignment");
        }

        if (!file) {
            throw new BadRequestException("Submission file is required");
        }

        const fileUrl = `${process.env.BASE_URL}:${process.env.PORT || 5001}/uploads/submissions/${file.filename}`;

        const submission = await Submission.create({
            assignment: assignmentId,
            student: user._id,
            fileUrl,
            status: "submitted",
        });

        return {
            success: true,
            message: "Assignment submitted successfully",
            data: submission,
        };
    }

    static async getAssignmentSubmissions(assignmentId, user) {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            throw new NotFoundException("Assignment not found");
        }

        if (assignment.createdBy.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to view submissions for this assignment");
        }

        const submissions = await Submission.find({ assignment: assignmentId })
            .populate("student", "name email")
            .sort({ submittedAt: -1 });

        return {
            success: true,
            message: "Submissions retrieved successfully",
            data: submissions,
        };
    }

    static async evaluateSubmission(submissionId, data, user) {
        const { marks, feedback } = data;

        const submission = await Submission.findById(submissionId).populate("assignment");
        if (!submission) {
            throw new NotFoundException("Submission not found");
        }

        const assignment = submission.assignment;
        if (!assignment) {
            throw new NotFoundException("Associated assignment not found");
        }

        // Verify faculty owns the course or is admin
        const course = await Course.findById(assignment.course);
        if (!course) {
            throw new NotFoundException("Associated course not found");
        }

        if (course.faculty.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to evaluate this submission");
        }

        if (marks > assignment.totalMarks) {
            throw new BadRequestException(`Marks cannot exceed total marks (${assignment.totalMarks})`);
        }

        submission.marks = marks;
        submission.feedback = feedback;
        submission.status = "evaluated";
        submission.evaluatedBy = user._id;

        await submission.save();

        return {
            success: true,
            message: "Submission evaluated successfully",
            data: submission,
        };
    }

    static async getMySubmissions(user) {
        const submissions = await Submission.find({ student: user._id })
            .populate("assignment")
            .sort({ createdAt: -1 });

        return {
            success: true,
            message: "My submissions retrieved successfully",
            data: submissions,
        };
    }
}

export default submissionServices;
