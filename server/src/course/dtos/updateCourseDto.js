import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional().label("Title").messages({
        "string.empty": "Course title cannot be empty.",
        "string.min": "Course title must be at least 3 characters.",
        "string.max": "Course title must be at most 200 characters.",
    }),
    code: Joi.string().trim().uppercase().pattern(/^[A-Z0-9\-]{2,20}$/).optional().label("Code").messages({
        "string.pattern.base": "Course code must be 2–20 characters using uppercase letters, digits, or dashes (e.g., CS-601).",
    }),
    description: Joi.string().max(1000).allow("").trim().optional().label("Description").messages({
        "string.max": "Description must be at most 1000 characters.",
    }),
    faculty: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().label("Faculty").messages({
        "string.pattern.base": "Please select a valid faculty member.",
    }),
    students: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional().label("Students").messages({
        "string.pattern.base": "Invalid student reference in list.",
    }),
}).min(1).messages({
    "object.min": "Please provide at least one field to update.",
});
