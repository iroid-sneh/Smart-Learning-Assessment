import mongoose from "mongoose";

const courseSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        code: {
            type: String,
            required: [true, "Course code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            match: [/^[A-Z0-9\-]{2,20}$/, "Course code must be alphanumeric (e.g., CS-601)"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },
        faculty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Faculty is required"],
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate student entries
courseSchema.pre("save", function () {
    if (this.students && this.students.length > 0) {
        const ids = this.students.map((id) => id.toString());
        this.students = [...new Set(ids)].map(
            (id) => new mongoose.Types.ObjectId(id)
        );
    }
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
