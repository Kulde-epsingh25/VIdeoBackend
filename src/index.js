// require("dotenv").config({path: "./.env"}); 
import dotenv from "dotenv";
import connectToDatabase from "./db/index.js";

dotenv.config({ path: "./.env" });
connectToDatabase()















// this is the main entry point of the application. It connects to the MongoDB database and starts the Express server. The connection string is constructed using the MONGO_URI environment variable and the DB_NAME constant. If the connection is successful, the server listens on the specified PORT. Any errors during the connection or server startup are logged to the console.
/*
import express from "express";
const app = express();
(async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        app.on("error", (err) => {
            console.error("MongoDB connection error:", err);
            throw err;
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
})() */ 