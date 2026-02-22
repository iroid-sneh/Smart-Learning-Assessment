import Joi from "joi";

export default Joi.object().keys({
    fileUrl: Joi.string().uri().required().label("fileUrl"),
});
