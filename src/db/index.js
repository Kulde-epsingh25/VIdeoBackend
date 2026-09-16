import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Database have asynchronous nature so we need to handle it properly. We can use async/await  or promises/try...catch to handle the asynchronous nature of database operations. 
const connectToDatabase = async () => {
    try{
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log("MongoDB connected successfully  !! DB HOSt:" + connection.connection.host + " DB Name: " + connection.connection.name);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with an error code
    }
}
export default connectToDatabase;