import mongoose from "mongoose";

const submissionSchema = mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: [true, "Assignment is required"],
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student is required"],
        },
        fileUrl: {
            type: String,
            required: [true, "File URL is required"],
            trim: true,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        marks: {
            type: Number,
            min: [0, "Marks cannot be negative"],
            max: [100, "Marks cannot exceed 100"],
            default: null,
        },
        feedback: {
            type: String,
            trim: true,
            maxlength: [1000, "Feedback cannot exceed 1000 characters"],
            default: null,
        },
        status: {
            type: String,
            enum: {
                values: ["submitted", "evaluated"],
                message: "Status must be submitted or evaluated",
            },
            default: "submitted",
        },
    },
    {
        timestamps: true,
    }
);

// One student can submit once per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
