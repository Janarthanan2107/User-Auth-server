import express from "express";
// import { login, logout, register } from "../controller/userAuth.Controller.js";
import USER from "../models/userAuth.Models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const authRouter = express.Router()

authRouter.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // check user is existing
        const existingUsername = await USER.findOne({ username })
        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken!" })
        }

        const existingEmail = await USER.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ message: "Email already Exist!" })
        }

        // hide password (or) hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt);

        // create user
        await new USER({ username, email, password: hashPassword }).save()
            .then((user) => {
                return res.status(201).json({
                    success: true, message: `Registration successfully`
                })
            })
            .catch((error) => {
                res.status(400).json({
                    success: false, message: `${error}`
                })
            });
    } catch (error) {
        // catch error and send as json
        res.status(500).json({
            success: false, message: "Internal Server Error!"
        })
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const user = await USER.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(req.body.password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.SECRET,
            { expiresIn: "3d" }
        );

        console.log("Token:", token)

        // Set JWT token in a secure, HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        });

        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ message: err.message }); // Handle error more gracefully
    }
});

authRouter.get("/logout", (req, res) => {
    try {
        res.clearCookie("token", {
            sameSite: "none",
            secure: true,
        }).json({ message: "User Logged out successfully!!" })
    } catch (error) {
        // catch error and send as json
        res.status(500).json({
            success: false, message: `Something went wrong ! error is : ${error}`
        })
    }
})

// Refetch User
authRouter.get("/refetch", authenticateToken, (req, res) => {
    res.status(200).json(req.user); // req.user contains user data from JWT payload
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        }
        req.user = user;
        next();
    });
}
export default authRouter