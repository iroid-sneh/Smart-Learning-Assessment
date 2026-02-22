import Joi from "joi";

export default Joi.object().keys({
    email: Joi.string().email().required().label("email"),
    password: Joi.string().required().label("password"),
    role: Joi.string().valid("student", "faculty", "admin").optional().label("role"),
});

