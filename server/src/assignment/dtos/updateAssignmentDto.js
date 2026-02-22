import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional().label("title"),
    description: Joi.string().max(2000).allow("").trim().optional().label("description"),
    dueDate: Joi.date().greater("now").optional().label("dueDate").messages({
        "date.greater": "Due date must be a future date",
    }),
}).min(1);
