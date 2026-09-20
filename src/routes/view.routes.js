import { Router } from 'express';
import {addView} from "../controllers/view.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/v/:videoId").post(addView);

export default router