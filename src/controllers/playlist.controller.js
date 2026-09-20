import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    // check if name is provided , description is optional
    // create a new playlist document with the name, description, and owner id
    // save the playlist document to the database
    // return the response with status 201 and the created playlist document

    if(!name || name.trim() === ""){
        throw new ApiError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner: req.user._id
    });

    if(!playlist){
        throw new ApiError(500, "Failed to create playlist");
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    // check if userId is valid
    // find all playlists with the owner id as userId
    // return the response with status 200 and the found playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({owner: userId});

    return res.status(200).json(new ApiResponse(200, playlists, playlists.length > 0 ? "User playlists fetched successfully" : "No playlists found for this user"));

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    // check if playlistId is valid
    // find the playlist with the given id
    // return the response with status 200 and the found playlist

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"));

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: add video to playlist
    // check if playlistId and videoId are valid
    // find the playlist with the given id
    // check if the video is already in the playlist
    // add the video to the playlist's videos array
    // save the playlist document to the database
    // return the response with status 200 and the updated playlist document

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    
    const videoExists = await Video.findById(videoId);

    if(!videoExists){
        throw new ApiError(404, "Video not found");
    }

    // Check if the video is already in the playlist
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    // check if playlistId and videoId are valid
    // find the playlist with the given id
    // check if the video is in the playlist
    // remove the video from the playlist's videos array
    // save the playlist document to the database
    // return the response with status 200 and the updated playlist document

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    const videoExists = await Video.findById(videoId);

    if(!videoExists){
        throw new ApiError(404, "Video not found");
    }

    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video not in playlist");
    }

    playlist.videos.pull(videoId);
    await playlist.save();
    
    return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    // check if playlistId is valid
    // find the playlist with the given id
    // delete the playlist document from the database
    // return the response with status 200 and a success message

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    await playlist.remove();

    return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    // check if playlistId is valid
    // find the playlist with the given id
    // update the playlist document with the new name and description
    // save the playlist document to the database
    // return the response with status 200 and the updated playlist document

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }

    if(!name && !description){
        throw new ApiError(400, "Name or description is required");
    }

    playlist.name = name?.trim() || playlist.name;
    playlist.description = description?.trim() || playlist.description;

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}