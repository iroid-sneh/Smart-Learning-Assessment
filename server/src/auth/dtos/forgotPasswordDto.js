import Joi from "joi";

export default Joi.object().keys({
    email: Joi.string().email().lowercase().trim().required().label("email"),
});
