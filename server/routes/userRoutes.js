import { Router } from "express";
const router = Router();
import {
  getUserProfile,
  updateUserProfile,
  followUnfollowUser,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private (requires authentication)
router.get("/:id", protect, getUserProfile); // Any authenticated user can view other profiles

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private (only the logged-in user can update their own profile)
router.put("/profile", protect, upload.single("profilePicture"), updateUserProfile); // 'profilePicture' is the expected field name in the form data

// @route   PUT /api/users/:id/follow
// @desc    Follow or Unfollow a user
// @access  Private
router.put("/:id/follow", protect, followUnfollowUser); // <--- ADD THIS NEW ROUTE

export default router;
