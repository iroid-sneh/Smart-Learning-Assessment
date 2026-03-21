import Joi from "joi";

export default Joi.object().keys({
    email: Joi.string().email().lowercase().trim().required().label("email"),
    otp: Joi.string().length(4).required().label("otp"),
    newPassword: Joi.string().min(6).required().label("newPassword"),
});
