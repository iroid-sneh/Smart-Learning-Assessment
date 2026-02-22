import mongoose from "mongoose";

const announcementSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Announcement title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        message: {
            type: String,
            required: [true, "Announcement message is required"],
            trim: true,
            minlength: [10, "Message must be at least 10 characters"],
            maxlength: [2000, "Message cannot exceed 2000 characters"],
        },
        type: {
            type: String,
            enum: {
                values: ["Academic", "Event", "System", "General"],
                message: "Type must be Academic, Event, System, or General",
            },
            default: "General",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator is required"],
        },
    },
    {
        timestamps: true,
    }
);

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
