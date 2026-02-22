import User from "../../../models/user.js";
import { NotFoundException, ForbiddenException, BadRequestException } from "../../common/utils/errorException.js";

class userManagementServices {
    static async getAllUsers(user) {
        if (user.role !== "admin" && user.role !== "faculty") {
            throw new ForbiddenException("Only admins and faculty can manage users");
        }

        let query = {};
        if (user.role === "faculty") {
            query = { role: "student" };
        }

        const users = await User.find(query).select("-password").sort({ createdAt: -1 });

        return {
            success: true,
            message: "Users retrieved successfully",
            data: users,
        };
    }

    static async updateUser(userId, data, user) {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can manage users");
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            throw new NotFoundException("User not found");
        }

        // Only allow updating role or isActive status
        if (data.role && !["student", "faculty", "admin"].includes(data.role)) {
            throw new BadRequestException("Invalid role provided");
        }

        const updatedUser = await User.findByIdAndUpdate(userId, data, {
            new: true,
            runValidators: true,
        }).select("-password");

        return {
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        };
    }

    static async deleteUser(userId, user) {
        if (user.role !== "admin") {
            throw new ForbiddenException("Only admins can manage users");
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            throw new NotFoundException("User not found");
        }

        // Prevent admin from deleting themselves
        if (userId === user._id.toString()) {
            throw new BadRequestException("You cannot delete your own admin account");
        }

        await User.findByIdAndDelete(userId);

        return {
            success: true,
            message: "User deleted successfully",
        };
    }
}

export default userManagementServices;
