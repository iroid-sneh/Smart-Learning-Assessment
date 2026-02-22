import mongoose from "mongoose";

const assignmentSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Assignment title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
            default: "",
        },
        dueDate: {
            type: Date,
            required: [true, "Due date is required"],
            validate: {
                validator: function (value) {
                    // Only validate on create (new documents), not on update
                    if (this.isNew) {
                        return value > new Date();
                    }
                    return true;
                },
                message: "Due date must be in the future",
            },
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course is required"],
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

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
