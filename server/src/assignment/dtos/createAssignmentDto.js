import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().required().label("title"),
    description: Joi.string().max(2000).allow("").trim().optional().label("description"),
    course: Joi.string().required().label("course"),
    dueDate: Joi.date().required().label("dueDate"),
});
