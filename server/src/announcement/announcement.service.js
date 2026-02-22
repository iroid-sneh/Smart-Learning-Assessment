import Announcement from "../../models/announcement.js";
import { BadRequestException, NotFoundException, ForbiddenException } from "../common/utils/errorException.js";

class announcementServices {
    static async createAnnouncement(data, user) {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can create announcements");
        }

        const announcement = await Announcement.create({
            ...data,
            createdBy: user._id,
        });

        return {
            success: true,
            message: "Announcement created successfully",
            data: announcement,
        };
    }

    static async getAllAnnouncements() {
        // Everyone can see announcements
        const announcements = await Announcement.find()
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        return {
            success: true,
            message: "Announcements retrieved successfully",
            data: announcements,
        };
    }

    static async updateAnnouncement(announcementId, data, user) {
        if (Object.keys(data).length === 0) {
            throw new BadRequestException("No updates provided");
        }

        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can update announcements");
        }

        const announcement = await Announcement.findById(announcementId);
        if (!announcement) {
            throw new NotFoundException("Announcement not found");
        }

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(announcementId, data, {
            new: true,
            runValidators: true,
        }).populate("createdBy", "name email");

        return {
            success: true,
            message: "Announcement updated successfully",
            data: updatedAnnouncement,
        };
    }

    static async deleteAnnouncement(announcementId, user) {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can delete announcements");
        }

        const announcement = await Announcement.findById(announcementId);
        if (!announcement) {
            throw new NotFoundException("Announcement not found");
        }

        await Announcement.findByIdAndDelete(announcementId);

        return {
            success: true,
            message: "Announcement deleted successfully",
        };
    }
}

export default announcementServices;
