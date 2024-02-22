// dependencies
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import { readFileSync } from "fs";

// route
import userAuthRouter from "./routes/userAuth.Route.js"

// configs
dotenv.config();
const PORT = process.env.PORT;
const CONNECTION_URL = process.env.CONNECTION_URL;
const app = express();

// primary middlewares
// Enable CORS for all routes
app.use(cors());
app.use(express.urlencoded({ limit: "500mb", extended: false }));
app.use(express.json({ limit: "500mb" }));

// MVC routes
app.use("/api/v1/userAuth", userAuthRouter);

// Catch-all route
app.use("/", (req, res) => {
    try {
        // Assuming the file is in the same directory as your server file
        const content = readFileSync("static.html", { encoding: "utf-8" })
        res.status(200).send(content);
    } catch (error) {
        console.error('Error reading HTML file:', error);
        res.status(500).send('Internal Server Error');
    }
});

// connections
mongoose.connect(CONNECTION_URL).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening in the Port: ${PORT}`)
    })
}).catch((err) => {
    console.log(err)
})