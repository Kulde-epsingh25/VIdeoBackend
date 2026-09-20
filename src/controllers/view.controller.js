import asyncHandler from "express-async-handler";
import { isValidObjectId } from "mongoose";
import { View } from "../models/view.model.js";
import { Video } from "../models/video.model.js";
import { AppError} from "../utils/appError.js";
import { User } from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const addView = asyncHandler(async (req, res) => {
    const { videoId } = req.params; 
    if (!isValidObjectId(videoId)) {
        throw new AppError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new AppError(404, "Video not found");
    }

    const userId = req.user._id;
    const existingView = await View.findOne({ video: videoId, user: userId });
    if (existingView) {
        throw new AppError(400, "View already exists");
    }

    const newView = await View.create({ video: videoId, user: userId });

    if (!newView) {
        throw new AppError(500, "Failed to add view");
    }
    if(newView){ 
        video.viewsCount += 1;  
        await video.save();
    }

    return res.status(201).json(new ApiResponse(201, newView, "View added successfully"));

});

export { addView  };