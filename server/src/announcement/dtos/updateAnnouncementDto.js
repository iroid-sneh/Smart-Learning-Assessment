import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().optional().label("title"),
    message: Joi.string().min(10).max(2000).trim().optional().label("message"),
    type: Joi.string().valid("Academic", "Event", "System", "General").optional().label("type"),
}).min(1);
