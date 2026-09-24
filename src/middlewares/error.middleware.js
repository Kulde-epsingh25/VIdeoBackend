import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

/**
 * Global Centralized Error Handling Middleware for Express
 * Catches ApiError, Mongoose ValidationError, CastError, JWT errors, and unhandled exceptions.
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Check if error is an instance of custom ApiError
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof mongoose.Error ? 400 : 500;

        const message = error.message || "Internal Server Error";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        statusCode: error.statusCode,
        data: error.data,
        message: error.message,
        success: error.success,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    return res.status(error.statusCode).json(response);
};

export { errorHandler };
