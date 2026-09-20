import {Schema} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
   // aggregate pipeline  for each model
   // match user id
   //  lookup 
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelVideos = await Video.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        }
    ]);

    if(channelVideos.length === 0) {
        return res.status(200).json(new ApiResponse(false,null, "No videos found for this channel"));
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channelVideos, "Channel videos fetched successfully")); 

});
export {
    getChannelStats, 
    getChannelVideos
    }