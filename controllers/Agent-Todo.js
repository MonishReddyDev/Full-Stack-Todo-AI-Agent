import { SYSTEM_PROMPT } from "../Agent/prompt.js";
import OpenAI from "openai";
import {
    createTodoTool,
    deleteTodoTool,
    getTodosTool,
    searchTodoTool,
    updateTodoTool,
} from "../Agent/Tools.js"

const OpenAI_Client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



const tools = {
    createTodo: createTodoTool,
    updateTodo: updateTodoTool,
    deleteTodo: deleteTodoTool,
    getTodos: getTodosTool,
    searchTodo: searchTodoTool,
};


export async function handleAgentConversation(userInput, history = []) {
    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: JSON.stringify({ type: "user", user: userInput }) },
    ];

    while (true) {
        const chat = await OpenAI_Client.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            response_format: { type: "json_object" },
        });

        const response = chat.choices[0].message.content;
        let action;

        try {
            action = JSON.parse(response);
        } catch {
            return { type: "error", output: "Invalid JSON from AI." };
        }

        messages.push({ role: "assistant", content: response });

        if (action.type === "output") return action;

        if (action.type === "action") {
            const fn = tools[action.function];
            if (!fn) return { type: "error", output: `Unknown tool: ${action.function}` };

            const observation = await fn(action.input);
            messages.push({
                role: "developer",
                content: JSON.stringify({ type: "observation", observation }),
            });
        }
    }
}
