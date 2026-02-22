import Joi from "joi";

export default Joi.object().keys({
    name: Joi.string().min(2).max(100).trim().required().label("name"),
    email: Joi.string().email().lowercase().trim().required().label("email"),
    password: Joi.string().min(6).required().label("password"),
    role: Joi.string().valid("student", "faculty").default("student").label("role"),
});
