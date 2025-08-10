// client/src/services/postApi.js
import { API } from '../context/AuthContext.jsx'; // Import the configured Axios instance

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (postData) => {
    // postData should contain:
    // { image: File, caption: string }
    // Axios automatically handles 'multipart/form-data' when you send a FormData object
    // and includes a File object.

    try {
        // FormData is crucial for sending files with text data
        const formData = new FormData();
        formData.append('image', postData.image); // 'image' must match the Multer field name in backend
        formData.append('caption', postData.caption);

        const response = await API.post('/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Explicitly set content type for FormData
            },
            // You can add onUploadProgress here if you want to show upload progress bar
            // onUploadProgress: (progressEvent) => {
            //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            //     console.log(`Upload progress: ${percentCompleted}%`);
            // }
        });
        return response.data; // Returns { success, message, data: { post } }
    } catch (error) {
        console.error("Error creating post:", error.response?.data || error.message);
        throw error.response?.data || { success: false, message: error.message };
    }
};

// @desc    Get all posts for the feed
// @route   GET /api/posts
// @access  Private
export const getFeedPosts = async () => { // <--- ADD THIS NEW FUNCTION
    try {
        const response = await API.get('/posts');
        return response.data; // Returns { success, message, data: { posts: [...] } }
    } catch (error) {
        console.error("Error fetching feed posts:", error.response?.data || error.message);
        throw error.response?.data || { success: false, message: error.message };
    }
};

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likeUnlikePost = async (postId) => { // <--- ADD THIS NEW FUNCTION
    try {
        const response = await API.put(`/posts/${postId}/like`);
        return response.data; // Returns { success, message, data: { postId, likes, isLiked, updatedLikes } }
    } catch (error) {
        console.error("Error liking/unliking post:", error.response?.data || error.message);
        throw error.response?.data || { success: false, message: error.message };
    }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
export const addComment = async (postId, text) => { // <--- ADD THIS NEW FUNCTION
    try {
        const response = await API.post(`/posts/${postId}/comment`, { text });
        return response.data; // Returns { success, message, data: { postId, comment, allComments } }
    } catch (error) {
        console.error("Error adding comment:", error.response?.data || error.message);
        throw error.response?.data || { success: false, message: error.message };
    }
};
