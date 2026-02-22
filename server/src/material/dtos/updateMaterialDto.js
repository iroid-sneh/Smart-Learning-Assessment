import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional().label("title"),
    description: Joi.string().max(1000).allow("").trim().optional().label("description"),
    fileUrl: Joi.string().uri().optional().label("fileUrl"),
}).min(1);
