import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError } from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadToCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
   //get user data from frontend
   // validate user data - check if all required fields are present and valid
   // check if user already exists in the database
   // check images and avatar
   //upload files to cloudinary 
  // create a user object - create entry in the database
  //remove password and refreshToken from response
  //cehck if user is created successfully 
  //return response 
 
  const {fullName, username, email, password} = req.body ;
 if(
    [fullName, username, email, password].some(field => field?.trim() === "")
 ){
    throw new ApiError(400, "All fields are required");
 };

const existingUser = await User.findOne({$or: [{email}, {username}]}); // check if user already exists in the database
 if(existingUser){
    throw new ApiError(409, "User already exists");
 };
console.log("req.files:", req.files); // Log the entire req.files object to see its structure
const avatarLocalPath =   req.files?.avatar[0]?.path  // using multer middleware to get the path of the uploaded avatar file
//  const coverImageLocalPath = req.files?.coverImage[0]?.path; 
// we will get error here if coverImage is not uploaded, so we will check if coverImage is present before accessing its path

let coverImageLocalPath ;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
};

// console.log("Avatar Local Path:", avatarLocalPath); 
if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required");
};

const avatar = await uploadToCloudinary(avatarLocalPath);
const coverImage = coverImageLocalPath ? await uploadToCloudinary(coverImageLocalPath) : null;

// console.log("Avatar Cloudinary Response:", avatar);
if(!avatar){
    throw new ApiError(500, "Failed to upload avatar");
};

const newUser = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url
});
const createdUser = await User.findById(newUser._id).select("-password -refreshToken"); // remove password and refreshToken from response

if(!createdUser){
    throw new ApiError(500, "Failed to create user");
}

return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
);



});







export {registerUser};