// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { loginUser } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Import Link here

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await loginUser(formData);
            login(response.data.user, response.data.token);
            navigate('/'); // Redirect to home/feed on success
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mb-5">
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
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-500 font-bold cursor-pointer hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;