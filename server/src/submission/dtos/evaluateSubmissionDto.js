import Joi from "joi";

export default Joi.object().keys({
    marks: Joi.number().min(0).max(100).required().label("marks").messages({
        "number.min": "Marks cannot be negative",
        "number.max": "Marks cannot exceed 100",
    }),
    feedback: Joi.string().max(1000).allow("").trim().optional().label("feedback"),
});
