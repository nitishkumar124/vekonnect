import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, followUnfollowUser } from '../services/userApi';
import { useAuth } from '../context/AuthContext';
// PostCard is not directly used for displaying the grid of posts, but could be for single post views later.
// import PostCard from '../components/PostCard';

const UserProfile = () => {
    const { id } = useParams(); // ID of the user whose profile is being viewed
    const { user: currentUser, loading: authLoading, login: updateAuthUser } = useAuth(); // Logged-in user and context updater
    const [profileUser, setProfileUser] = useState(null); // User whose profile is being viewed
    const [profilePosts, setProfilePosts] = useState([]); // Posts of the user being viewed
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false); // Is current user following this profile?
    const [followLoading, setFollowLoading] = useState(false); // Loading for follow/unfollow action

    // Check if the current user is viewing their own profile
    const isOwner = currentUser && profileUser && currentUser._id === profileUser._id;

    useEffect(() => {
        const fetchProfile = async () => {
            if (authLoading) return;

            setLoading(true);
            setError(null);
            try {
                const response = await getUserProfile(id);
                setProfileUser(response.data.user);
                setProfilePosts(response.data.posts);

                // Set initial following status
                if (currentUser && (response.data.user.followers || []).includes(currentUser._id)) {
                    setIsFollowing(true);
                } else {
                    setIsFollowing(false);
                }

            } catch (err) {
                console.error('Failed to fetch user profile:', err);
                setError(err.message || 'Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, authLoading, currentUser]);


    const handleFollowUnfollow = async () => {
        if (!currentUser || followLoading || isOwner) return;

        setFollowLoading(true);
        setError(null);

        const previousIsFollowing = isFollowing;
        const previousProfileUserFollowers = (profileUser.followers || []).length;
        const previousCurrentUserFollowing = (currentUser.following || []).length;

        setIsFollowing(!isFollowing);
        setProfileUser(prev => ({
            ...prev,
            followers: isFollowing
                ? (prev.followers || []).filter(fId => fId !== currentUser._id)
                : [...(prev.followers || []), currentUser._id]
        }));
        
        const updatedCurrentUserFollowingArray = isFollowing
            ? (currentUser.following || []).filter(fId => fId !== profileUser._id)
            : [...(currentUser.following || []), profileUser._id];

        const updatedCurrentUser = {
            ...currentUser,
            following: updatedCurrentUserFollowingArray
        };
        updateAuthUser(updatedCurrentUser, localStorage.getItem('token'));


        try {
            const response = await followUnfollowUser(profileUser._id);
            setProfileUser(prev => ({
                ...prev,
                followers: response.data.userToFollowFollowersCount || 0
            }));

            updateAuthUser(
                { ...currentUser, following: response.data.currentUserFollowingCount || 0 },
                localStorage.getItem('token')
            );


        } catch (err) {
            console.error('Failed to follow/unfollow:', err);
            setError(err.message || 'Failed to perform action.');
            // Revert optimistic update on error
            setIsFollowing(previousIsFollowing);
            setProfileUser(prev => ({ ...prev, followers: previousProfileUserFollowers }));
            updateAuthUser(
                { ...currentUser, following: previousCurrentUserFollowing },
                localStorage.getItem('token')
            );
        } finally {
            setFollowLoading(false);
        }
    };


    if (loading || authLoading) {
        return <div className="text-center text-lg mt-12 text-gray-700">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center text-lg mt-12">{error}</div>;
    }

    if (!profileUser) {
        return <div className="text-red-500 text-center text-lg mt-12">Profile not found.</div>;
    }

    return (
        // SIMPLIFIED OUTER DIV STYLING
        <div className="bg-white shadow-lg rounded-lg p-5"> {/* Removed max-w, mx-auto, my-5 */}
            <div className="flex flex-wrap items-center justify-center pb-8 border-b border-gray-200 mb-8 text-center md:text-left">
                <img
                    src={profileUser.profilePicture || 'https://via.placeholder.com/150'}
                    alt={profileUser.username}
                    className="w-36 h-36 rounded-full object-cover mr-12 border-2 border-gray-300 flex-shrink-0 mb-5 md:mb-0"
                />
                <div className="flex-grow flex flex-col items-center md:items-start">
                    <h2 className="text-4xl font-light mb-2 text-gray-800">{profileUser.username}</h2>
                    {profileUser.bio && <p className="text-base mb-4 text-gray-700">{profileUser.bio}</p>}
                    <div className="flex gap-8 mb-5 text-base text-gray-800">
                        <span><strong>{profilePosts.length}</strong> posts</span>
                        <span><strong>{(profileUser.followers || []).length}</strong> followers</span>
                        <span><strong>{(profileUser.following || []).length}</strong> following</span>
                    </div>
                    {isOwner ? (
                        <Link to="/edit-profile" className="px-4 py-2 bg-gray-200 text-gray-800 border border-gray-300 rounded-md font-bold text-sm transition-colors duration-200 hover:bg-gray-300">
                            Edit Profile
                        </Link>
                    ) : (
                        <button
                            onClick={handleFollowUnfollow}
                            className={`px-4 py-2 rounded-md font-bold text-sm mt-2 transition-colors duration-200 cursor-pointer ${isFollowing ? 'bg-gray-200 text-gray-800 border border-gray-300 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            disabled={followLoading}
                        >
                            {followLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-7 md:grid-cols-2 sm:grid-cols-1">
                {profilePosts.length === 0 ? (
                    <p className="text-center w-full text-gray-600 mt-8 text-lg">{isOwner ? "You haven't posted anything yet." : `${profileUser.username} hasn't posted anything yet.`}</p>
                ) : (
                    profilePosts.map((post) => (
                         <div key={post._id} className="relative pb-full overflow-hidden bg-gray-200 rounded-md shadow-sm group">
                <img
                    src={post.imageUrl}
                    alt="Post"
                    // ADD 'block' and 'object-cover' explicitly, ensure z-index to be visible
                    className="object-cover w-full h-50 group-hover:scale-105 transition-transform duration-300" // <--- UPDATED CLASS HERE
                />
            </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserProfile;