import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().required().label("Title").messages({
        "string.empty": "Title is required.",
        "string.min": "Title must be at least 3 characters.",
        "string.max": "Title must be at most 200 characters.",
        "any.required": "Title is required.",
    }),
    message: Joi.string().min(10).max(2000).trim().required().label("Message").messages({
        "string.empty": "Message is required.",
        "string.min": "Message must be at least 10 characters.",
        "string.max": "Message must be at most 2000 characters.",
        "any.required": "Message is required.",
    }),
    type: Joi.string().valid("Academic", "Event", "System", "General").default("General").label("Type").messages({
        "any.only": "Type must be one of: Academic, Event, System, General.",
    }),
});
