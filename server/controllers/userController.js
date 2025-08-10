import User from "../models/User.js";
import Post from "../models/Post.js"; // To fetch user's posts
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinaryConfig.js"; // For profile picture update
// Note: We don't directly import 'upload' middleware here, it's used in routes

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private (accessible to all authenticated users)
export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Fetch user details, excluding the password
  const user = await User.findById(userId).select("-password").lean(); // Convert to plain JS object for easier handling

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Fetch posts created by this specific user
  const userPosts = await Post.find({ userId: userId })
    .sort({ createdAt: -1 }) // Sort by most recent first
    .populate("userId", "username profilePicture") // Populate for consistency (though it's the current user)
    .lean();

  res.status(200).json({
    success: true,
    message: "User profile and posts fetched successfully",
    data: {
      user: user,
      posts: userPosts, // Include user's posts in the response
    },
  });
});

// @desc    Update user profile (for the logged-in user only)
// @route   PUT /api/users/profile
// @access  Private (only accessible by the owner of the profile)
export const updateUserProfile = asyncHandler(async (req, res) => {
  // req.user is populated by the 'protect' middleware, which holds the logged-in user's data
  const userId = req.user._id;
  const { username, bio, email } = req.body; // Data from the form
  const file = req.file; // The profile picture file (if uploaded) from Multer

  const user = await User.findById(userId); // Fetch the user document

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update username if provided and not taken by another user
  if (username) {
    const usernameExists = await User.findOne({ username, _id: { $ne: userId } }); // Check if username taken by anyone else
    if (usernameExists) {
      res.status(400);
      throw new Error("Username already taken");
    }
    user.username = username;
  }

  // Update email if provided and not taken by another user
  if (email) {
    const emailExists = await User.findOne({ email, _id: { $ne: userId } }); // Check if email taken by anyone else
    if (emailExists) {
      res.status(400);
      throw new Error("Email already taken");
    }
    user.email = email;
  }

  // Update bio (allow it to be an empty string)
  if (bio !== undefined) {
    user.bio = bio;
  }

  // Handle profile picture upload if a new file is provided
  if (file) {
    let profilePictureUrl;
    try {
      // Convert file buffer to data URI for Cloudinary upload
      const b64 = Buffer.from(file.buffer).toString("base64");
      const dataUri = `data:${file.mimetype};base64,${b64}`;

      const cloudinaryResponse = await cloudinary.uploader.upload(dataUri, {
        folder: "instagram-clone/profile_pics", // Store profile pictures in a specific folder
        public_id: `${userId}_${Date.now()}`, // Generate a unique public ID
      });
      profilePictureUrl = cloudinaryResponse.secure_url; // Get the secure URL

      user.profilePicture = profilePictureUrl; // Update the user's profilePicture field
    } catch (cloudinaryError) {
      console.error(
        "Cloudinary profile picture upload error:",
        cloudinaryError
      );
      res.status(500);
      throw new Error("Profile picture upload failed. Please try again.");
    }
  }

  await user.save(); // Save the updated user document to MongoDB

  // Return the updated user data (excluding sensitive information like password)
  res.status(200).json({
    success: true,
    message: "Profile updated successfully!",
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
      },
    },
  });
});

// @desc    Follow or Unfollow a user
// @route   PUT /api/users/:id/follow
// @access  Private
export const followUnfollowUser = asyncHandler(async (req, res) => {
  const userToFollowId = req.params.id; // The ID of the user to be followed/unfollowed
  const currentUserId = req.user._id; // The ID of the logged-in user

  // Prevent a user from following themselves
  if (userToFollowId.toString() === currentUserId.toString()) {
    res.status(400);
    throw new Error("You cannot follow or unfollow yourself");
  }

  const userToFollow = await User.findById(userToFollowId);
  const currentUser = await User.findById(currentUserId);

  if (!userToFollow || !currentUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const isFollowing = currentUser.following.includes(userToFollowId);

  if (isFollowing) {
    // Unfollow logic
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToFollowId.toString()
    );
    userToFollow.followers = userToFollow.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );
    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: `Successfully unfollowed ${userToFollow.username}`,
      data: {
        userToFollowId: userToFollow._id,
        currentUserId: currentUser._id,
        isFollowing: false,
        userToFollowFollowersCount: userToFollow.followers.length,
        currentUserFollowingCount: currentUser.following.length,
      },
    });
  } else {
    // Follow logic
    currentUser.following.push(userToFollowId);
    userToFollow.followers.push(currentUserId);
    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: `Successfully followed ${userToFollow.username}`,
      data: {
        userToFollowId: userToFollow._id,
        currentUserId: currentUser._id,
        isFollowing: true,
        userToFollowFollowersCount: userToFollow.followers.length,
        currentUserFollowingCount: currentUser.following.length,
      },
    });
  }
});
 // Export all functions
