import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // get content from req.body, owner from req.user._id
    // validate content
    // create tweet document in database
    const { content } = req.body
    const owner = req.user._id

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner
    })

    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets 
    // get userId from req.params
    // validate userId
    // find tweets by owner in database
    // return the response with status 200 and the tweets


    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    };

    const tweets = await Tweet.find({ owner: userId });

    if (!tweets) {
        throw new ApiError(404, "No tweets found for this user")
    }

    return res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // get tweetId from req.params, content from req.body, owner from req.user._id
    // validate tweetId, content
    // check if the tweet exists and belongs to the user
    // update the tweet document in database with new content
    const { tweetId } = req.params
    const { content } = req.body


    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    };

    if (!content) {
        throw new ApiError(400, "Content is required")
    };

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not the owner of this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content: content.trim() },
        { new: true }
    )

    if (!updatedTweet) {
        throw new ApiError(500, "Failed to update tweet")
    }

    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // get tweetId from req.params
    // validate tweetId
    // check if the tweet exists and belongs to the req.user._id as ownqer
    // delete the tweet document from database

    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    };

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not the owner of this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}