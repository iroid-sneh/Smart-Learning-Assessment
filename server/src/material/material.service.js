import Material from "../../models/material.js";
import Course from "../../models/course.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../common/utils/errorException.js";

class materialServices {
    static async createMaterial(courseId, data, user, file) {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new NotFoundException("Course not found");
        }

        if (course.faculty.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to upload materials for this course");
        }

        if (!file) {
            throw new BadRequestException("File is required");
        }

        // Generate full URL for the file
        const fileUrl = `${process.env.BASE_URL}:${process.env.PORT || 5001}/uploads/materials/${file.filename}`;

        const material = await Material.create({
            ...data,
            fileUrl,
            course: courseId,
            uploadedBy: user._id,
        });

        return {
            success: true,
            message: "Material uploaded successfully",
            data: material,
        };
    }

    static async getCourseMaterials(courseId) {
        const course = await Course.findById(courseId);
        if (!course) {
            throw new NotFoundException("Course not found");
        }

        const materials = await Material.find({ course: courseId })
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        return {
            success: true,
            message: "Materials retrieved successfully",
            data: materials,
        };
    }

    static async updateMaterial(materialId, data, user) {
        if (Object.keys(data).length === 0) {
            throw new BadRequestException("No updates provided");
        }

        const material = await Material.findById(materialId);
        if (!material) {
            throw new NotFoundException("Material not found");
        }

        if (material.uploadedBy.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to update this material");
        }

        const updatedMaterial = await Material.findByIdAndUpdate(materialId, data, {
            new: true,
            runValidators: true,
        }).populate("uploadedBy", "name email");

        return {
            success: true,
            message: "Material updated successfully",
            data: updatedMaterial,
        };
    }

    static async deleteMaterial(materialId, user) {
        const material = await Material.findById(materialId);
        if (!material) {
            throw new NotFoundException("Material not found");
        }

        if (material.uploadedBy.toString() !== user._id.toString() && user.role !== "admin") {
            throw new ForbiddenException("Not authorized to delete this material");
        }

        await Material.findByIdAndDelete(materialId);

        return {
            success: true,
            message: "Material deleted successfully",
        };
    }
}

export default materialServices;
