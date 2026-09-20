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

  
});

const getTweetComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a tweet
    const {tweetId} = req.params
    const {page = 1, limit = 10} = req.query

  
});



const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // get id of video or tweet id from req.params
    // check if video or tweet exists
    // create a new comment document with the content, video or tweet id, and owner id
    // save the comment document to the database
    // return the response with status 201 and the created comment document

    const {videoId, tweetId} = req.params
    const {content} = req.body || {};

    if(!videoId && !tweetId){
        throw new ApiError(400, "Either videoId or tweetId is required");
    }
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content is required");
    }
    
    const video = isValidObjectId(videoId) ? await Video.findById(videoId) : null;
    const tweet = isValidObjectId(tweetId) ? await Tweet.findById(tweetId) : null;

    if(videoId && !video){
        throw new ApiError(404, "Video not found or invalid videoId");
    };
    if(tweetId && !tweet){
        throw new ApiError(404, "Tweet not found or invalid tweetId");
    };

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId || null,
        tweet: tweetId || null,
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