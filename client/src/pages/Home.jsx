import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { getFeedPosts } from '../services/postApi.js';
import PostCard from '../components/PostCard.jsx';

const Home = () => {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState(null);
    const navigate = useNavigate();

    // Loading state is now mostly handled by PrivateRoute
    if (loading) {
        return <div className="text-center mt-10">Loading authentication...</div>;
    }

    useEffect(() => {
        const fetchPosts = async () => {
            if (!isAuthenticated) {
                setPostsLoading(false);
                return;
            }
            setPostsLoading(true);
            setPostsError(null);
            try {
                const response = await getFeedPosts();
                setPosts(response.data.posts);
            } catch (err) {
                console.error('Failed to fetch posts:', err);
                setPostsError(err.message || 'Failed to load posts.');
            } finally {
                setPostsLoading(false);
            }
        };
        fetchPosts();
    }, [isAuthenticated]);

    // Note: Logout button is now in Sidebar, so this function is just for logic.
    // It's technically okay to remove handleLogout if only Sidebar uses it.

    return (
        <div className="flex flex-col items-center justify-center"> {/* Simplified container, centered */}
            {/* No separate header here, Layout provides it */}

            {isAuthenticated ? (
                <div className="w-full"> {/* Content takes full width of its container */}
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Your Feed</h2>
                    {postsLoading ? (
                        <p className="text-center text-gray-600">Loading posts...</p>
                    ) : postsError ? (
                        <p className="text-red-500 text-center">{postsError}</p>
                    ) : posts.length === 0 ? (
                        <p className="text-center text-gray-600">No posts yet. Be the first to create one!</p>
                    ) : (
                        <div className="flex flex-col items-center space-y-12"> {/* Vertically stack posts with spacing */}
                            {posts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center text-gray-600 mt-10">
                    <p>Please log in or register to see the content.</p>
                    <div className="flex justify-center space-x-4 mt-4">
                        <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Login</Link>
                        <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">Register</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

// Remove the 'homeStyles' object entirely, as all styles are now Tailwind classes
// const homeStyles = { ... };

export default Home;
