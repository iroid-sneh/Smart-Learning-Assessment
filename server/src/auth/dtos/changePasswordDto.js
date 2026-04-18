import Joi from "joi";

export default Joi.object().keys({
    currentPassword: Joi.string().required().label("Current password").messages({
        "string.empty": "Current password is required.",
        "any.required": "Current password is required.",
    }),
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        .required()
        .label("New password")
        .messages({
            "string.empty": "New password is required.",
            "string.min": "New password must be at least 8 characters.",
            "string.max": "New password must be at most 128 characters.",
            "string.pattern.base":
                "New password must contain at least one uppercase letter, one lowercase letter, and one number.",
            "any.required": "New password is required.",
        }),
});
