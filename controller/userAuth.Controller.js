import USER from "../models/userAuth.Models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

// user auth register
export const register = async (req, res) => {
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
}

// user auth login
export const login = async (req, res) => {
    try {
        // find user
        const user = await USER.findOne({ email: req.body.email })

        // show if user is not available or exist
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // encrypt the username & hashed password using bcrypt
        const compareEmail = req.body.email;
        if (compareEmail !== user.email) {
            return res.status(404).json({ message: "Email not found!" });
        }

        const comparePassword = await bcrypt.compare(req.body.password, user.password)
        if (!comparePassword) {
            return res.status(404).json({ message: "Password not matched!" });
        }

        // send token with expire time
        const token = jwt.sign({ _id: user.id, username: user.username, email: user.email },
            process.env.SECRET, { expiresIn: "3d" }
        )

        // In your login route
        console.log("Token:", token);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        });

        console.log("Cookies:", req.cookies);

        res.status(200).json({ message: "Login successfully!!", token, user: { _id: user.id, username: user.username, email: user.email } });


    } catch (error) {
        // catch error and send as json
        res.status(500).json({
            success: false, message: `Something went wrong ! error is : ${error}`
        })
    }
}

// user logout
export const logout = async (req, res) => {
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
}

