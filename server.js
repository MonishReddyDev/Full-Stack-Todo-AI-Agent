import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv"
dotenv.config()
import todoRoutes from './routes/todoRoutes.js'
import cors from "cors";
import agentRoutes from "./routes/AgentRoute.js"
import path from "path";



const __dirname = path.resolve();
const app = express();



app.use(cors());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));
// Middleware to parse JSON
app.use(express.json());


// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Routes
app.use("/api/agent", agentRoutes);



// Routes
app.use("/api/todos", todoRoutes);


// Server port
const PORT = process.env.PORT || 3000;


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
