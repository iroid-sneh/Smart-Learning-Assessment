import Course from "../../models/course.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../common/utils/errorException.js";

class courseServices {
    static async createCourse(data, user) {
        const { title, code, description } = data;

        const existingCourse = await Course.findOne({ code: code.toUpperCase() });
        if (existingCourse) {
            throw new BadRequestException("Course code already exists");
        }

        const course = await Course.create({
            title,
            code: code.toUpperCase(),
            description,
            faculty: user._id,
        });

        return {
            success: true,
            message: "Course created successfully",
            data: course,
        };
    }

    static async getAllCourses(user) {
        // Option 1: fetch all courses for everyone, or restrict
        // Currently everyone can see all courses
        const courses = await Course.find()
            .populate("faculty", "name email")
            .sort({ createdAt: -1 });

        return {
            success: true,
            message: "Courses retrieved successfully",
            data: courses,
        };
    }

    static async getCourseById(courseId) {
        const course = await Course.findById(courseId)
            .populate("faculty", "name email");

        if (!course) {
            throw new NotFoundException("Course not found");
        }

        return {
            success: true,
            message: "Course retrieved successfully",
            data: course,
        };
    }

    static async updateCourse(courseId, data, user) {
        if (Object.keys(data).length === 0) {
            throw new BadRequestException("No updates provided");
        }

        const course = await Course.findById(courseId);
        if (!course) {
            throw new NotFoundException("Course not found");
        }

        if (course.faculty.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to update this course");
        }

        if (data.code) {
            const existingCourse = await Course.findOne({
                code: data.code.toUpperCase(),
                _id: { $ne: courseId }
            });
            if (existingCourse) {
                throw new BadRequestException("Course code already exists");
            }
            data.code = data.code.toUpperCase();
        }

        const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
            new: true,
            runValidators: true,
        }).populate("faculty", "name email");

        return {
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        };
    }

    static async deleteCourse(courseId, user) {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new NotFoundException("Course not found");
        }

        if (course.faculty.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to delete this course");
        }

        await Course.findByIdAndDelete(courseId);

        return {
            success: true,
            message: "Course deleted successfully",
        };
    }
}

export default courseServices;
