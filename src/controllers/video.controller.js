import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {cloudinary,uploadToCloudinary} from "../utils/cloudinary.js"
import { Comment } from "../models/comment.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const sortOptions = {};
    if (sortBy) {
        const sortField = sortBy;
        const sortOrder = sortType === "desc" ? -1 : 1;
        sortOptions[sortField] = sortOrder;
    }

    const filterOptions = {};
    if (query) {
        filterOptions.$or = [ // or operator to search in title and description
            { title: { $regex: query, $options: "i" } }, //regex is used to search for a string in a field, i is for case insensitive search 
            { description: { $regex: query, $options: "i" } }
        ];
    }
    if(userId) {
        filterOptions.owner = userId;
    }

    const [videos, totalVideos] = await Promise.all([
        Video.find(filterOptions)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber)
            .populate("owner", "username email profilePicture")
            .exec(), // exec() is used to execute the query and return a promise
        Video.countDocuments(filterOptions)
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            { videos, totalVideos },
            "Videos fetched successfully"
        )
    );

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body || {};
    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400, "Title and description are required");
    }

    // TODO: get video, upload to cloudinary, create video
    // get video file and thumbnail from req.files form multer middleware as localPath
    // upload video file and thumbnail to cloudinary using uploadOnCloudinary function
    // create video document in database with title, description, videoFile, thumbnail, owner  ,duration
    // return response with status 201 and video document
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    let  thumbnailLocalPath;
    if(req.files && req.files.thumbnail && req.files.thumbnail[0]){
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if(!videoFileLocalPath ){
        throw new ApiError(400, "Video file is required");
    }


    const videoUploadResult = await uploadToCloudinary(videoFileLocalPath,`${req.user.username}/video`); // Upload video file to Cloudinary in video folder like username is john, the video will be uploaded to john/video/video.mp4

     if(!videoUploadResult){
        throw new ApiError(500, "Failed to upload video");
    };

    if(videoUploadResult && videoUploadResult.format !== "mp4" && videoUploadResult.format !== "mov" && videoUploadResult.format !== "avi"){ 
        throw new ApiError(400, "Video file must be in mp4, mov or avi format");
    };

    const thumbnailUploadResult = thumbnailLocalPath ? await uploadToCloudinary(thumbnailLocalPath, `${req.user.username}/thumbnail`) : null;
 // req is attached with user object from verifyJWT middleware, so we can get the username from req.user.username


    if(thumbnailUploadResult && !thumbnailUploadResult.url){
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    if(thumbnailUploadResult && thumbnailUploadResult.format !== "jpg" && thumbnailUploadResult.format !== "jpeg" && thumbnailUploadResult.format !== "png"){
        throw new ApiError(400, "Thumbnail must be in jpg, jpeg or png format");
    };
    let thumbnailUrl = null;
    if(!thumbnailUploadResult){
     thumbnailUrl = cloudinary.url(videoUploadResult.public_id, {
    resource_type: "video",
    type: "upload",
    secure: true,
    format: "jpg",
    transformation: [
        { start_offset: "auto" } // Automatically select a frame from the video
    ]
   });
    };

    const video = await Video.create({
        title: title.trim(),
        description: description.trim(),
        videoFile: videoUploadResult.url,
        duration: videoUploadResult.duration,
        thumbnail: thumbnailUploadResult?.url || thumbnailUrl,
        owner: req.user._id
    });

    const publishedVideo = await Video.findOne({ _id: video._id });

    if(!publishedVideo){
        throw new ApiError(500, "Failed to publish video");
    };

    return res.status(201).json(new ApiResponse(201, publishedVideo, "Video published successfully"));

});
    

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    // check if the video exists
    // check if the video belongs to the user
    // update the video document in database with title, description, thumbnail
    // return the response with status 200 and the updated video document

    const { title, description } = req.body || {};
    const thumbnailLocalPath = req.file?.path;

    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "Title, description, or thumbnail is required");
    }

    const updateData = {};

    if (title !== undefined) {
        if (!title.trim()) {
            throw new ApiError(400, "Title cannot be empty");
        }
        updateData.title = title.trim();
    }

    if (description !== undefined) {
        if (!description.trim()) {
            throw new ApiError(400, "Description cannot be empty");
        }
        updateData.description = description.trim();
    }

    if (thumbnailLocalPath) {
        const thumbnail = await uploadToCloudinary(
            thumbnailLocalPath,
            `${req.user.username}/thumbnail`
        );

        if (!thumbnail) {
            throw new ApiError(500, "Failed to upload thumbnail");
        }

        if (!["jpg", "jpeg", "png"].includes(thumbnail.format)) {
            throw new ApiError(400, "Thumbnail must be jpg, jpeg, or png");
        }

        updateData.thumbnail = thumbnail.secure_url;
    }

    const updatedVideo = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user._id
        },
        {
            $set: updateData
        },
        {
            returnDocument: "after"
        }
    );

    if (!updatedVideo) {
        throw new ApiError(
            404,
            "Video not found or you are not authorized to update it"
        );
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );

});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    // check if the video exists
    // check if the video belongs to the user
    // delete the video document from database
    // return the response with status 200 and the deleted video document

   const deletedVideo = await Video.findOneAndDelete(
            {
            _id: videoId,
            owner: req.user._id
        }
 );
    if (!deletedVideo) {
        throw new ApiError(404, "Video not found or you are not authorized to delete this video");
    }

    return res.status(200).json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle the publish status of the video
    //get video by id
    //check if the video exists
    // check if the video belongs to the user
    // check if the video is published or not
    // toggle the publish status of the video converting true to false and false to true
    // save the video docoment without validation
    // return the response with status 200 and the updated video document

   const toggleVideo = await Video.findOneAndUpdate(
    {
        _id: videoId,
        owner: req.user._id
    },
    [
        {
            $set: {
                isPublic: {
                    $cond: [
                        { $eq: ["$isPublic", true] }, // condition: if isPublic is true
                        false, // if true, set isPublic to false
                        true // if false, set isPublic to true
                    ]
                }
            }
        }
    ],
    {
        returnDocument: "after", // Return the updated document
        updatePipeline: true
    }
);

    if (!toggleVideo) {
        throw new ApiError(404, "Video not found or you are not authorized to update this video");
    }
    return res.status(200).json(new ApiResponse(200, toggleVideo, "Video publish status updated successfully"));
});



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}