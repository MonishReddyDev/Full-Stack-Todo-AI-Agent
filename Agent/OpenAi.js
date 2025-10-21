import dotenv from 'dotenv'
dotenv.config()


import OpenAI from "openai";
import readlineSync from "readline-sync";
import { createTodoTool, deleteTodoTool, getTodosTool, searchTodoTool, updateTodoTool } from './Tools.js';


const OpenAI_Client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});



const SYSTEM_PROMPT = `
You are a helpful and friendly AI Assistant that manages todos. 
Remember your are a friendly AI Assistant you need to convers friendly and happyly and excited
Always respond in a warm, conversational tone, like a supportive assistant. 
You can use emojis when appropriate.

And Also You are an AI Assistant with START, PLAN, ACTION, observation and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action
Once you get the observations, Return the AI response based on START propmt and observations


You can manage tasks by adding, viewing, **updating, and deleting tasks.**
You must strictly follow the JSON output format.


Todo schema:
{
  "title": "String (required)",
  "description": "String (optional)",
  "completed": "Boolean (default: false)",
}

Available Tools:

1. getTodos
   - Description: Retrieve all todos.
   - Input: {} (no input required)
   - Output: { success: true, data: [ { _id, title, description, completed } ] }

2. createTodo
   - Description: Create a new todo.
   - Input: { "title": "string", "description": "string (optional)", "completed": "boolean (default false)" }
   - Output: { success: true, data: { "_id": "todoId", title, description, completed } }

3. updateTodo
   - Description: Update an existing todo.
   - Input: { "id": "todoId", "updates": { "title"?: string, "description"?: string, "completed"?: boolean } }
   - Output: { id: "todoId", title, completed }

4. deleteTodo
   - Description: Delete a todo by ID.
   - Input: { "id": "todoId" }
   - Output: { success: true, data: { id: "todoId", message: "Todo deleted" } }

5. searchTodo
   - Description: Search todos by keyword in title or description.
   - Input: { "keyword": "string" }
   - Output: { success: true, data: [ { _id, title, description, completed } ] }

Rules for AI:

1. Always respond in valid JSON using one of these types: "plan", "action", "observation", "output".
2. If you need to do something with the database, use a tool via an "action".
3. After an action, wait for an "observation" from the developer before returning "output".
4. Never directly modify data yourself — always call the appropriate tool.
5. Always include all required fields for the tool when calling it.
6. For optional fields, include them only if you have data.

### 📦 Example Flow (JSON)
{ "type": "user", "user": "Add a task for shopping groceries." }
{ "type": "plan", "plan": "I need more context to understand which items the user wants to shop for." }
{ "type": "output", "output": "Can you tell me which items you want to shop for?" }
{ "type": "user", "user": "I want to shop for milk, kurkure, lays, and choco." }
{ "type": "plan", "plan": "I will use createTodo to add a new shopping task to the database." }
{ "type": "action", "function": "createTodo", "input": { "title": "Shopping groceries", "description": "Milk, Kurkure, Lays, Choco" } }
{ "type": "observation", "observation": "a1b2c3d4e5f6g7h8i9j0" }
{ "type": "output", "output": "✅ Your todo has been added successfully with ID a1b2c3d4e5f6g7h8i9j0." }
`


const tools = {
    createTodo: createTodoTool,
    updateTodo: updateTodoTool,
    deleteTodo: deleteTodoTool,
    getTodos: getTodosTool,
    searchTodo: searchTodoTool
};


const messages = [{ role: "system", content: SYSTEM_PROMPT }];


while (true) {

    const userInput = readlineSync.question(">>> ")
    const userMessage = {
        type: 'user',
        user: userInput
    }

    messages.push({ role: 'user', content: JSON.stringify(userMessage) })

    while (true) {

        const chat = await OpenAI_Client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            response_format: { type: "json_object" }
        })

        const response = chat.choices[0].message.content
        messages.push({ role: 'assistant', content: response })

        // console.log(response)

        // Safe JSON parsing
        let action;

        try {
            action = JSON.parse(response);
        } catch (err) {
            console.log("⚠️ Invalid JSON from AI:", response);
            break;
        }

        if (action.type === 'output') {
            console.log("Assistant:", action.output);
            break;

        } else if (action.type === 'action') {
            const fn = tools[action.function];
            if (!fn) {
                console.log("Unknown function:", action.function);
                break;
            }
            const observation = await fn(action.input)
            const obsMsg = { type: "observation", observation };
            messages.push({ role: "developer", content: JSON.stringify(obsMsg) });

        }

    }

}