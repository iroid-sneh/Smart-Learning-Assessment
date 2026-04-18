import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional().label("Title").messages({
        "string.empty": "Title cannot be empty.",
        "string.min": "Title must be at least 3 characters.",
        "string.max": "Title must be at most 200 characters.",
    }),
    description: Joi.string().max(1000).allow("").trim().optional().label("Description").messages({
        "string.max": "Description must be at most 1000 characters.",
    }),
    fileUrl: Joi.string().uri().optional().label("File URL").messages({
        "string.uri": "Please provide a valid file URL.",
    }),
}).min(1).messages({
    "object.min": "Please provide at least one field to update.",
});
