import Todo from "../models/Todo.js";

// @desc    Get all todos
// @route   GET /api/todos
export const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: todos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new todo
// @route   POST /api/todos
export const createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const todo = await Todo.create({ title, description });
        res.status(201).json({ success: true, data: todo });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
export const updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!todo) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }
        res.status(200).json({ success: true, data: todo });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
export const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }
        res.status(200).json({ success: true, message: "Todo deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
