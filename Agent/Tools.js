import Todo from '../models/Todo.js'
import connectDB from "../config/db.js"

connectDB()

// Get all todos
export const getTodosTool = async () => {
    try {
        const todos = await Todo.find();
        return { success: true, data: todos };
    } catch (error) {
        return { success: false, error: error.message };
    }
};



// Create a new todo
export const createTodoTool = async ({ title, description, completed = false }) => {
    try {
        const todo = await Todo.create({ title, description, completed });
        return { success: true, data: todo }; // include todo._id
    } catch (error) {
        return { success: false, error: error.message };
    }
};


// Update a todo (simplified observation)
export const updateTodoTool = async ({ id, updates }) => {
    try {
        const todo = await Todo.findByIdAndUpdate(id, updates, { new: true });
        if (!todo) return { id, error: "Todo not found" };

        // Return simplified observation
        return {
            id: todo._id.toString(),
            title: todo.title,
            completed: todo.completed
        };
    } catch (error) {
        return { id, error: error.message };
    }
};

// Delete a todo
export const deleteTodoTool = async ({ id }) => {
    try {
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) return { success: false, error: "Todo not found" };
        return { success: true, data: { id: todo._id, message: "Todo deleted" } };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Search todos by keyword in title or description
export const searchTodoTool = async ({ keyword }) => {
    try {
        const todos = await Todo.find({
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        });
        return { success: true, data: todos };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
