import Course from "../../models/course.js";
import User from "../../models/user.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../common/utils/errorException.js";
import sendMail from "../common/middleware/sendMail.js";

class courseServices {
    static async createCourse(data, user) {
        const { title, code, description, faculty } = data;

        const existingCourse = await Course.findOne({ code: code.toUpperCase() });
        if (existingCourse) {
            throw new BadRequestException("Course code already exists");
        }

        let assignedFacultyId = user._id;
        if (faculty) {
            const selectedFaculty = await User.findOne({
                _id: faculty,
                role: "faculty",
            }).select("_id");

            if (!selectedFaculty) {
                throw new BadRequestException("Selected faculty is invalid");
            }
            assignedFacultyId = selectedFaculty._id;
        }

        const course = await Course.create({
            title,
            code: code.toUpperCase(),
            description,
            faculty: assignedFacultyId,
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
            .populate("faculty", "name email")
            .populate("students", "name email isActive");

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

        const previousStudentIds = (course.students || []).map((id) => id.toString());

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

        if (data.students && Array.isArray(data.students)) {
            data.students = [...new Set(data.students.map((id) => id.toString()))];
        }

        const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
            new: true,
            runValidators: true,
        }).populate("faculty", "name email");

        if (Array.isArray(data.students)) {
            const updatedStudentIds = (updatedCourse.students || []).map((id) =>
                id.toString()
            );
            const addedStudentIds = updatedStudentIds.filter(
                (id) => !previousStudentIds.includes(id)
            );

            if (addedStudentIds.length > 0) {
                const addedStudents = await User.find({
                    _id: { $in: addedStudentIds },
                    role: "student",
                }).select("email");

                if (addedStudents.length > 0) {
                    try {
                        await sendMail(
                            {
                                to: addedStudents.map((s) => s.email),
                                subject: `Course enrollment: ${updatedCourse.title}`,
                                courseTitle: updatedCourse.title,
                                facultyName:
                                    updatedCourse.faculty?.name || "Faculty",
                                semester: "Current",
                            },
                            "course-enrollment"
                        );
                    } catch (mailError) {
                        console.error("Enrollment email failed:", mailError.message);
                    }
                }
            }
        }

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
