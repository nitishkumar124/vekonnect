import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config(); // Ensure dotenv is loaded here too if this file is imported standalone

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true, // Use HTTPS
});

export default cloudinary;
