import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})); // cors(cross-origin resource sharing) is a mechanism that allows restricted resources on a web page to be requested from another domain outside the domain from which the resource originated.

app.use(express.json({limit: "16kb"})); 
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // Serve static files from the "public" directory

app.use(cookieParser()); // Parse cookies attached to the client request object

export { app }; 