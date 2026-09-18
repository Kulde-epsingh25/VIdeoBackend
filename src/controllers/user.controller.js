import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError } from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadToCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User not found");
        }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); // save the refresh token to the database without validating other fields
        return {accessToken, refreshToken};

    } catch(error){
        throw new ApiError(500, "Failed to generate tokens", [error.message]);
    }
};

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

const loginUser = asyncHandler(async (req, res) => {
    // req.body -> {email or username, password}
    // find user by email or username
    // validate password
    // generate access token and refresh token
    // send cookie


    const {email, username, password} = req.body;
    if(!password || (!email && !username)){
        throw new ApiError(400, "Email or username and password are required");
    }
    const user = await User.findOne({$or: [{email: email?.toLowerCase()}, {username: username?.toLowerCase()}]
    });

    if(!user){
        throw new ApiError(404, "User not found");
    };

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid password");
    };

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedUser = await User.findByIdAndUpdate(user._id).select("-password -refreshToken"); // remove password and refreshToken from response

    if(!loggedUser){
        throw new ApiError(500, "Failed to login user");
    }

    const cookieOptions = {
        httpOnly: true,
        // secure: true // only send cookie over HTTPS

    };
    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(
        200, 
        {
            user: loggedUser,
            accessToken,
            refreshToken
        },
         "User logged in successfully" ,
        ));
    });


const logoutUser = asyncHandler(async (req, res) => {
    // get user from req.user as we have a middleware to verify JWT and attach user to req.user
    // remove refresh token from database
    // clear cookies
    // send response    

    const user = User.findByIdAndUpdate(req.user._id, 
        {
            $set: {refreshToken: undefined}
        },
        {new: true });
        

        const cookieOptions = {
            httpOnly: true,
            secure: true
        };

        return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "User logged out successfully"));
    });



const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from cookies
    // verify refresh token
    // generate new access token
    // send new access token in response
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh token is required");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }
        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(401, "Refresh token does not match");
        };
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
        const cookieOptions = {
            httpOnly: true,
            // secure: true // only send cookie over HTTPS
        };
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(new ApiResponse(200, {accessToken}, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(401, "Failed to refresh access token", error.message);
    }
});



export {registerUser , loginUser , refreshAccessToken , logoutUser};