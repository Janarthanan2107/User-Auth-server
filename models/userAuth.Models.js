import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            trim: true,
            required: true,
            minLength: [8, "Username should contain at least 8 characters"]
        },
        email: {
            type: String,
            trim: true,
            required: true,
            minLength: [5, "Content must be of at least 5 characters"],
        },
        password: {
            type: String,
            required: true,
        },
        admin: {
            type: Boolean,
        },
    },
    {
        timestamps: true,
    }
);

const USER = mongoose.model("user", userSchema)

export default USER;