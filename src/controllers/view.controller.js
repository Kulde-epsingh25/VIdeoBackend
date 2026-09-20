import {asyncHandler} from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";
import { View } from "../models/view.model.js";
import { Video } from "../models/video.model.js";
import { ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const addView = asyncHandler(async (req, res) => {
    const { videoId } = req.params; 
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const userId = req.user._id;

    // Always update watch history
    await User.findByIdAndUpdate(userId, {
        $pull: {
            watchHistory: { video: videoId }
        }
    });

    await User.findByIdAndUpdate(userId, {
        $push: {
            watchHistory: {
                $each: [{
                    video: videoId,
                    watchedAt: new Date()
                }],
                $position: 0 
            }
        }
    });

    // Count the view only once per user
    const existingView = await View.findOne({
        video: videoId,
        user: userId
    });

    if (existingView) {
        return res
            .status(200)
            .json(new ApiResponse(200, existingView, "View already exists, watch history updated"));
    }

    const newView = await View.create({
        video: videoId,
        user: userId
    });

    video.views += 1;
    await video.save();

    const updatedUser = await User.findById(userId).select("username watchHistory");

    console.log("Updated user:", updatedUser);

    return res
        .status(201)
        .json(new ApiResponse(201, newView, "View added and watch history updated"));

});

export { addView  };