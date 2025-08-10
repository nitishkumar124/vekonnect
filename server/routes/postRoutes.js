import { Router } from "express";
const router = Router();
import {
  createPost,
  getFeedPosts,
  likeUnlikePost,
  addComment,
} from "../controllers/postController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

// @route   POST /api/posts
// @desc    Create new post (requires image upload)
// @access  Private
router.post("/", protect, upload.single("image"), createPost); // 'image' is the field name for the file in the form

// @route   GET /api/posts
// @desc    Get all posts for the feed
// @access  Private
router.get("/", protect, getFeedPosts); // <--- ADD THIS NEW ROUTE

// @route   PUT /api/posts/:id/like
// @desc    Like or Unlike a post
// @access  Private
router.put("/:id/like", protect, likeUnlikePost); // <--- ADD THIS NEW ROUTE

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post("/:id/comment", protect, addComment); // <--- ADD THIS NEW ROUTE

export default router;
