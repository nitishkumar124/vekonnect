// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { registerUser } from '../services/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom'; // Import Link here

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Stores error message from backend
    const { login } = useAuth(); // Get login function from AuthContext
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await registerUser(formData);
            login(response.data.user, response.data.token);
            navigate('/'); // Redirect to home/feed on success
        } catch (err) {
            console.error('Registration failed:', err);
            // 'err' here is the error object thrown by authApi (e.g., { success: false, message: '...', errors: [...] })
            if (err.errors && Array.isArray(err.errors)) {
                // If backend sent validation errors
                setError(err.errors.join(', '));
            } else {
                setError(err.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Register</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mb-5">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="p-3 border border-gray-300 rounded-md text-base focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="p-3 border border-gray-300 rounded-md text-base focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="p-3 border border-gray-300 rounded-md text-base focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 bg-blue-500 text-white rounded-md text-base font-bold cursor-pointer transition-colors duration-300 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 font-bold cursor-pointer hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
