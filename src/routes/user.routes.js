import { Router  } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getUserProfile,
    updateCurrentUser,
    updateCurrentUserAvatar,
    updateCurrentUserCoverImage,
    getWatchHistory
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router();

router.post('/register',upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]) , registerUser); 

router.post('/login', loginUser);
 
//secure route 

router.post('/logout', verifyJWT, logoutUser); 

router.post('/refresh-token', refreshAccessToken); 

router.post('/change-password', verifyJWT, changeCurrentPassword); 

router.patch('/update-profile', verifyJWT, updateCurrentUser);

router.patch('/update-avatar', verifyJWT, upload.single("avatar"), updateCurrentUserAvatar);

router.patch('/update-cover-image', verifyJWT, upload.single("coverImage"), updateCurrentUserCoverImage);

router.get('/c/:username', verifyJWT, getUserProfile); // taking username as a parameter in the URL to get the user profile

router.get('/watch-history', verifyJWT, getWatchHistory);



export  default   router;