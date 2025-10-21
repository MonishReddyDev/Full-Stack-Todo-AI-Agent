import express from "express";
import { handleAgentConversation } from "../controllers/Agent-Todo.js";


const router = express.Router();

// POST /api/agent
router.post("/", async (req, res) => {
    try {
        const { message, history } = req.body;
        const result = await handleAgentConversation(message, history || []);
        res.json(result);
    } catch (error) {
        console.error("Agent error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
