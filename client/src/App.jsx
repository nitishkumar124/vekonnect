import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import CreatePost from './pages/CreatePost';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';

// No direct import of Header or Sidebar here, Layout handles it
import Layout from './components/Layout'; // <--- KEEP THIS IMPORT

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-lg text-gray-700">Loading application...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes that don't need the full header/layout */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected routes that use the common Layout */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Home />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/create-post"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <CreatePost />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile/:id"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <UserProfile />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/edit-profile"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <EditProfile />
                                </Layout>
                            </PrivateRoute>
                        }
                    />

                    {/* Catch-all for undefined routes */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;