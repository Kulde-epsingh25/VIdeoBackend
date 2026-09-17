import {v2 as cloudinary} from "cloudinary"; 
import fs from "fs";

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!fs.existsSync(localFilePath)) {
            throw new Error(`File not found: ${localFilePath}`);
        }
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect the file type (image, video, etc.)
        });
        fs.unlinkSync(localFilePath); // Delete the local file after successful upload
        // console.log("Cloudinary Upload Response:", response);
        return response; // Return the secure URL of the uploaded file

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        // Delete the local file in case of upload failure
        fs.unlinkSync(localFilePath);
        throw error;
    }
}

export { uploadToCloudinary };