import Joi from "joi";

export default Joi.object().keys({
    title: Joi.string().min(3).max(200).trim().required().label("title"),
    message: Joi.string().min(10).max(2000).trim().required().label("message"),
    type: Joi.string().valid("Academic", "Event", "System", "General").default("General").label("type"),
});
