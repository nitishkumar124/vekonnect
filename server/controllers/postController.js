import Post from "../models/Post.js";
import cloudinary from "../config/cloudinaryConfig.js";
import asyncHandler from "express-async-handler";

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body; // Caption comes from form field
  // File data is available in req.file due to multer middleware
  const file = req.file;

  if (!file) {
    res.status(400);
    throw new Error("Please upload an image for the post");
  }

  // Upload image to Cloudinary
  let imageUrl;
  try {
    // The file buffer is available at req.file.buffer
    // We convert it to a data URI for Cloudinary upload
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataUri = `data:${file.mimetype};base64,${b64}`;

    const cloudinaryResponse = await cloudinary.uploader.upload(dataUri, {
      folder: "instagram-clone/posts", // Optional: organize uploads in a folder
      public_id: `${req.user._id}_${Date.now()}`, // Optional: unique public ID
    });
    imageUrl = cloudinaryResponse.secure_url; // Use secure URL (HTTPS)
  } catch (cloudinaryError) {
    console.error("Cloudinary upload error:", cloudinaryError);
    res.status(500);
    throw new Error("Image upload failed. Please try again.");
  }

  // Create post in MongoDB
  const post = await Post.create({
    userId: req.user._id, // req.user is set by your 'protect' middleware
    imageUrl,
    caption: caption || "", // Caption can be optional
  });

  // Respond with the created post (you might want to populate user details later)
  res.status(201).json({
    success: true,
    message: "Post created successfully!",
    data: {
      post: {
        _id: post._id,
        userId: post.userId,
        imageUrl: post.imageUrl,
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
        createdAt: post.createdAt,
      },
    },
  });
});

// @desc    Get all posts for the feed (or from followed users later)
// @route   GET /api/posts
// @access  Private
export const getFeedPosts = asyncHandler(async (req, res) => {
  // For now, fetch all posts. Later, we'll filter by followed users.
  console.log(req.user.username);

  const posts = await Post.find({})
    .sort({ createdAt: -1 }) // Sort by most recent first
    .populate("userId", "username profilePicture") // Populate user info
    .lean(); // Convert Mongoose documents to plain JS objects

  res.status(200).json({
    success: true,
    message: "Posts fetched successfully",
    data: {
      posts: posts,
    },
  });
});

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likeUnlikePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id; // User ID from the authenticated token

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    // Unlike the post
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    await post.save();
    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
      data: {
        postId: post._id,
        likes: post.likes.length,
        isLiked: false,
        updatedLikes: post.likes, // Send back the updated array
      },
    });
  } else {
    // Like the post
    post.likes.push(userId);
    await post.save();
    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      data: {
        postId: post._id,
        likes: post.likes.length,
        isLiked: true,
        updatedLikes: post.likes, // Send back the updated array
      },
    });
  }
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  const { _id: userId, username } = req.user;

  if (!text || text.trim() === "") {
    res.status(400);
    throw new Error("Comment text cannot be empty");
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const newComment = {
    userId,
    username,
    text,
    createdAt: new Date(),
  };

  post.comments.push(newComment);
  await post.save();

  const updatedPost = await Post.findById(postId);
  const returnedComments = updatedPost.comments;

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: {
      postId: post._id,
      comment: returnedComments[returnedComments.length - 1],
      allComments: returnedComments,
    },
  });
});
