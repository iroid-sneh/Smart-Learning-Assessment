import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().required().label("Title").messages({
        "string.empty": "Title is required.",
        "string.min": "Title must be at least 3 characters.",
        "string.max": "Title must be at most 200 characters.",
        "any.required": "Title is required.",
    }),
    description: Joi.string().max(2000).allow("").trim().optional().label("Description").messages({
        "string.max": "Description must be at most 2000 characters.",
    }),
    course: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().label("Course").messages({
        "string.empty": "Course is required.",
        "string.pattern.base": "Invalid course reference.",
        "any.required": "Course is required.",
    }),
    dueDate: Joi.date().iso().required().label("Due date").messages({
        "date.base": "Please provide a valid due date.",
        "date.format": "Please provide a valid due date.",
        "any.required": "Due date is required.",
    }),
});
