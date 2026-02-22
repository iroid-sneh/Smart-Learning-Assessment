import mongoose from "mongoose";
import { BadRequestException } from "../utils/errorException.js";

/**
 * @description Validate MongoDB ObjectId in route params
 * @param {string} paramName - The name of the param to validate (default: "id")
 */
export const validateObjectId = (paramName = "id") => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next(
                new BadRequestException(
                    `Invalid ${paramName}. Must be a valid MongoDB ObjectId.`
                )
            );
        }
        next();
    };
};
