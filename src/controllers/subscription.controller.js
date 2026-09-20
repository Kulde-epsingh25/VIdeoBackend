import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    // check if the channelId is valid 
    // check if the channelId is not same as the userId of the logged in user
    // check if the channelId exists in the User database
    // find channelId in the Subscription collection with subscriber as logged in user and channel as channelId
    // toggle the subscription status, if it exists then delete it, if it doesn't exist then create a new subscription document
    // return the response with status 200 and the subscription status (subscribed or unsubscribed)

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }; //isValidObjectId is a mongoose method to check if the id is valid or not 

    if(channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    };

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    };

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        const newSubscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
        if (!newSubscription) {
            throw new ApiError(500, "Failed to subscribe");
        };
        return res.status(200).json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
    }


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }
    const subscribers = await Subscription.find({
        channel: channelId
    }).populate("subscriber", "username fullName avatar");

    if (subscribers.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No subscribers found")
        );
    }
    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }
    const subscribedChannels = await Subscription.find({ subscriber: subscriberId });
    if (subscribedChannels.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No subscribed channels found for this user")
        );
    }
    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}