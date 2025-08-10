// client/src/components/PostCard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { likeUnlikePost, addComment } from "../services/postApi.js";
import { Link } from "react-router-dom";

const PostCard = ({ post: initialPost }) => {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);

  const [optimisticLikes, setOptimisticLikes] = useState(
    initialPost.likes.length
  );
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(
    initialPost.likes.includes(user?._id)
  );
  const [likingLoading, setLikingLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commentingLoading, setCommentingLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPost(initialPost);
    setOptimisticLikes(initialPost.likes.length);
    setOptimisticIsLiked(initialPost.likes.includes(user?._id));
    setError(null);
  }, [initialPost, user?._id]);

  const handleLikeUnlike = async () => {
    if (!user || likingLoading) return;

    setLikingLoading(true);

    const previousIsLiked = optimisticIsLiked;
    const previousLikesCount = optimisticLikes;

    setOptimisticIsLiked(!optimisticIsLiked);
    setOptimisticLikes(
      optimisticIsLiked ? optimisticLikes - 1 : optimisticLikes + 1
    );

    try {
      const response = await likeUnlikePost(post._id);
      setPost((prevPost) => ({
        ...prevPost,
        likes: response.data.updatedLikes,
      }));
      setError(null);
    } catch (err) {
      console.error("Failed to like/unlike post:", err);
      setError(err.message || "Failed to like/unlike post.");
      setOptimisticIsLiked(previousIsLiked);
      setOptimisticLikes(previousLikesCount);
    } finally {
      setLikingLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || commentingLoading || commentText.trim() === "") {
      setError("Comment text cannot be empty.");
      return;
    }

    setCommentingLoading(true);
    setError(null);

    const originalComments = [...post.comments];

    const newOptimisticComment = {
      userId: user._id,
      username: user.username,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    setPost((prevPost) => ({
      ...prevPost,
      comments: [...prevPost.comments, newOptimisticComment],
    }));
    setCommentText("");

    try {
      const response = await addComment(post._id, commentText.trim());
      setPost((prevPost) => ({
        ...prevPost,
        comments: response.data.allComments,
      }));
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError(err.message || "Failed to add comment.");
      setPost((prevPost) => ({
        ...prevPost,
        comments: originalComments,
      }));
    } finally {
      setCommentingLoading(false);
    }
  };

  if (!post || !post.userId) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg mb-12 w-full max-w-md shadow-md">
      <div className="flex items-center p-4 border-b border-gray-200">
        {/* Make profile pic and username clickable */}
        <Link
          to={`/profile/${post.userId._id}`}
          className="flex items-center no-underline text-inherit"
        >
          <img
            src={post.userId.profilePicture || "https://via.placeholder.com/40"}
            alt={post.userId.username}
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <span className="font-bold text-gray-800">
            {post.userId.username}
          </span>
        </Link>
      </div>
      <div className="w-full bg-black">
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full block object-cover"
        />
      </div>
      <div className="flex items-center p-3 space-x-2">
        <button
          onClick={handleLikeUnlike}
          className={`bg-transparent border-none text-2xl cursor-pointer p-0 transition-colors duration-200 ${
            optimisticIsLiked ? "text-red-500" : "text-gray-800"
          } ${likingLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
          disabled={likingLoading}
        >
          {optimisticIsLiked ? "❤️" : "🤍"}
        </button>
        <button className="bg-transparent border-none text-2xl cursor-pointer p-0">
          💬
        </button>
        <span className="font-bold text-sm ml-1 text-gray-800">
          {optimisticLikes} likes
        </span>
      </div>
      <div className="px-4 pb-2 text-sm leading-tight text-gray-800">
        <span className="font-bold text-gray-800">{post.userId.username}</span>{" "}
        {post.caption}
      </div>

      {post.comments && post.comments.length > 0 && (
        <div className="px-4 pb-2 mt-1 border-t border-gray-200 pt-2">
          {post.comments.map((comment) => (
            <div key={comment.userId} className="mb-1 text-xs leading-tight">
              {/* Make comment username clickable */}
              <Link
                to={`/profile/${comment.userId}`}
                className="no-underline text-inherit"
              >
                <span className="font-bold mr-1 text-gray-800">
                  {comment?.username || "Unknown User"}
                </span>{" "}
              </Link>
              <span className="text-gray-800 break-words">{comment.text}</span>
            </div>
          ))}
        </div>
      )}
      <div className="px-4 pb-4 text-xs text-gray-500 uppercase">
        {new Date(post.createdAt).toLocaleString()}
      </div>

      <form
        onSubmit={handleCommentSubmit}
        className="flex border-t border-gray-200"
      >
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-grow border-none px-4 py-3 text-sm outline-none rounded-bl-lg"
          disabled={commentingLoading}
        />
        <button
          type="submit"
          disabled={commentingLoading || commentText.trim() === ""}
          className="bg-transparent border-none text-blue-500 font-bold text-sm px-4 py-3 cursor-pointer transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {commentingLoading ? "Adding..." : "Post"}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-sm px-4 pb-4 text-left">{error}</p>
      )}
    </div>
  );
};

export default PostCard;
