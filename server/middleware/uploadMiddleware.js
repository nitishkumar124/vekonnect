import multer, { memoryStorage } from "multer";

// Configure multer to store files in memory
const storage = memoryStorage();

// Create the upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit for files (adjust as needed)
  },
  fileFilter: (_req, file, cb) => {
    // Basic file type validation
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/gif"
    ) {
      cb(null, true); // Accept file
    } else {
      cb(
        new Error("Invalid file type, only JPEG, PNG, or GIF are allowed!"),
        false
      ); // Reject file
    }
  },
});

export default upload;
