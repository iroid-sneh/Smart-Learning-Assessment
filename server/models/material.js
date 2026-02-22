import mongoose from "mongoose";

const materialSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Material title is required"],
            trim: true,
            minlength: [3, "Title must be at least 3 characters"],
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },
        fileUrl: {
            type: String,
            required: [true, "File URL is required"],
            trim: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course is required"],
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Uploader is required"],
        },
    },
    {
        timestamps: true,
    }
);

const Material = mongoose.model("Material", materialSchema);
export default Material;
