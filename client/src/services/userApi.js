// client/src/services/userApi.js
import { API } from '../context/AuthContext.jsx'; // Import the configured Axios instance

// @desc    Get a user's profile by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserProfile = async (userId) => {
    try {
        const response = await API.get(`/users/${userId}`);
        // Expected response: { success, message, data: { user, posts } }
        return response.data;
    } catch (error) {
        console.error(`Error fetching user profile for ID ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || { success: false, message: error.message };
    }
};

// @desc    Update the logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (userData) => {
    // userData can be { username, bio, email, profilePicture: File }
    // Use FormData for file uploads
    const formData = new FormData();

    // Append text fields if they exist
    if (userData.username !== undefined) formData.append('username', userData.username);
    if (userData.bio !== undefined) formData.append('bio', userData.bio);
    if (userData.email !== undefined) formData.append('email', userData.email);

    // Append file if it exists
    if (userData.profilePicture instanceof File) {
        formData.append('profilePicture', userData.profilePicture); // 'profilePicture' must match backend Multer field name
    }

    try {
        const response = await API.put('/users/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Crucial for FormData uploads
            },
        });
        // Expected response: { success, message, data: { user } }
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error.response?.data || error.message);
        throw error.response?.data || { success: false, message: error.message };
    }
};

// @desc    Follow or Unfollow a user
// @route   PUT /api/users/:id/follow
// @access  Private
export const followUnfollowUser = async (userIdToFollow) => { // <--- ADD THIS NEW FUNCTION
  try {
      const response = await API.put(`/users/${userIdToFollow}/follow`);
      // Expected response: { success, message, data: { isFollowing, userToFollowFollowersCount, currentUserFollowingCount } }
      return response.data;
  } catch (error) {
      console.error(`Error following/unfollowing user ${userIdToFollow}:`, error.response?.data || error.message);
      throw error.response?.data || { success: false, message: error.message };
  }
};
