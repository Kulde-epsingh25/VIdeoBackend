import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadToCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body || {};
    if([title, description].some(field => field?.trim() === "")){
        throw new ApiError(400, "Title and description are required");
    }

    // TODO: get video, upload to cloudinary, create video
    // get video file and thumbnail from req.files form multer middleware as localPath
    // upload video file and thumbnail to cloudinary using uploadOnCloudinary function
    // create video document in database with title, description, videoFile, thumbnail, owner  ,duration
    // return response with status 201 and video document

    let videoFileLocalPath, thumbnailLocalPath;
    if(req.files && req.files.videoFile && req.files.videoFile[0]){
        videoFileLocalPath = req.files.videoFile[0].path
    }
    if(req.files && req.files.thumbnail && req.files.thumbnail[0]){
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if(!videoFileLocalPath ){
        throw new ApiError(400, "Video file is required");
    }


    const videoUploadResult = await uploadToCloudinary(videoFileLocalPath,`${req.user.username}/video`); // Upload video file to Cloudinary in video folder like username is john, the video will be uploaded to john/video/video.mp4
    const thumbnailUploadResult = thumbnailLocalPath ? await uploadToCloudinary(thumbnailLocalPath, `${req.user.username}/thumbnail`) : null;
 // req is attached with user object from verifyJWT middleware, so we can get the username from req.user.username

    console.log("Video Upload Result:", videoUploadResult);
    if(!videoUploadResult){
        throw new ApiError(500, "Failed to upload video");
    }

    if(thumbnailUploadResult && !thumbnailUploadResult.url){
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoUploadResult.url,
        duration: videoUploadResult.duration,
        thumbnail: thumbnailUploadResult?.url,
        owner: req.user._id
    });

    const publishedVideo = await Video.findOne({ _id: video._id });

    if(!publishedVideo){
        throw new ApiError(500, "Failed to publish video");
    }

    return res.status(201).json(new ApiResponse(201, publishedVideo, "Video published successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}