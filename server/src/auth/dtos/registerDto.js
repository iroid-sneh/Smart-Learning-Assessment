import Joi from "joi";

export default Joi.object().keys({
    name: Joi.string().min(2).max(100).trim().pattern(/^[A-Za-z][A-Za-z\s.'-]*$/).required().label("Name").messages({
        "string.empty": "Full name is required.",
        "string.min": "Full name must be at least 2 characters.",
        "string.max": "Full name must be at most 100 characters.",
        "string.pattern.base": "Full name may only contain letters, spaces, dots, apostrophes, and hyphens.",
        "any.required": "Full name is required.",
    }),
    email: Joi.string().email().lowercase().trim().max(254).required().label("Email").messages({
        "string.empty": "Email is required.",
        "string.email": "Please enter a valid email address.",
        "string.max": "Email is too long.",
        "any.required": "Email is required.",
    }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        .required()
        .label("Password")
        .messages({
            "string.empty": "Password is required.",
            "string.min": "Password must be at least 8 characters.",
            "string.max": "Password must be at most 128 characters.",
            "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
            "any.required": "Password is required.",
        }),
    role: Joi.string().valid("student", "faculty").default("student").label("Role").messages({
        "any.only": "Role must be either 'student' or 'faculty'.",
    }),
});
