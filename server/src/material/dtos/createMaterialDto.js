import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().required().label("Title").messages({
        "string.empty": "Title is required.",
        "string.min": "Title must be at least 3 characters.",
        "string.max": "Title must be at most 200 characters.",
        "any.required": "Title is required.",
    }),
    description: Joi.string().max(1000).allow("").trim().optional().label("Description").messages({
        "string.max": "Description must be at most 1000 characters.",
    }),
});
