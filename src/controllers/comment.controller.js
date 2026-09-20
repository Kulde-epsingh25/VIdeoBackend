import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    // Get videoId from req.params
// Validate that videoId is a valid MongoDB ObjectId
// Check whether the video exists
// Get page and limit from req.query
// Convert page and limit to numbers
// Calculate the number of comments to skip
// Find comments that belong to the video
// Populate the comment owner details
// Sort comments by newest first
// Apply pagination using skip and limit
// Count the total comments for the video
// Calculate the total number of pages
// Return comments with pagination details

    if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid video ID");
    };
     
    if(!(await Video.findById(videoId))){
        throw new ApiError(404, "Video not found");
    };

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);

    if (
        !Number.isInteger(pageNumber) ||
        !Number.isInteger(limitNumber) ||
        pageNumber < 1 ||
        limitNumber < 1 ||
        limitNumber > 100
    ) {
        throw new ApiError(400, "Page must be at least 1 and limit must be between 1 and 100");
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [comments, totalComments] = await Promise.all([
        Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                fullName: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind:  "$ownerDetails"
                
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limitNumber
            }
        ]),

        Comment.countDocuments({ video: videoId })
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: totalComments,
                    totalPages: Math.ceil(totalComments / limitNumber)
                }
            },
            "Comments fetched successfully"
        )
    );
});

const getTweetComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a tweet
    const {tweetId} = req.params
    const {page = 1, limit = 10} = req.query

   if(!isValidObjectId(tweetId)){
    throw new ApiError(400, "Invalid tweet ID");
    };
     
    if(!(await Tweet.findById(tweetId))){
        throw new ApiError(404, "Tweet not found");
    };

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);

    if (
        !Number.isInteger(pageNumber) ||
        !Number.isInteger(limitNumber) ||
        pageNumber < 1 ||
        limitNumber < 1 ||
        limitNumber > 100
    ) {
        throw new ApiError(400, "Page must be at least 1 and limit must be between 1 and 100");
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [comments, totalComments] = await Promise.all([
        Comment.aggregate([
            {
                $match: {
                    tweet: new mongoose.Types.ObjectId(tweetId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                fullName: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: {
                    path: "$ownerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: limitNumber
            }
        ]),

        Comment.countDocuments({ tweet: tweetId })
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: totalComments,
                    totalPages: Math.ceil(totalComments / limitNumber)
                }
            },
            "Tweet comments fetched successfully"
        )
    );

    
  
});



const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // get id of video or tweet id from req.params
    // check if video or tweet exists
    // create a new comment document with the content, video or tweet id, and owner id
    // save the comment document to the database
    // return the response with status 201 and the created comment document

    const {videoId, tweetId, commentId} = req.params
    const {content} = req.body || {};

    if(!videoId && !tweetId && !commentId){
        throw new ApiError(400, "Either videoId or tweetId or commentId is required");
    }
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required");
    }
    
    const video = isValidObjectId(videoId) ? await Video.findById(videoId) : null;
    const tweet = isValidObjectId(tweetId) ? await Tweet.findById(tweetId) : null;
    const newComment = isValidObjectId(commentId) ? await Comment.findById(commentId) : null;

    if(videoId && !video){
        throw new ApiError(404, "Video not found or invalid videoId");
    };
    if(tweetId && !tweet){
        throw new ApiError(404, "Tweet not found or invalid tweetId");
    };
    if(commentId && !newComment){
        throw new ApiError(404, "Comment not found or invalid commentId");
    }
    
    if(!videoId && !tweetId && !commentId){
        throw new ApiError(400, "Either videoId or tweetId or commentId is required");
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId || null,
        tweet: tweetId || null,
        parentComment: commentId || null,
        owner: req.user._id
    });

    if(!comment){
        throw new ApiError(500, "Failed to add comment");
    };

    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));

});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    // get comment id from req.params
    // check if comment exists
    // check if comment belongs to the user
    // update the comment document in database with new content
    // return the response with status 200 and the updated comment document

    const {commentId} = req.params
    const {content} = req.body || {};

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const editedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },
        { content: content.trim() },
        { new: true }
    );

    if(!editedComment){
        throw new ApiError(404, "Comment not found or you are not the owner");
    }
    return res.status(200).json(new ApiResponse(200, editedComment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    // get comment id from req.params
    // check if comment exists
    // check if comment belongs to the user
    // delete the comment document from database
    // return the response with status 200 and a success message

    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const deletedComment = await Comment.findOneAndDelete({ _id: commentId, owner: req.user._id });

    if(!deletedComment){
        throw new ApiError(404, "Comment not found or you are not the owner");
    }
    return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
})

export {
    getVideoComments, 
    getTweetComments,
    addComment, 
    updateComment,
     deleteComment
    }