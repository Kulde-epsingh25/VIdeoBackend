import { Router  } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
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
]) , registerUser); //http://localhost:8000/api/v1/users/register

router.post('/login', loginUser); //http://localhost:8000/api/v1/users/login
 
//secure route 

router.post('/logout', verifyJWT, logoutUser); //http://localhost:8000/api/v1/users/logout

router.post('/refresh-token', refreshAccessToken); //http://localhost:8000/api/v1/users/refresh-token

export  default  router ;