import jwt from 'jsonwebtoken';

function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d', // Defaults to 30 days if not set in .env
    });
}

export default generateToken;