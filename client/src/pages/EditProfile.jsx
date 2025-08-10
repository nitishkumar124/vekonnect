// client/src/pages/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { updateUserProfile } from '../services/userApi.js';

const EditProfile = () => {
    const { user: currentUser, login, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState(null); // File object for new picture
    const [profilePicturePreview, setProfilePicturePreview] = useState(null); // URL for preview
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Populate form fields with current user data on component mount
    useEffect(() => {
        if (currentUser && !authLoading) {
            setUsername(currentUser.username || '');
            setEmail(currentUser.email || '');
            setBio(currentUser.bio || '');
            setProfilePicturePreview(currentUser.profilePicture || null);
        }
    }, [currentUser, authLoading]);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (profilePicturePreview && profilePicture instanceof File) {
                URL.revokeObjectURL(profilePicturePreview);
            }
        };
    }, [profilePicture, profilePicturePreview]);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (profilePicturePreview && profilePicture instanceof File) {
                URL.revokeObjectURL(profilePicturePreview);
            }
            setProfilePicture(file);
            setProfilePicturePreview(URL.createObjectURL(file));
            setError(null);
        } else {
            setProfilePicture(null);
            if (profilePicturePreview && profilePicture instanceof File) {
                URL.revokeObjectURL(profilePicturePreview);
            }
            // Revert preview to current user's profile picture if input cleared
            setProfilePicturePreview(currentUser.profilePicture || null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Create payload with only changed fields
        const updatedData = {};
        if (username !== currentUser.username) updatedData.username = username;
        if (email !== currentUser.email) updatedData.email = email;
        if (bio !== currentUser.bio) updatedData.bio = bio;
        if (profilePicture) updatedData.profilePicture = profilePicture; // This is the File object

        // No changes, just return
        if (Object.keys(updatedData).length === 0) {
            setSuccessMessage('No changes to save!');
            setLoading(false);
            return;
        }

        try {
            const response = await updateUserProfile(updatedData);
            console.log('Profile updated:', response);
            setSuccessMessage(response.message || 'Profile updated successfully!');
            
            // IMPORTANT: Update AuthContext's user state with the new data
            login(response.data.user, localStorage.getItem('token')); 

            // If profile picture was uploaded, update the preview with the new URL from response
            if (response.data.user.profilePicture && profilePicture) {
                setProfilePicturePreview(response.data.user.profilePicture);
            }
            setProfilePicture(null); // Clear the file input state, important after successful upload

        } catch (err) {
            console.error('Failed to update profile:', err);
            setError(err.message || 'Failed to update profile.');
            if (err.errors && Array.isArray(err.errors)) {
                setError(err.errors.map(e => e.message).join(', '));
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="text-center text-lg mt-12 text-gray-700">Loading user data...</div>;
    }

    if (!currentUser) {
        return <div className="text-red-500 text-center text-lg mt-12">You must be logged in to edit your profile.</div>;
    }

    return (
        <div className="flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Profile</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="mb-6 flex flex-col items-center">
                        <img
                            src={profilePicturePreview || currentUser.profilePicture || 'https://via.placeholder.com/100'}
                            alt="Profile Preview"
                            className="w-28 h-28 rounded-full object-cover mb-4 border-2 border-gray-300"
                        />
                        <label htmlFor="profilePicture" className="text-blue-500 cursor-pointer font-bold text-sm hover:underline">
                            Change Profile Photo
                        </label>
                        <input
                            type="file"
                            id="profilePicture"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <div className="flex flex-col items-start">
                        <label htmlFor="username" className="mb-1 font-bold text-gray-700 text-sm">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="flex flex-col items-start">
                        <label htmlFor="email" className="mb-1 font-bold text-gray-700 text-sm">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-base focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="flex flex-col items-start">
                        <label htmlFor="bio" className="mb-1 font-bold text-gray-700 text-sm">Bio:</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-base resize-y min-h-[80px] focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            maxLength="150"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 bg-blue-500 text-white rounded-md text-base font-bold cursor-pointer transition-colors duration-300 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="p-3 bg-gray-200 text-gray-800 border border-gray-300 rounded-md text-base font-bold cursor-pointer transition-colors duration-300 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
