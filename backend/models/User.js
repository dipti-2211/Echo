import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email',
            ],
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Allows multiple null values
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Method to hide sensitive data
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.__v;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;
