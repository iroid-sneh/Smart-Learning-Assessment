import Assignment from "../../models/assignment.js";
import Course from "../../models/course.js";
import User from "../../models/user.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../common/utils/errorException.js";
import { isAssignmentClosed, endOfDay } from "../common/utils/dateUtils.js";
import sendMail from "../common/middleware/sendMail.js";

class assignmentServices {
    static async createAssignment(courseId, data, user) {
        const id = courseId || data.course;
        if (!id) {
            throw new BadRequestException("Course ID is required");
        }

        const course = await Course.findById(id);
        if (!course) {
            throw new NotFoundException("Course not found");
        }

        if (course.faculty.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to create assignments for this course");
        }

        if (!data.dueDate) {
            throw new BadRequestException("Due date is required");
        }
        if (endOfDay(data.dueDate).getTime() < Date.now()) {
            throw new BadRequestException(
                "Due date cannot be in the past. Please choose today or a future date."
            );
        }

        const assignment = await Assignment.create({
            ...data,
            course: id,
            createdBy: user._id,
        });

        const studentUsers = await User.find({
            _id: { $in: course.students || [] },
            role: "student",
        }).select("email");

        if (studentUsers.length > 0) {
            try {
                await sendMail(
                    {
                        to: studentUsers.map((s) => s.email),
                        subject: `New assignment in ${course.title}`,
                        courseTitle: course.title,
                        assignmentTitle: assignment.title,
                        dueDate: new Date(assignment.dueDate).toLocaleDateString(),
                    },
                    "assigment"
                );
            } catch (mailError) {
                console.error("Assignment email failed:", mailError.message);
            }
        }

        return {
            success: true,
            message: "Assignment created successfully",
            data: assignment,
        };
    }

    static async getAllAssignments(user) {
        let query = {};
        if (user.role === "faculty") {
            query = { createdBy: user._id };
        }

        const assignments = await Assignment.find(query)
            .populate("course", "title code")
            .populate("createdBy", "name email")
            .sort({ dueDate: 1 });

        return {
            success: true,
            message: "Assignments retrieved successfully",
            data: assignments,
        };
    }

    static async getCourseAssignments(courseId) {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new NotFoundException("Course not found");
        }

        const assignments = await Assignment.find({ course: courseId })
            .populate("createdBy", "name email")
            .sort({ dueDate: 1 });

        return {
            success: true,
            message: "Assignments retrieved successfully",
            data: assignments,
        };
    }

    static async updateAssignment(assignmentId, data, user) {
        if (Object.keys(data).length === 0) {
            throw new BadRequestException("No updates provided");
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            throw new NotFoundException("Assignment not found");
        }

        if (assignment.createdBy.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to update this assignment");
        }

        // Once the assignment is closed (past end-of-day of its due date), only an admin
        // may re-open it by setting a new valid due date. Faculty cannot extend closed work.
        if (isAssignmentClosed(assignment) && user.role !== "admin") {
            throw new ForbiddenException(
                "This assignment is closed. Only an administrator can re-open it with a new due date."
            );
        }

        if (data.dueDate !== undefined) {
            if (endOfDay(data.dueDate).getTime() < Date.now()) {
                throw new BadRequestException(
                    "Due date cannot be in the past. Please choose today or a future date."
                );
            }
        }

        const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, data, {
            new: true,
            runValidators: false,
        }).populate("createdBy", "name email");

        return {
            success: true,
            message: "Assignment updated successfully",
            data: updatedAssignment,
        };
    }

    static async deleteAssignment(assignmentId, user) {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            throw new NotFoundException("Assignment not found");
        }

        if (assignment.createdBy.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to delete this assignment");
        }

        await Assignment.findByIdAndDelete(assignmentId);

        return {
            success: true,
            message: "Assignment deleted successfully",
        };
    }
}

export default assignmentServices;
