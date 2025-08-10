// client/src/pages/CreatePost.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../services/postApi';
import { useAuth } from '../context/AuthContext'; // Keeping this import though 'user' is not currently used in render

const CreatePost = () => {
    const [image, setImage] = useState(null); // Stores the File object
    const [imagePreview, setImagePreview] = useState(null); // Stores the URL for image preview
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    // const { user } = useAuth(); // User data from context, not directly used in render here but might be useful later

    // Clean up the image preview URL when component unmounts or image changes
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]); // Re-run if imagePreview changes

    const handleImageChange = (e) => {
        const file = e.target.files[0]; // Get the first selected file
        if (file) {
            // Revoke old URL if exists to prevent memory leaks
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file)); // Create new URL for preview
            setError(null); // Clear errors when a new file is selected
        } else {
            setImage(null);
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!image) {
            setError('Please select an image to upload.');
            setLoading(false);
            return;
        }

        try {
            const postData = { image, caption };
            const response = await createPost(postData);
            console.log('Post created successfully:', response);

            // Reset form fields
            setImage(null);
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
            setCaption('');

            // Navigate to home or display a success message
            navigate('/'); // Go back to home page after successful post

        } catch (err) {
            console.error('Post creation failed:', err);
            setError(err.message || 'Failed to create post. Please try again.');
            if (err.errors && Array.isArray(err.errors)) {
                setError(err.errors.map(e => e.message).join(', '));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg text-center">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create New Post</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className="block w-full text-sm text-gray-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-md file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-blue-50 file:text-blue-700
                                   hover:file:bg-blue-100 cursor-pointer"
                    />
                    {imagePreview && (
                        <div className="mt-2 mb-4 border border-gray-200 rounded-md overflow-hidden flex justify-center items-center max-h-72">
                            <img src={imagePreview} alt="Image Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                    )}
                    <textarea
                        name="caption"
                        placeholder="Write a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md text-base resize-y min-h-[80px] focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                        maxLength="2200"
                    ></textarea>
                    <button
                        type="submit"
                        disabled={loading || !image}
                        className="p-3 bg-blue-500 text-white rounded-md text-base font-bold cursor-pointer transition-colors duration-300 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;