import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional().label("title"),
    code: Joi.string().pattern(/^[A-Z0-9\-]{2,20}$/).optional().label("code").messages({
        "string.pattern.base": "Course code must be alphanumeric and uppercase (e.g., CS-601)",
    }),
    description: Joi.string().max(1000).allow("").trim().optional().label("description"),
    faculty: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().label("faculty"),
    students: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional().label("students")
}).min(1);
