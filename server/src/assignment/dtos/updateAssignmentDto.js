import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional().label("Title").messages({
        "string.empty": "Title cannot be empty.",
        "string.min": "Title must be at least 3 characters.",
        "string.max": "Title must be at most 200 characters.",
    }),
    description: Joi.string().max(2000).allow("").trim().optional().label("Description").messages({
        "string.max": "Description must be at most 2000 characters.",
    }),
    dueDate: Joi.date().iso().optional().label("Due date").messages({
        "date.base": "Please provide a valid due date.",
        "date.format": "Please provide a valid due date.",
    }),
}).min(1).messages({
    "object.min": "Please provide at least one field to update.",
});
