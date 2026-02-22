import Assignment from "../../models/assignment.js";
import Course from "../../models/course.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../common/utils/errorException.js";

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

        const assignment = await Assignment.create({
            ...data,
            course: courseId,
            createdBy: user._id,
        });

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

        // Only enforce future dueDate validation if it is being modified and isn't the same as current
        if (data.dueDate && new Date(data.dueDate) <= new Date()) {
            throw new BadRequestException("Due date must be in the future");
        }

        const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, data, {
            new: true,
            runValidators: false, // bypassing mongoose validation to allow updating other fields even if dueDate is now past
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
