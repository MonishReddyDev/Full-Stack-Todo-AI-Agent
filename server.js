import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv"
dotenv.config()
import todoRoutes from './routes/todoRoutes.js'
import cors from "cors";
import agentRoutes from "./routes/AgentRoute.js"
import path from "path";
import rateLimit from "express-rate-limit";


const __dirname = path.resolve();
const app = express();



app.use(cors());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));
// Middleware to parse JSON
app.use(express.json());


// Connect to MongoDB
connectDB();

// --- Rate Limiter for /api/agent --- //
const agentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 2 requests per window
    message: { error: "Sorry,Out of tokens. Please wait 1 hour before trying again." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,   // Disable `X-RateLimit-*` headers
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Routes
app.use("/api/agent", agentLimiter, agentRoutes);



// Routes
app.use("/api/todos", todoRoutes);


// Server port
const PORT = process.env.PORT || 3000;


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
