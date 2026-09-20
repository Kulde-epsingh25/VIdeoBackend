import  {isValidObjectId } from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    // validate videoId
    // check if liked already
    // if liked, remove like by deleting the like document
    // if not liked, add like ny creating a new like document
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });

        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video unliked successfully")
        );
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(200, { liked: true, like }, "Video liked successfully")
    );

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

     if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

     const comment = await Like.findOneAndUpdate(
        { comment: commentId, likedBy: req.user._id },
         { $set: { likedBy: req.user._id } },
          { new: true   }); 
    

    if(!comment) {
        throw new ApiError(404, "Comment not found or you are not authorized to like/unlike this comment");
    }

    return res.status(200).json(new ApiResponse(true, comment, "Comment like status toggled successfully"));

})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

     if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Like.findOneAndUpdate(
        { tweet: tweetId, likedBy: req.user._id },
         { $set: { likedBy: req.user._id } },
          { new: true   }); 
    

    if(!tweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to like/unlike this tweet");
    }

    return res.status(200).json(new ApiResponse(true, tweet, "Tweet like status toggled successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // use aggregation to get all liked videos by the user
    // first condition is to match the user id and video id should not be null
    // join video to like collection using $lookup
    // unwind the video array to get the video details 
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                video: { $ne: null } // $ne: null ensures that we only get likes that are associated with videos
            }
        },
        {
            $lookup: {
                from: 'videos', // collect all videos from the 'videos' collection
                localField: 'video', // the field in the Like collection
                foreignField: '_id', // the field in the Video collection
                as: 'videoDetails' // the name of the new array field to add to the output documents
            }
        },
        {
            $unwind: '$videoDetails' // deconstruct the array field from the input documents to output a document for each element
        }
    ]);

    console.log(likedVideos);
    
    if (likedVideos.length === 0) {
        return res.status(200).json(new ApiResponse(false, null, "No liked videos found"));
    }

    return res.status(200).json(new ApiResponse(true, likedVideos, "Liked videos fetched successfully"));

});


const getLikedTweets = asyncHandler(async (req, res) => {
    //TODO: get all liked tweets    
    
    const likedTweets = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                tweet: { $ne: null } // $ne: null ensures that we only get likes that are associated with videos
            }
        },
        {
            $lookup: {
                from: 'tweets',
                localField: 'tweet', 
                foreignField: '_id', 
                as: 'tweetDetails'
            }
         }  //,
            // {
            //     $unwind: '$tweetDetails' 
            //}
    ]);
   
    console.log(likedTweets);

    if (likedTweets.length === 0) {
        return res.status(200).json(new ApiResponse(false, null, "No liked tweets found"));
    }

    return res.status(200).json(new ApiResponse(true, likedTweets, "Liked tweets fetched successfully"));

});
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikedTweets
}
