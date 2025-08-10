// server/models/User.js
import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs'; // For password hashing

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true,
        trim: true, // Removes whitespace from both ends of a string
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        trim: true,
        lowercase: true, // Convert email to lowercase
        match: [/.+\@.+\..+/, 'Please enter a valid email address'] // Basic email regex validation
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // This ensures that the password field is not returned by default in queries
    },
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/default_profile_pic.png' // Placeholder for now, we'll replace this later
    },
    bio: {
        type: String,
        maxlength: [150, 'Bio cannot be more than 150 characters'],
        default: ''
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically

// --- Mongoose Middleware for Password Hashing ---
// This runs before saving a new user or updating a password
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Only hash if the password field is modified
        next();
    }
    const salt = await genSalt(10); // Generate a salt
    this.password = await hash(this.password, salt); // Hash the password
    next();
});

// --- Instance Method to Compare Passwords ---
// This will be available on user documents (e.g., user.matchPassword(enteredPassword))
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // 'this.password' refers to the hashed password stored in the database
    // 'enteredPassword' is the plain text password provided by the user
    return await compare(enteredPassword, this.password);
};

export default model('User', UserSchema);