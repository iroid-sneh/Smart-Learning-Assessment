import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional().label("Title").messages({
        "string.empty": "Title cannot be empty.",
        "string.min": "Title must be at least 3 characters.",
        "string.max": "Title must be at most 200 characters.",
    }),
    message: Joi.string().min(10).max(2000).trim().optional().label("Message").messages({
        "string.empty": "Message cannot be empty.",
        "string.min": "Message must be at least 10 characters.",
        "string.max": "Message must be at most 2000 characters.",
    }),
    type: Joi.string().valid("Academic", "Event", "System", "General").optional().label("Type").messages({
        "any.only": "Type must be one of: Academic, Event, System, General.",
    }),
}).min(1).messages({
    "object.min": "Please provide at least one field to update.",
});
