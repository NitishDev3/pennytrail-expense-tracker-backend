const express = require('express');
const Expense = require('../model/expenseModel');
const userAuth = require('../middleware/auth');

const expenseRouter = express.Router();


expenseRouter.post('/add', userAuth, async (req, res) => {
    try {
        const { amount, category, date, description } = req.body;
        // Validate the request body
        if (!amount || !category || !date || !description) {
            return res.status(400).json({ message: 'Amount, category, date, and description are required' });
        }
        // Validate the category
        const validCategories = [
            'Food & Groceries',
            'Transport',
            'Lifestyle',
            'Utilities & Bills',
            'Health',
            'Others',
        ];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const userId = req.user._id; // Get the user ID from the authenticated user
        const newExpense = new Expense({ userId, amount, category, date, description });
        await newExpense.save();
        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


expenseRouter.get('/get', userAuth, async (req, res) => {
    try {
        const userId = req.user._id; // Get the user ID from the authenticated user
        const expenses = await Expense.find({ userId });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

expenseRouter.delete('/delete/:id', userAuth, async (req, res) => {
    try {
        const userId = req.user._id; // Get the user ID from the authenticated user
        // Validate the request parameters
        if (!req.params.id) {
            return res.status(400).json({ message: 'Expense ID is required' });
        }
        // validate if expense id belongs to the user
        const expense = await Expense.findOne({ _id: req.params.id, userId });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const expenseId = req.params.id;
        const deletedExpense = await Expense.findOneAndDelete({ _id: expenseId, userId });
        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);

expenseRouter.put('/update/:id', userAuth, async (req, res) => {
    try {
        const userId = req.user._id; // Get the user ID from the authenticated user
        // Validate the request parameters
        if (!req.params.id) {
            return res.status(400).json({ message: 'Expense ID is required' });
        }
        // Validate if expense ID belongs to the user
        const expense = await Expense.findOne({ _id: req.params.id, userId });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const { amount, category, date, description } = req.body;
        // Validate the request body
        if (!amount || !category || !date || !description) {
            return res.status(400).json({ message: 'Amount, category, date, and description are required' });
        }
        // Validate the category
        const validCategories = [
            'Food & Groceries',
            'Transport',
            'Lifestyle',
            'Utilities & Bills',
            'Health',
            'Others',
        ];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId },
            { amount, category, date, description },
            { new: true }
        );
        res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);


module.exports = expenseRouter;
